# ADR 0004: Strict Fail-Fast Cart Calculations and Integer-Cents Monetary Representation

## Status

`Accepted` *(Retrospective record documenting existing pricing and cart calculation invariants)*

## Date

2026-11-13

## Context

E-commerce applications frequently suffer from two classes of financial and state-integrity defects:

1. **Floating-Point Rounding Drift:** Representing USD prices as IEEE 754 floating-point numbers (e.g., `49.99 * 3 = 149.97000000000003` or `24.99 + 49.99 = 74.97999999999999`) introduces subtle cent discrepancies in subtotals, taxes, and payment payloads.
2. **Silent Data-Corruption Masking:** If a subtotal calculation function (`calculateCartTotals`) silently skips cart items whose `productId` or `variantSku` cannot be found in `products`, bugs in cart addition, catalog synchronization, or state management go undetected while presenting incorrect order totals to shoppers.

In the existing codebase (`src/features/products/types.ts`, `src/features/products/data.ts`, `src/features/cart/calculateCartTotals.ts`, `src/App.tsx`, `src/features/products/components/ProductCard.tsx`), ShopAI establishes explicit contracts for both monetary units and calculation strictness.

## Decision Drivers

- **Exact Arithmetic:** Eliminate binary floating-point rounding errors in price multiplication and cart subtotal aggregation.
- **Fail-Fast Invariant Enforcement:** Surface invalid `productId` or `variantSku` references immediately rather than computing silently wrong totals.
- **Separation of Calculation and Formatting:** Keep domain calculations numeric and locale-agnostic, deferring currency formatting to the UI layer.
- **Independent Unit Testability:** Ensure calculation functions accept explicit `(cartItems, products)` arguments with no hidden imports or global state (`ADR 0001`).

## Options Considered

### Option 1: Integer Cents (`priceCents` / `subtotalCents`) with Strict `calculateCartTotals()` (Selected)

Store product prices as integer minor units (`priceCents: number`), compute integer `subtotalCents` inside `calculateCartTotals(cartItems, products)`, throw descriptive `Error`s on missing products or variants, and format via `Intl.NumberFormat` only in JSX (`App.tsx`, `ProductCard.tsx`).

- **Advantages:**
  - Exact integer addition and multiplication (`product.priceCents * item.quantity`) with zero floating-point drift.
  - Strict validation ensures bugs in internal cart flows fail loudly during development and tests.
  - Explicit `(cartItems, products)` signature makes unit testing with custom fixtures trivial (`calculateCartTotals.test.ts`).
- **Disadvantages:**
  - Requires converting to major units (`/ 100`) at every UI display point (`Intl.NumberFormat(...).format(cents / 100)`).
  - Throws immediately if any caller passes unvalidated external data directly into `calculateCartTotals()` without first sanitizing at the boundary (as addressed by `loadCart(products)` in ADR 0003).
  - Assumes USD-like two-decimal minor units (`100` cents per unit) if multi-currency support is later introduced.

### Option 2: Floating-Point Dollar Amounts (`price: number`) with Lenient Totals

Store prices as decimal dollars (`49.99`) and skip/ignore unknown products or SKUs inside `calculateCartTotals()`.

- **Advantages:**
  - Slightly less conversion math at UI formatting sites.
  - Tolerates mismatched cart/catalog state without throwing.
- **Disadvantages:**
  - Susceptible to IEEE 754 precision errors (`0.1 + 0.2 !== 0.3`), requiring defensive `Math.round(x * 100) / 100` workarounds.
  - Silently undercharges or omits items if cart state ever desynchronizes from catalog data, hiding real bugs.

### Option 3: Dedicated Money/Decimal Library (e.g., `dinero.js` or `decimal.js`)

Introduce a third-party monetary arithmetic library for all price and subtotal operations.

- **Advantages:**
  - Built-in support for currencies with differing minor-unit exponents (e.g., JPY vs USD) and rounding modes.
- **Disadvantages:**
  - Unnecessary runtime dependency overhead for a single-currency (`USD`) storefront without tax, shipping, or FX conversion rules yet.

## Decision

ShopAI enforces two complementary domain calculation invariants:

1. **Integer-Cents Monetary Representation:** All stored and computed prices use integer minor units (`Product.priceCents` and `CartTotals.subtotalCents`). Currency formatting (`new Intl.NumberFormat("en-US", { style: "currency", currency })`) occurs strictly in presentation components (`ProductCard.tsx`, `App.tsx`) by dividing by `100` at render time.
2. **Strict Fail-Fast `calculateCartTotals()` Contract:** `calculateCartTotals(cartItems, products)` requires every `CartItem` to resolve to a valid `Product` and `ProductVariant`; otherwise it throws `Product not found for productId: ...` or `Variant not found for SKU: ...`. Untrusted external inputs (such as `localStorage`) must be sanitized at the system boundary (`loadCart(products)` / `reconcileCartItems()`) before reaching `calculateCartTotals()`.

## Rationale

Keeping `calculateCartTotals()` strict enforces defense-in-depth cleanly: the persistence boundary (`cartStorage.ts`) guarantees data integrity for untrusted inputs, while internal domain math (`calculateCartTotals.ts`) guarantees that internal bugs never fail silently. Storing integer cents avoids floating-point rounding bugs with zero external dependencies and matches standard payment-processor APIs (e.g., Stripe's integer minor-unit amounts).

## Trade-offs and Consequences

- **Positive:**
  - Deterministic, exact subtotal math verified by unit tests (`4999 * 3 = 14997`).
  - Clean boundary between untrusted-input sanitization (`ADR 0003`) and strict domain calculation.
  - Alignment with future server/payment APIs that operate in integer cents.
- **Negative / Cost:**
  - Any new data ingress (URL-shared carts, server cart sync, import tools) must pass through catalog reconciliation before entering state read by `calculateCartTotals()`.
  - Display formatting (`priceCents / 100`) is currently duplicated between `ProductCard.tsx` and `App.tsx` rather than centralized in a shared currency formatter helper.
  - `calculateCartTotals.ts` currently supports uniform two-decimal currencies (`USD`); zero-decimal currencies (e.g., `JPY`) would require currency exponent metadata.
- **Future Architectural Impact:**
  - Adding discounts, taxes, or shipping calculations can build cleanly atop integer-cent arithmetic with explicit rounding rules.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **New external input path bypasses reconciliation** and crashes `calculateCartTotals()` | High | Route all untrusted or asynchronous cart sources through `reconcileCartItems()` before committing to React state. |
| **Inconsistent currency formatting across components** (`ProductCard.tsx` vs `App.tsx`) | Low | Extract a pure `formatCurrency(cents, currency)` helper when additional price displays (line totals, checkout summary, discounts) are added. |
| **Hardcoded `/ 100` divisor fails for non-2-decimal currencies** | Low (USD only today) | Introduce currency-aware minor-unit scaling or a money library if multi-currency checkout becomes a requirement. |

## Validation

- **`src/features/cart/calculateCartTotals.test.ts` (8 tests):** Verifies empty cart totals, single- and multi-item integer-cent subtotals, multi-variant aggregation, throwing on missing `productId`, throwing on missing `variantSku`, and input immutability.
- **`src/features/products/data.test.ts`:** Verifies positive integer-style product pricing across the catalog dataset.
- **`src/App.test.tsx`:** Verifies formatted currency output (`$49.99`, etc.) and confirms stale persisted carts no longer trigger `calculateCartTotals` errors during `App` startup.

## Review Triggers

Revisit or supersede this ADR when any of the following occur:

1. **Multi-Currency Storefront:** Supporting currencies with 0 or 3 decimal places (e.g., `JPY`, `KWD`) or live exchange rates.
2. **Checkout, Tax, and Promotional Engine:** Introducing percentage discounts, tax calculation, or shipping tiers requiring formal rounding policies.
3. **Async Cart/Catalog Loading:** When `cartItems` may render in a pending/reconciling state before `products` has loaded from an API.

## References and Evidence

- `src/features/products/types.ts` — `Product` interface defining `priceCents: number` and `currency: string`.
- `src/features/products/data.ts` — Catalog items priced in integer cents (e.g., `4999`, `2499`, `6499`, `8999`, `5499`).
- `src/features/cart/calculateCartTotals.ts` — Strict `totalQuantity` and `subtotalCents` calculation throwing on missing product or variant references.
- `src/features/cart/calculateCartTotals.test.ts` — Unit tests asserting exact integer-cent math and throw behavior.
- `src/features/products/components/ProductCard.tsx` & `src/App.tsx` — UI-layer `Intl.NumberFormat` currency formatting (`cents / 100`).
- `docs/decisions/0001-first-architectural-decision.md` — Separation of pure domain logic from UI components.
- `docs/decisions/0003-versioned-localstorage-cart-persistence-and-reconciliation.md` — Boundary sanitization preserving strict calculation contracts.
