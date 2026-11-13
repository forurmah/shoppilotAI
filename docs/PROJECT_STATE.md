# ShopPilot AI — Project State Baseline

*Captured: 2026-11-13 (Pre-redesign baseline prior to evolving toward ShopAI SellerHub)*

---

## 1. Current Product Purpose

**ShopPilot AI** is a client-side fashion e-commerce Single Page Application (SPA) built with React, TypeScript, Vite, and plain CSS3. It provides a responsive clothing storefront where shoppers can browse a curated apparel catalog, search and filter products, inspect color/size variant stock availability, and manage a persistent shopping cart stored in browser `localStorage`.

This baseline documents the application before any visual redesign or expansion into **ShopAI SellerHub**.

---

## 2. Current User-Visible Features

### Storefront Navigation & Hero
- **Header (`src/components/Header.tsx`):** Brand link (`ShopPilot AI` -> `#home`) and single-page navigation links (`Home`, `Products`, `About` pointing to `#home`, `#products`, `#about`). Responsive column-to-row switch at `min-width: 768px`.
- **Hero Section (`#home`):** Displays welcome label (`WELCOME TO SHOPPILOT AI`), editorial serif headline (`Find your next favorite outfit.`), short value proposition copy, and primary CTA button (`Explore Products` -> `#products`).

### Product Catalog (`#products`)
- **Live Search (`#product-search`):** Case-insensitive, whitespace-trimmed substring search matching `product.name` or `product.category` (`searchProducts()`).
- **Category Filter (`Filter by category`):** Radio-button group dynamically populated with `"All"` plus unique `product.category` values (`Hoodies`, `T-Shirts`, `Jeans`, `Jackets`, `Sweatshirts`) (`filterProductsByCategory()`).
- **Sorting (`#product-sort`):** Dropdown supporting `default` (`Default order`), `price-low` (`Price: Low to High`), `price-high` (`Price: High to Low`), and `name-az` (`Name: A to Z`) (`sortProducts()`).
- **Result Count & Empty States:** Dynamic count (`N product(s) found`), empty-catalog state (`No products available yet.`), and zero-match search/filter state (`No products match your search. Try a different search or category.`).
- **Responsive Grid:** 4 columns (`> 1100px`), 3 columns (`801px–1100px`), 2 columns (`<= 800px`).

### Product Cards (`src/features/products/components/ProductCard.tsx`)
- Renders primary product image (`product.images[0]`, `4:5` aspect ratio, lazy loaded) with `"Image unavailable"` fallback.
- Displays category, name, description, and USD price formatted from integer `priceCents`.
- Interactive **Color** and **Size** option buttons initialized to `product.variants[0]`, with `aria-pressed` state.
- Live variant summary (`Selected: <color> / <size>`, `aria-live="polite"`) and stock availability badge (`role="status"`): `"In stock"`, `"Out of stock"`, `"Combination unavailable"`, or `"Select a color and size"`.
- **Add to Cart** button disabled when variant is out-of-stock or combination is unavailable (button label changes to `"Out of Stock"` or `"Unavailable"`).

### Shopping Cart (`#cart`) & Status Feedback
- Inline status message (`role="status"`) confirming cart additions or explaining stock/variant limits (`Stock limit reached. Only N available.`).
- Conditional jump link (`View cart (N)`) shown in the catalog header when `cartCount > 0`.
- **Cart Line Items:** Displays product name, `color / size`, available variant stock (`Stock: N`), decrement (`−`) / increment (`+`) quantity controls bounded by `[1, variant.stock]`, and a `Remove` button.
- **Order Summary:** Displays derived total item unit count (`Your Cart (N)`) and formatted USD subtotal (`Subtotal`), plus `"Shipping and taxes calculated at checkout."` note.
- **Empty Cart State:** Displays `"Your cart is empty."` when `cartItems.length === 0`.

### About Section (`#about`)
- Renders `<section id="about"><h2>About Our Shop</h2></section>` (heading placeholder only).

---

## 3. Current Routes or Views

- **Single View Only:** There is no client-side router (`react-router`, TanStack Router, etc.). `src/main.tsx` mounts `<App />` directly inside `#root`.
- **In-Page Fragment Navigation:** All navigation uses HTML anchor fragments:
  - `#home` — Main container / Hero section
  - `#products` — Product catalog, filters, and grid
  - `#cart` — Shopping cart and order summary
  - `#about` — About section heading

---

## 4. Current Component Structure

```text
src/
├── main.tsx                                    # React 19 StrictMode root mount
├── App.tsx                                     # Root view + state coordinator (catalog filters, cart state, hero, catalog UI, cart UI, about)
├── index.css                                   # Global typography, hero, catalog controls, grid, and cart styles
├── components/
│   ├── Header.tsx                              # Site header & anchor navigation
│   └── Header.css                              # Header layout & mobile/tablet breakpoint
└── features/
    ├── products/
    │   ├── types.ts                            # Product & ProductVariant types
    │   ├── data.ts                             # Static 5-product catalog dataset
    │   ├── catalogOperations.ts                # Pure searchProducts, filterProductsByCategory, sortProducts, SortOption
    │   ├── checkAvailability.ts                # Pure variant AvailabilityStatus resolver
    │   └── components/
    │       ├── ProductCard.tsx                 # Reusable card with local color/size variant selection
    │       └── ProductCard.css                 # Card, option button, and mobile-first responsive rules
    └── cart/
        ├── types.ts                            # CartItem type
        ├── addToCart.ts                        # Pure immutable cart item add/merge helper
        ├── updateCartQuantity.ts               # Pure immutable quantity update bounded by [1, maxStock]
        ├── removefromcart.ts                   # Pure immutable cart line removal helper
        ├── calculateCartTotals.ts              # Strict pure totalQuantity & subtotalCents calculator
        └── cartStorage.ts                      # Versioned localStorage adapter & runtime catalog reconciliation
```

---

## 5. Current Product Data Model

Defined in `src/features/products/types.ts`:

```ts
export type ProductVariant = {
  sku: string;
  color: string;
  size: string;
  stock: number;
  imageUrl?: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  priceCents: number;
  currency: string;
  images: string[];
  variants: ProductVariant[];
};
```

- **Catalog Dataset (`src/features/products/data.ts`):** Exports 5 static products (`hoodie-001`, `tshirt-001`, `jeans-001`, `jacket-001`, `sweatshirt-001`) with 3–4 variants each, unique SKUs, integer `priceCents` (`2499`–`8999`), `"USD"` currency, local JPEG assets under `/public/images/products/`, and deliberate `stock: 0` and low-stock (`2–3`) variants for availability testing.
- **Availability Resolution (`src/features/products/checkAvailability.ts`):** Returns `"in-stock" | "out-of-stock" | "unavailable"` for `(product, color, size)`.

---

## 6. Current Cart Data Model

Defined in `src/features/cart/types.ts`:

```ts
export type CartItem = {
  productId: string;
  variantSku: string;
  quantity: number;
};
```

- **Minimal Line Reference:** Cart items intentionally store only `productId`, `variantSku`, and `quantity`. Product metadata, variant stock, and pricing are always resolved live against `products`.
- **Totals Contract (`src/features/cart/calculateCartTotals.ts`):** Computes `{ totalQuantity: number; subtotalCents: number }` in integer cents. Throws an `Error` if any `CartItem` references an unknown `productId` or `variantSku` (fail-fast invariant enforced by `ADR 0004`).

---

## 7. Current Persistence Behavior

Implemented in `src/features/cart/cartStorage.ts` and wired in `src/App.tsx`:

- **Storage Key:** `CART_STORAGE_KEY = "shoppilot_cart_v1"`.
- **Selective Persistence:** Only `CartItem[]` is serialized via `JSON.stringify`. Derived totals (`subtotalCents`, `cartCount`), product catalog records, `cartMessage`, and catalog UI states (`searchQuery`, `selectedCategory`, `sortOption`) are not persisted.
- **Lazy Initialization:** `useState<CartItem[]>(() => loadCart(products))` reads `window.localStorage` once on initial mount.
- **Effect Synchronization:** `useEffect(() => { saveCart(cartItems); }, [cartItems])` saves updates on change (including writing `"[]"` on initial empty mount).
- **Runtime Validation & Catalog Reconciliation:**
  - `isValidCartItem(item)` validates non-null object, non-empty trimmed strings for `productId` and `variantSku`, and positive integer `quantity`.
  - `reconcileCartItems(rawItems, products)` discards non-arrays, invalid items, missing products, missing SKUs, and variants with non-finite or `<= 0` stock; clamps quantities exceeding `variant.stock`; and merges duplicate `(productId, variantSku)` lines capped at `variant.stock` without mutating inputs.
- **Error Resilience:** `loadCart` and `saveCart` guard against missing `window`/`localStorage`, malformed JSON, and storage exceptions (`QuotaExceededError`, `SecurityError`), logging via `console.warn` and degrading gracefully to `[]`.

---

## 8. Existing Test Coverage

Verified with Vitest (`vitest run`, `jsdom` environment for React/storage suites): **11 test files, 101 tests passing**.

| Test File | Scope | Tests |
|---|---|---:|
| `src/features/products/catalogOperations.test.ts` | `searchProducts`, `filterProductsByCategory`, `sortProducts`, ties, empty collections, immutability | 20 |
| `src/features/products/data.test.ts` | Dataset count (5), variant minimums, unique IDs/SKUs, stock >= 0, positive prices, sold-out/low-stock presence, image consistency | 12 |
| `src/features/products/checkAvailability.test.ts` | In-stock, out-of-stock, unavailable combinations, size mismatch | 4 |
| `src/features/products/components/ProductCard.test.tsx` | Name, category, missing image fallback, USD price formatting, component reuse, `onAddToCart` callback args | 6 |
| `src/features/cart/cartStorage.test.ts` | Versioned key, `isValidCartItem`, `reconcileCartItems`, `saveCart`, `loadCart` JSON/type/storage failure handling | 22 |
| `src/features/cart/calculateCartTotals.test.ts` | Empty cart, single/multi-item/multi-variant integer-cent totals, throw on missing product/SKU, immutability | 8 |
| `src/features/cart/updateCartQuantity.test.ts` | Increment, decrement, lower bound `1`, upper bound `maxStock`, targeted variant update, missing item | 6 |
| `src/features/cart/addToCart.test.ts` | Add new item, increment matching variant, separate variant line, immutability | 4 |
| `src/features/cart/removefromcart.test.ts` | Targeted removal preserving other lines, immutability | 2 |
| `src/App.test.tsx` | Catalog render, case-insensitive search, empty search state, category filter/reset, combined search+category+sort, `localStorage` hydration/save/update/remove & stale-data reconciliation | 16 |
| `src/App.empty.test.tsx` | Empty catalog message (`"No products available yet."`) via mocked `data.ts` | 1 |
| **Total** | **11 test files** | **101** |

---

## 9. Current Styling Approach

- **Plain CSS3 Stylesheets:** `src/index.css`, `src/components/Header.css`, `src/features/products/components/ProductCard.css`. No CSS framework (no Tailwind CSS), no CSS Modules, and no CSS-in-JS.
- **Typography:** Google Fonts imported in `src/index.css` (`Inter` for `--font-body`, `Playfair Display` for `--font-heading`).
- **Layout:** CSS Grid for `.product-grid` (4 -> 3 -> 2 columns) and `.cart-items`; Flexbox for `.header`, `.nav`, `.catalog__category-options`, `.catalog__sort`, `.product-card`, and `.cart-item`.
- **Accessibility & Motion:** Explicit `:focus-visible` outlines, `min-height: 44px` on primary CTA buttons, and `@media (prefers-reduced-motion: reduce)` in `ProductCard.css`.

---

## 10. Current Package Manager

- **Intended Package Manager:** **`pnpm`** (`pnpm-lock.yaml` with `lockfileVersion: '9.0'`, documented across `README.md` and `docs/decisions/0002-client-side-spa-foundation-and-plain-css.md`).
- **Package Configuration:** `package.json` uses package-manager-agnostic script commands (`vite`, `tsc -b`, `eslint .`, `vitest run`) and does not declare a `"packageManager"` field.
- **Container Environment Note:** In the current AI Studio container, `pnpm` is not pre-installed in `PATH` (`npm` 10.9.8 and `bun` 1.4.4 are present, and `bun.lock` exists alongside `pnpm-lock.yaml`). Scripts were verified via `npm test`, `npm run lint`, and `npm run build`, which execute the exact same underlying binaries without altering `pnpm-lock.yaml`.

---

## 11. Current Verification Results

Executed at baseline capture (`2026-11-13`):

| Check | Exact Command Executed | Result | Notes |
|---|---|---|---|
| Test Suite | `npm test` (`vitest run`) | **PASS** (11 files, 101 tests, 4.85s) | Run via `npm` because `pnpm` binary is unavailable in container `PATH`. |
| Linter | `npm run lint` (`eslint .`) | **PASS** (0 errors, 0 warnings) | Covers `**/*.{ts,tsx}` excluding `dist`. |
| Production Build | `npm run build` (`tsc -b && vite build`) | **PASS** (28 modules, 301ms) | Outputs `dist/index.html` (0.70 kB), CSS (8.93 kB), JS (445.55 kB). |
| Browser Smoke Check | Headless Chromium via `playwright-cli` on `http://localhost:3000` | **PASS** (0 console errors/warnings) | Captured 5 baseline screenshots under `docs/baseline/screenshots/`. |

---

## 12. Known Limitations

1. **No Backend / Checkout / Seller Features Yet:** Static in-memory catalog (`src/features/products/data.ts`), no checkout flow, no authentication, and no seller management capabilities yet.
2. **Monolithic `App.tsx`:** `src/App.tsx` (431 lines) combines hero markup, catalog controls/grid, cart line rendering, order summary, and `#about` placeholder alongside cart and filter state.
3. **Static Product Card Image:** `ProductCard.tsx` always displays `product.images[0]` rather than switching to `selectedVariant.imageUrl` when the customer selects another color.
4. **Silent Cart Reconciliation:** `reconcileCartItems()` silently discards stale/zero-stock items and clamps over-stock quantities on load without displaying a notice to the user.
5. **Initial Empty-Cart Write:** `useEffect` in `App.tsx` invokes `saveCart([])` on mount even when `localStorage` previously had no cart entry.
6. **Minor UI / Data Polish Items:**
   - `#about` renders only `<h2>About Our Shop</h2>` with no content.
   - `ProductCard` CTA buttons are not bottom-aligned across cards of varying option counts (`margin-top: 16px` instead of `auto`).
   - `straightLegJeans` has lowercase `"khaki"` color label in `data.ts`.
   - `src/features/cart/removefromcart.ts` (and `.test.ts`) uses lowercase naming unlike `addToCart.ts` and `updateCartQuantity.ts`.
   - Breakpoints in `README.md` (`640px` / `1024px`) differ from actual CSS breakpoints in `src/index.css` (`800px` / `1100px`).
7. **Global CSS Cascade Risk:** All CSS classes are global (not CSS Modules or Tailwind layers).
8. **Environment-Specific Drift:** `.git` directory is absent in the AI Studio container workspace, `pnpm` is absent from `PATH`, and `bun.lock` exists alongside `pnpm-lock.yaml`.

---

## 13. Features That Must Not Break During Redesign

During the visual redesign and incremental evolution toward **ShopAI SellerHub**, the following behaviors and contracts must remain intact (unless explicitly superseded by a new ADR):

1. **Pure Domain Module Boundaries (`ADR 0001`):** `catalogOperations.ts`, `checkAvailability.ts`, `addToCart.ts`, `updateCartQuantity.ts`, `removefromcart.ts`, `calculateCartTotals.ts`, and `reconcileCartItems()` must remain framework-independent and immutable.
2. **Catalog Search, Category Filter & Sort Semantics:**
   - Trimmed, case-insensitive search on `name` and `category` only.
   - `"all"` vs exact category filtering, dynamic category list, combined search + category + sort composition.
   - Exact result count (`N product(s) found`) and empty-catalog / empty-filter states.
3. **Variant Selection & Stock Enforcement:**
   - Color/size selection in `ProductCard` accurately reflects `"in-stock"`, `"out-of-stock"`, and `"unavailable"`.
   - Cart additions respect `variant.stock`; duplicate `(productId, variantSku)` additions merge rather than creating duplicate lines.
   - Quantity controls enforce `[1, variant.stock]` bounds.
4. **Integer-Cents Pricing & Strict Totals (`ADR 0004`):** `priceCents` and `subtotalCents` remain integer minor units; `calculateCartTotals()` remains strict; currency formatting stays in the UI layer.
5. **Versioned `localStorage` Persistence & Stale Hydration Safety (`ADR 0003`):**
   - Key `shoppilot_cart_v1`, minimal `CartItem[]` schema (no persisted totals, products, or filter state).
   - Graceful handling of malformed JSON, invalid items, missing products/SKUs, zero-stock variants, over-stock quantities, and storage access errors.
6. **Accessible Controls & Existing Test Contracts:** Semantic `<header>`, `<nav>`, `<main>`, `<fieldset>/<legend>`, `<label>`, `aria-pressed`, `role="status"`, accessible button `aria-label`s, and all 101 existing tests passing.
