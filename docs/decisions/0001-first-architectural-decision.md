# ADR 0001: Separate Pure Domain Logic and Side-Effect Boundaries from React UI Components

## Status

`Accepted`

## Date

2026-11-12

## Context

ShopPilot AI (ShopAI) is a client-side e-commerce Single Page Application (SPA) built with React 19, TypeScript 6, Vite 8, and CSS3 (`package.json`, `vite.config.ts`, `src/main.tsx`). The application currently operates without a backend server or external state-management library; it renders a product catalog, variant selection controls (color and size), search/category/sort filtering, and a persistent shopping cart backed by browser `localStorage`.

As e-commerce logic grows—including variant SKU lookup, stock ceiling enforcement, immutable cart updates, integer-cents subtotal calculations, and resilient `localStorage` serialization—embedding business rules directly inside React components (`src/App.tsx` and `src/features/products/components/ProductCard.tsx`) creates several problems:

1. **Coupled Testing:** Business rules mixed into JSX event handlers cannot be tested without mounting React trees and simulating DOM events via `jsdom` and React Testing Library.
2. **State Mutation & Edge-Case Bugs:** Cart mutations, stock boundary checks, and malformed `localStorage` payloads are error-prone when scattered across `setState` callbacks.
3. **Future Backend Migration Friction:** When static catalog data (`src/features/products/data.ts`) and browser persistence (`localStorage`) eventually move to server APIs, domain rules tangled with component hooks are harder to extract, reuse, or share.

The codebase therefore needs a clear boundary between React presentation/orchestration and core e-commerce domain rules.

## Decision Drivers

- **Unit Testability Without DOM Overhead:** Core cart and inventory rules should execute deterministically as pure TypeScript functions under Vitest.
- **Immutability and Predictable React State:** Cart state transformations must never mutate existing arrays or objects in place.
- **Explicit Domain Contracts:** TypeScript types (`Product`, `ProductVariant`, `CartItem`, `AvailabilityStatus`) should serve as strict boundaries between data, logic, and UI.
- **Resilient Side-Effect Isolation:** Browser APIs (`window.localStorage`, `JSON.parse`, `JSON.stringify`) must be isolated from React render paths so storage errors or corrupt data never crash the UI.
- **Zero Extra Runtime Dependencies:** Achieve clean separation using standard TypeScript modules organized by feature rather than introducing Redux, Zustand, or Zod at this stage.

## Options Considered

### Option 1: Feature-Scoped Pure Domain Modules with Thin React Orchestration (Selected)

Organize domain types, pure business functions, and isolated browser storage adapters into dedicated TypeScript modules under `src/features/<feature>/`, while keeping React components (`App.tsx`, `ProductCard.tsx`) focused on local UI state, event wiring, and accessible rendering.

- **Advantages:**
  - Pure functions (`addToCart`, `updateCartQuantity`, `removeFromCart`, `calculateCartTotals`, `checkAvailability`) run in milliseconds with zero React/DOM setup.
  - Side effects (`localStorage` access and runtime validation in `cartStorage.ts`) are isolated behind explicit `loadCart()` and `saveCart()` interfaces.
  - Enforces immutable state transitions that align naturally with React `useState` updates.
  - Zero external library overhead or boilerplate.
- **Disadvantages:**
  - Requires discipline to avoid letting new logic drift back into `App.tsx` (as currently seen with catalog search, category filtering, and sorting still living inline in `src/App.tsx`).
  - Component prop/callback wiring in `App.tsx` grows as more feature helpers are coordinated from the root component.

### Option 2: Co-Locate Business Logic Directly Inside React Components and Custom Hooks

Keep cart calculations, variant stock lookups, and `localStorage` parsing inside `App.tsx`, `ProductCard.tsx`, or React-specific hooks (`useCart`, `useProducts`).

- **Advantages:**
  - Fewer files to navigate for very small prototypes.
  - Direct access to React state setters without designing pure function signatures.
- **Disadvantages:**
  - Forces DOM/React rendering (`@testing-library/react`) to test purely mathematical or rule-based invariants (e.g., stock limits or subtotal calculations).
  - Increases risk of accidental state mutation or mixing UI concerns (error messages, formatting) with core invariants.
  - Harder to reuse domain logic in future server-side routes, workers, or validation layers.

### Option 3: Adopt an External State Management Library (e.g., Redux Toolkit or Zustand)

Move all catalog, filter, and cart state into a global store external to React component trees.

- **Advantages:**
  - Eliminates prop drilling as the component tree deepens.
  - Provides built-in middleware patterns for persistence and devtools inspection.
- **Disadvantages:**
  - Introduces unnecessary runtime dependencies and architectural boilerplate for a single-page application with two features (`products` and `cart`).
  - Does not inherently enforce pure, testable domain functions unless slices/reducers are still factored carefully.

## Decision

ShopAI adopts **feature-scoped pure TypeScript domain modules** under `src/features/products/` and `src/features/cart/`, keeping React components (`src/App.tsx`, `src/features/products/components/ProductCard.tsx`) responsible strictly for UI state orchestration, presentation, and user interaction.

Specifically:

1. **Pure Domain Functions:** Inventory checks (`checkAvailability`), cart line mutations (`addToCart`, `updateCartQuantity`, `removeFromCart`), and pricing calculations (`calculateCartTotals` using integer cents via `priceCents` and `subtotalCents`) are implemented as pure, immutable functions that take plain typed inputs and return deterministic outputs.
2. **Isolated Side-Effect Boundary:** Browser persistence (`src/features/cart/cartStorage.ts`) encapsulates the versioned storage key (`shoppilot_cart_v1`), runtime type guard (`isValidCartItem`), JSON serialization/deserialization, and `try/catch` failure handling outside React components.
3. **Thin React Orchestrators:** `src/App.tsx` initializes `cartItems` lazily via `loadCart()`, synchronizes changes via `useEffect(() => saveCart(cartItems), [cartItems])`, and delegates state transitions to the pure cart helpers. `ProductCard.tsx` delegates variant stock status to `checkAvailability()`.

## Rationale

This architecture matches ShopAI's current scope while upholding production engineering standards:

- Every business invariant—such as preventing cart quantities from dropping below `1` or exceeding `variant.stock`, merging duplicate SKUs on add, or rejecting corrupt `localStorage` entries—is verified directly by fast unit tests without rendering JSX.
- Keeping `App.tsx` as the single state coordinator avoids premature global-store complexity while preserving a clean path to extract a `useCart` hook, React Context, or API client later without rewriting domain rules.
- Using integer cents (`priceCents`, `subtotalCents`) inside pure calculation modules eliminates floating-point precision defects before values reach `Intl.NumberFormat` in the UI.

## Trade-offs and Consequences

- **Positive:**
  - **High Test Velocity & Isolation:** 7 of 10 test suites test pure TypeScript modules or isolated storage adapters directly, while UI suites (`App.test.tsx`, `App.empty.test.tsx`, `ProductCard.test.tsx`) focus on rendering, accessibility roles, filtering, and persistence integration.
  - **Framework Portability:** Core cart and availability modules have zero imports from `react` or `react-dom`.
  - **Resilient Persistence:** Runtime validation (`isValidCartItem`) prevents corrupted `localStorage` data from breaking `App` initialization.
- **Negative / Cost:**
  - **Manual Coordination in `App.tsx`:** `App.tsx` (~460 lines) currently coordinates cart handlers, status messages, and inline catalog search/category/sort derivation. While cart and availability rules are extracted, catalog filtering and sorting remain inline in `App.tsx`.
  - **Minor Naming / Defensive-Boundary Gaps:** Existing files show minor inconsistencies typical of incremental development—for example, lowercase filename `removefromcart.ts` versus camelCase siblings (`addToCart.ts`, `updateCartQuantity.ts`), and `calculateCartTotals()` throwing an `Error` if a persisted `CartItem` references a `productId` or `variantSku` no longer present in `products`.
- **Future Architectural Impact:**
  - Moving from static `src/features/products/data.ts` to async API fetching will require handling loading/error states and stale persisted SKUs, which can be layered into the boundary without rewriting `addToCart` or `updateCartQuantity`.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Domain logic drifting back into `App.tsx`** (e.g., inline search/filter/sort logic growing more complex) | Medium | Extract pure catalog query helpers (e.g., `filterAndSortProducts`) into `src/features/products/` when filtering rules expand. |
| **Stale persisted `CartItem` crashing `calculateCartTotals`** if a product or SKU is removed from `data.ts` | High | `calculateCartTotals.ts` currently throws on unknown `productId` or `variantSku`. Reconcile loaded cart items against active catalog SKUs before rendering or computing totals when catalog data becomes dynamic. |
| **Prop drilling as component hierarchy deepens** (e.g., dedicated Cart drawer, Checkout page, or Header cart badge) | Medium | Keep pure domain modules untouched and introduce a `CartContext` or custom `useCart` hook when >2–3 component levels consume cart state. |
| **File naming drift across feature modules** (e.g., `removefromcart.ts`) | Low | Standardize on camelCase filenames for utility modules in future refactors and new features. |

## Validation

This decision is continuously validated through the repository's automated verification pipeline (`package.json`, `tsconfig.app.json`, `eslint.config.js`):

- **Pure Domain Unit Tests (`vitest run`):**
  - `src/features/products/checkAvailability.test.ts` — verifies `"in-stock"`, `"out-of-stock"`, and `"unavailable"` variant resolution.
  - `src/features/products/data.test.ts` — validates catalog structure, SKUs, stock counts, and image paths.
  - `src/features/cart/addToCart.test.ts` — verifies variant merging, separate line creation, and input immutability.
  - `src/features/cart/updateCartQuantity.test.ts` — verifies minimum (`1`) and `maxStock` bounds.
  - `src/features/cart/removefromcart.test.ts` — verifies immutable line removal.
  - `src/features/cart/calculateCartTotals.test.ts` — verifies `totalQuantity`, `subtotalCents`, and missing-item error handling.
  - `src/features/cart/cartStorage.test.ts` — verifies versioned key, `isValidCartItem`, malformed JSON handling, and storage exception resilience.
- **UI & Integration Tests (`@testing-library/react`):**
  - `src/features/products/components/ProductCard.test.tsx`, `src/App.test.tsx`, and `src/App.empty.test.tsx` verify UI behavior, accessibility semantics, and `localStorage` persistence flows.
- **Static Analysis & Type Checking:**
  - `tsc -b` (strict TypeScript build checks including `verbatimModuleSyntax`, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`) and `eslint .` verify compile-time contracts and React Hooks rules.

## Review Triggers

Revisit or supersede this ADR if any of the following conditions occur:

1. **Multi-View Navigation or Deep Component Trees:** Introducing client-side routing (`react-router`) or a separate checkout/header cart indicator where passing callbacks from `App.tsx` becomes unwieldy.
2. **Backend Catalog & Server-Authoritative Inventory:** Replacing `src/features/products/data.ts` with remote API calls, requiring async cache state, optimistic updates, or server-side cart/pricing reconciliation.
3. **Catalog Filtering Complexity:** Expanding search/filter/sort in `App.tsx` (e.g., price ranges, multi-select attributes, URL query synchronization) to the point where inline filtering should be extracted into a dedicated pure module.

## References and Evidence

- `package.json` — Scripts (`dev`, `build`, `lint`, `test`) and minimal runtime dependencies (`react`, `react-dom`).
- `tsconfig.app.json` — Compiler strictness settings (`verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`).
- `src/App.tsx` — Root component orchestrating catalog state, lazy `loadCart()` initialization, `useEffect` persistence, and delegation to pure helpers.
- `src/features/products/types.ts` — `Product` and `ProductVariant` domain types.
- `src/features/products/data.ts` — Static product catalog dataset using integer `priceCents`.
- `src/features/products/checkAvailability.ts` — Pure variant availability logic.
- `src/features/products/components/ProductCard.tsx` — Presentation component delegating availability checks to `checkAvailability`.
- `src/features/cart/types.ts` — Minimal persisted `CartItem` contract (`productId`, `variantSku`, `quantity`).
- `src/features/cart/addToCart.ts` — Pure immutable cart-line addition/merging logic.
- `src/features/cart/updateCartQuantity.ts` — Pure bounded quantity adjustment logic.
- `src/features/cart/removefromcart.ts` — Pure immutable cart-line removal logic.
- `src/features/cart/calculateCartTotals.ts` — Pure cart aggregation (`totalQuantity`, `subtotalCents`).
- `src/features/cart/cartStorage.ts` — Versioned `localStorage` adapter (`CART_STORAGE_KEY`, `isValidCartItem`, `loadCart`, `saveCart`).
- `README.md` — Existing documentation highlighting separation of concerns and pure TypeScript cart helpers.
