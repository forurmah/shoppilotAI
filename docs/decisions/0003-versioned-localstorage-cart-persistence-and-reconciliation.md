# ADR 0003: Versioned `localStorage` Cart Persistence with Boundary Reconciliation Against Stale Catalog Data

## Status

`Accepted` *(Retrospective record documenting the existing cart persistence and hydration design)*

## Date

2026-11-13

## Context

ShopPilot AI runs entirely in the browser without user accounts or a backend session store. Originally, `cartItems` lived strictly in React `useState([])`, meaning any page reload wiped the customer's cart. Adding browser persistence via `window.localStorage` solved reload loss, but immediately introduced a classic client-side data integrity hazard:

1. **Persisted Data Outlives Code & Catalog Deployments:** A user's `localStorage` may retain `CartItem` records after a product is deleted, a variant SKU is renamed or removed, or a variant's `stock` decreases to `0` or below the saved quantity.
2. **Untrusted Browser Storage:** Users, extensions, or older app versions can leave malformed JSON, non-array payloads, missing fields, invalid quantities (`0`, negative, floats, `NaN`), or duplicate `(productId, variantSku)` lines in `localStorage`.
3. **Strict Downstream Calculations:** `calculateCartTotals()` (`src/features/cart/calculateCartTotals.ts`) throws if given an unknown `productId` or `variantSku`. Allowing stale persisted data into `cartItems` crashes the application during initial render.

The persistence layer therefore needed clear rules for what gets stored, how it is versioned, and how untrusted persisted state is sanitized before entering React state.

## Decision Drivers

- **Survive Page Refreshes Without a Backend:** Preserve cart contents across browser reloads using standard Web Storage.
- **Single Source of Truth for Catalog Data:** Never duplicate prices, product names, or stock counts into `localStorage` where they can go stale.
- **Fail-Safe Hydration:** Never crash `App` on corrupt JSON, inaccessible `localStorage` (e.g., private browsing or quota errors), removed products/SKUs, zero-stock variants, or over-stock quantities.
- **Preserve Strict Internal Domain Logic:** Keep `calculateCartTotals()` strict rather than hiding bugs inside calculation helpers.
- **Forward Schema Compatibility:** Support future breaking changes to the stored cart format via an explicit storage key version.

## Options Considered

### Option 1: Versioned Minimal-Reference Persistence with Catalog Reconciliation at Load Time (Selected)

Store only `{ productId, variantSku, quantity }` under a versioned `localStorage` key (`shoppilot_cart_v1`), lazily load and reconcile entries against the active `products` catalog in `loadCart(products)` via `reconcileCartItems()`, and persist changes via `useEffect`.

- **Advantages:**
  - Prices, titles, images, and stock limits always come live from the current catalog (`products`), preventing stale pricing in storage.
  - `isValidCartItem()` and `reconcileCartItems()` sanitize untrusted storage data at the boundary before it enters React state.
  - Storage exceptions (`QuotaExceededError`, `SecurityError`, malformed JSON) fail gracefully without crashing the UI.
  - Easy to evolve to `shoppilot_cart_v2` if the persisted schema changes.
- **Disadvantages:**
  - Pruned or quantity-clamped items are adjusted silently during hydration without notifying the user.
  - Calling `saveCart(cartItems)` inside `useEffect` on mount writes `[]` to `localStorage` even when the cart starts empty.
  - Assumes the product catalog (`products`) is synchronously available during `useState(() => loadCart(products))` initialization.

### Option 2: Store Full Product Snapshots and Derived Totals in `localStorage`

Serialize complete `Product` objects, `subtotalCents`, and search/filter state alongside cart quantities.

- **Advantages:**
  - Totals could be displayed before catalog lookup.
- **Disadvantages:**
  - Persists stale prices, outdated descriptions, and obsolete stock counts across catalog updates.
  - Bloats storage payload and duplicates derived data (`calculateCartTotals`) that should be computed from authoritative catalog prices.

### Option 3: Skip Boundary Validation and Make `calculateCartTotals()` Tolerant of Missing Products

Load raw `JSON.parse()` output directly into `cartItems` and change `calculateCartTotals()` to ignore unknown products or SKUs.

- **Advantages:**
  - Slightly less code in `cartStorage.ts`.
- **Disadvantages:**
  - Violates fail-fast invariants in domain calculations, masking programming bugs in `handleAddToCart` or `updateCartQuantity`.
  - Still leaves ghost cart lines in React state (`cartItems`) with `"Unknown product"` / `"Unavailable"` stock in the UI and invalid quantities exceeding stock.

## Decision

ShopAI persists shopping cart items in `window.localStorage` through an isolated persistence boundary (`src/features/cart/cartStorage.ts`) using:

1. **Versioned Storage Key:** `CART_STORAGE_KEY = "shoppilot_cart_v1"`.
2. **Minimal Persisted Schema:** Only `CartItem[]` (`{ productId, variantSku, quantity }`) is persisted. Derived totals (`subtotalCents`, `cartCount`), product catalog records, and catalog UI filters (`searchQuery`, `selectedCategory`, `sortOption`) are explicitly excluded.
3. **Lazy Hydration & Effect Sync in `App.tsx`:** `useState<CartItem[]>(() => loadCart(products))` reads storage once on mount; `useEffect(() => { saveCart(cartItems); }, [cartItems])` persists updates.
4. **Untrusted-Data Boundary Reconciliation (`isValidCartItem` + `reconcileCartItems`):**
   - Rejects non-array JSON, malformed items, empty IDs/SKUs, and non-positive/non-integer quantities.
   - Discards entries referencing nonexistent `productId` or `variantSku`.
   - Discards entries referencing variants with `stock <= 0` (or non-finite stock).
   - Clamps quantities exceeding `variant.stock` to `variant.stock`.
   - Deduplicates repeated `(productId, variantSku)` lines capped at `variant.stock` without mutating inputs.
   - Wraps storage reads/writes and `JSON.parse` in `try/catch` blocks, falling back cleanly (`[]` on read failure, `console.warn` on exception).

## Rationale

Validating and reconciling at the persistence boundary (`loadCart(products)`) establishes a clean trust boundary: everything outside React state (`localStorage`) is untrusted, while everything inside `cartItems` is guaranteed to reference valid, in-stock catalog variants within stock limits. Passing `products` as a parameter to `loadCart(products)` also keeps `cartStorage.ts` decoupled from `src/features/products/data.ts`, consistent with ADR 0001 and `calculateCartTotals()`.

## Trade-offs and Consequences

- **Positive:**
  - Eliminates startup crashes caused by stale SKUs, deleted products, or corrupted browser storage.
  - Prevents stale prices or search filters from persisting across sessions.
  - Reconciled cart state automatically heals `localStorage` on mount via `useEffect`.
- **Negative / Cost:**
  - Silent reconciliation means a user whose saved item went out of stock or dropped in available stock sees the updated cart without an explanatory banner.
  - Initial mount writes `"[]"` to `localStorage` even for a visitor who never added an item.
  - Storage is strictly per-browser/per-origin; carts do not roam across devices.
- **Future Architectural Impact:**
  - When catalog loading becomes asynchronous (API fetch), cart hydration/reconciliation will need to run after catalog data resolves rather than synchronously inside `useState` initialization.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Silent item removal confuses users** when an item sells out between sessions | Medium | Add a non-blocking cart status notice summarizing pruned/clamped items when `reconcileCartItems` changes loaded items (future UX improvement). |
| **Async catalog migration breaks synchronous `loadCart(products)`** | High | Keep `reconcileCartItems(rawItems, products)` as a separate pure function so it can run after an async catalog fetch completes, before computing totals. |
| **Schema changes break existing users' stored carts** | Medium | Increment `CART_STORAGE_KEY` (e.g., `shoppilot_cart_v2`) or add explicit migration logic when `CartItem` fields change. |

## Validation

- **`src/features/cart/cartStorage.test.ts` (22 tests):** Covers `CART_STORAGE_KEY` versioning, `isValidCartItem` type guards, `reconcileCartItems` (valid items, missing products, removed SKUs, zero stock, over-stock clamping, duplicate line merging, empty catalog, immutability), `saveCart` serialization and quota failure handling, and `loadCart` with malformed JSON, unexpected types, and `SecurityError` storage mocks.
- **`src/App.test.tsx`:** Integration tests verify lazy hydration, persistence on add/quantity-update/remove, and crash-free reconciliation of mixed stale/zero-stock/over-stock `localStorage` payloads.

## Review Triggers

Revisit or supersede this ADR when any of the following occur:

1. **Asynchronous Catalog Fetching:** Moving products from static `data.ts` to a remote API where `products` is not synchronously available on first render.
2. **User Authentication & Cross-Device Carts:** Introducing logged-in user accounts or server-side cart persistence.
3. **Cart Schema Evolution:** Adding persisted fields (e.g., gift notes, applied promo codes, or reservation timestamps) to `CartItem`.
4. **User-Facing Reconciliation Notices:** Requiring toast/banner feedback whenever persisted cart items are adjusted due to stock changes.

## References and Evidence

- `src/features/cart/types.ts` — Minimal `CartItem` shape (`productId`, `variantSku`, `quantity`).
- `src/features/cart/cartStorage.ts` — `CART_STORAGE_KEY`, `isValidCartItem`, `reconcileCartItems`, `loadCart`, `saveCart`.
- `src/features/cart/cartStorage.test.ts` — Unit tests for storage resilience and catalog reconciliation.
- `src/App.tsx` — Lazy `useState(() => loadCart(products))` initialization and `useEffect` `saveCart` synchronization.
- `src/App.test.tsx` — End-to-end cart persistence and stale hydration integration tests.
- `docs/decisions/0001-first-architectural-decision.md` — Architectural separation of side-effect boundaries from React UI.
