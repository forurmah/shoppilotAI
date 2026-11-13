# ShopAI SellerHub — Project State & Architecture

*Updated: 2026-11-13 (Post-Refactor V1 Public Marketplace Foundation)*

---

## 1. Rebuild Decision

**Decision:** **Option A — Structured Architectural Refactor** inside the existing single-page React + TypeScript + Vite repository.

**Rationale:** The repository already possessed well-tested, immutable domain logic (`catalogOperations`, `checkAvailability`, `priceFilter`, `addToCart`, `updateCartQuantity`, `calculateCartTotals`, `cartStorage`, `cartHydration`, `sellerLookup`), integer-cent pricing, accessible modal foundations, and a cohesive warm-cream/forest-green palette. Discarding that foundation would have introduced unnecessary regression risk. Instead, Option A extracted duplicated UI plumbing and formatting helpers, added store-aware search and complete seller metadata, eliminated dead template assets and inconsistent naming, and unified empty/status/dialog/footer primitives across the single-page marketplace.

---

## 2. Architecture Overview

ShopAI SellerHub preserves a strict **single-page architecture** (`#home`, `#products`, `#cart`, `#about` anchor navigation plus accessible dialog modals—no multi-page router or extra routes).

```text
src/
├── lib/
│   ├── formatCurrency.ts          # Shared integer-cent Intl.NumberFormat helper
│   └── formatCurrency.test.ts
├── components/
│   ├── ui/
│   │   ├── Modal.tsx / .css / .test.tsx  # Shared dialog shell, focus trap, Escape, focus restore
│   │   ├── StatusMessage.tsx / .css      # Unified info / success / error banners
│   │   └── EmptyState.tsx / .css         # Unified empty-state presentation
│   ├── layout/
│   │   └── Footer.tsx / .css             # Single-page anchor footer + Seller Workspace preview trigger
│   ├── Header.tsx / .css
│   ├── HeroSection.tsx / .css
│   └── AboutSection.tsx / .css
├── features/
│   ├── products/
│   │   ├── types.ts               # Explicit Category, ProductVariant, Product
│   │   ├── data.ts                # 5 curated marketplace listings linked to sellers
│   │   ├── catalogOperations.ts   # Pure search (product, category, storeName), category filter, sort
│   │   ├── checkAvailability.ts   # SKU-level color/size stock checks
│   │   ├── priceFilter.ts         # Integer-cent price bracket filtering
│   │   └── components/            # CatalogToolbar, CatalogGrid, ProductCard, ProductDetailModal
│   ├── sellers/
│   │   ├── types.ts               # Seller model with storefront categories
│   │   ├── data.ts                # 3 independent stores (2 verified, 1 standard)
│   │   ├── sellerLookup.ts        # getSellerById, getProductsBySeller, getSellerProductCount, getSellerProfile
│   │   └── components/            # SellerBadge, SellerSummary, SellerProfileModal, SellerWorkspaceNoticeModal
│   └── cart/
│       ├── types.ts               # CartItem & CartTotals
│       ├── addToCart.ts
│       ├── updateCartQuantity.ts
│       ├── removeFromCart.ts      # Standardized camelCase filename
│       ├── calculateCartTotals.ts
│       ├── cartStorage.ts         # Versioned localStorage persistence (shoppilot_cart_v1)
│       ├── cartHydration.ts       # Safe catalog reconciliation + write verification
│       └── components/            # CartSection, CartItemRow, OrderSummary
├── App.tsx                        # Single-page state orchestration & section wiring
├── index.css                      # Design tokens & global layout styles
└── main.tsx
```

---

## 3. Main Components

- **Navigation & Framing:** `Header` (sticky nav + live Cart counter + Seller Workspace entry point), `HeroSection` (store/listing counts + synchronized marketplace search), `AboutSection` (3-pillar positioning), `Footer` (anchor links + Seller Workspace entry point).
- **Shared UI Primitives:** `Modal` (keyboard `Tab`/`Shift+Tab` focus trap, `Escape`, backdrop close, body scroll lock, focus restoration), `StatusMessage` (`info` / `success` / `error`), `EmptyState`.
- **Marketplace Catalog:** `CatalogToolbar` (search input for products/categories/stores, price filter, sort selector, category radios, active-filter reset), `CatalogGrid`, `ProductCard` (dynamic variant image switching, SKU stock status, seller attribution), `ProductDetailModal` (gallery thumbnails, `SellerSummary`, variant selector, full SKU availability matrix).
- **Seller Discovery:** `SellerBadge` (verified vs. independent indicator), `SellerSummary` (shared store block), `SellerProfileModal` (store identity, verification status, response time, delivery terms, product count, storefront categories, clickable catalog preview), `SellerWorkspaceNoticeModal` (explicit V1 scope boundary preview).
- **Shopping Cart:** `CartSection`, `CartItemRow` (variant label, seller attribution, stock-bounded `-`/`+` & remove controls), `OrderSummary` (exact integer-cent subtotal).

---

## 4. Data Model

- **`Category`:** `"Hoodies" | "T-Shirts" | "Jeans" | "Jackets" | "Sweatshirts" | (string & {})`
- **`ProductVariant`:** `{ sku, color, size, stock, imageUrl? }`
- **`Product`:** `{ id, sellerId?, name, description, category: Category, priceCents, currency, images, variants }`
- **`Seller`:** `{ id, sellerName, storeName, location, description, isVerified, responseTime, deliveryInfo, categories: Category[] }`
- **`SellerProfile`:** `{ seller, products, productCount, categories }`
- **`CartItem`:** `{ productId, variantSku, quantity }` persisted under `localStorage` key `shoppilot_cart_v1` and reconciled on startup via `hydrateCartWithReport()`.

---

## 5. Core User Flows

1. **Discover Marketplace:** Load `/` (`#home`) → inspect store/listing stats and browse products directly above/near the fold on desktop.
2. **Search & Filter:** Type a product name, category, or seller store name (e.g., `"Atelier North"`, `"Loom & Indigo"`) into either the hero search or catalog toolbar; combine with category radio filters, price range brackets, and sort order (`default`, `price-low`, `price-high`, `name-az`), or reset via `Clear filters`.
3. **Inspect Product & Variants:** Click a product card's image or `View details` → open `ProductDetailModal` → switch color/size options and gallery thumbnails while inspecting live SKU and stock availability.
4. **Inspect Seller Profile:** Click a seller's store name on any `ProductCard` or `View seller profile` inside `ProductDetailModal` → inspect `SellerProfileModal` (verification status, owner, location, response time, fulfillment terms, categories, and active listings) and jump directly into another product from that store.
5. **Manage Persistent Cart:** Add an in-stock variant from `ProductCard` or `ProductDetailModal` → jump to `#cart` → increment/decrement quantity within variant stock limits or remove items → reload page to confirm `localStorage` persistence and automatic reconciliation.

---

## 6. Verification Results (Post-Refactor)

- **Automated Tests (`npm test -- --run`):** **PASS** — `18` test files, `144` tests passed (covering pure catalog/seller/cart/currency helpers, `Modal` keyboard/focus behavior, `ProductCard`, `ProductDetailModal`, `SellerProfileModal`, and full `App` integration & `localStorage` resilience).
- **Typecheck & Production Build (`npm run build` / `tsc -b && vite build`):** **PASS** — TypeScript compilation and Vite production bundle succeeded cleanly.
- **Linter (`npm run lint` / `eslint .`):** **PASS** — 0 errors, 0 warnings.
- **Live Browser Verification (Playwright Chromium):** Verified end-to-end discovery, store-name search, category/price filtering, `ProductDetailModal` variant switching, `SellerProfileModal`, cart add/quantity increment, and reload persistence with zero console/page errors and zero horizontal overflow across `1440×900`, `768×1024`, and `390×844`.

---

## 7. Known Limitations

- **Static Client-Side Dataset:** Products (`5`) and sellers (`3`) reside in static TypeScript data files; there is no backend API, database, authentication, or real-time multi-user inventory synchronization.
- **Seller Workspace Scope Boundary:** `Seller Workspace` in the header and footer opens an informational preview modal (`SellerWorkspaceNoticeModal`) rather than merchant CRUD screens, matching V1 public marketplace scope.
- **No Checkout Flow:** The cart computes exact integer-cent subtotals and notes that shipping and taxes are calculated at checkout, without payment processing or order submission.
- **Environment Notes:** `pnpm` is not installed in the container `PATH` (`pnpm-lock.yaml` is preserved untouched; scripts run via `npm`), and no `.git` repository is initialized in `/app/applet`.

---

## 8. Recommended Next Feature

**Seller Filter & Storefront Directory (Public Discovery V1.5) → followed by Seller Workspace Product & Inventory Management (V2):**
1. Add a **Store filter** in `CatalogToolbar` (and a compact "Featured Independent Stores" strip) backed by `sellers` so shoppers can filter the entire marketplace by seller directly, alongside categories and price ranges.
2. Build the first working **Seller Workspace** view (listing status, variant stock editing, and new product creation backed by validated form schemas and shared `Product`/`Seller` domain validators).
