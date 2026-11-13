# ShopPilot AI — Redesign Baseline

## Metadata

- **Baseline Branch:** `redesign/shopai-baseline` *(Requested target branch; see Repository State below regarding AI Studio container Git availability)*
- **Date:** 2026-11-13
- **Target Evolution:** Preparing baseline prior to evolving ShopPilot AI into **ShopAI SellerHub**
- **Upstream Repository:** `https://github.com/forurmah/shoppilotAI.git`

---

## Repository State

- **Application Code:** Clean, verified pre-redesign storefront (`React 19.2.8`, `TypeScript ~6.0.2`, `Vite 8.3.0`, plain `CSS3`, `Vitest 5.0.3`). Zero modifications were made to application source files, `package.json`, or `pnpm-lock.yaml` during this baseline capture.
- **Architecture Decision Log (`docs/decisions/`):** Contains `README.md`, `ADR-TEMPLATE.md`, and accepted ADRs `0001`–`0004`.
- **Package Manager State:** `pnpm` is the canonical package manager (`pnpm-lock.yaml`, `lockfileVersion: '9.0'`). No `"packageManager"` field is set in `package.json`. In the AI Studio container, `pnpm` is not in `PATH`, and a container-generated `bun.lock` sits alongside `pnpm-lock.yaml` (left untouched per safety rules).
- **Git Environment Limitation:** The `/app/applet` container workspace does **not** include a `.git` directory (`git status` / `git branch` return `fatal: not a git repository`). Because Git history is absent in this container, branch `redesign/shopai-baseline` could not be created here without initializing a disconnected orphan repository. When syncing to the local Git clone of `forurmah/shoppilotAI.git`, create the baseline branch directly with:
  ```bash
  git checkout -b redesign/shopai-baseline
  ```

---

## Commands Executed

| Purpose | Command Executed | Outcome | Environment Notes |
|---|---|---|---|
| Environment & Git check | `git status`, `git branch -a`, `which node npm pnpm bun corepack git playwright-cli` | Inspected | `.git` absent; `pnpm` absent in `PATH`; `node v22.23.2`, `npm 10.9.8`, `bun 1.4.4`, `git`, `playwright-cli` available. |
| Test suite | `npm test` (`vitest run`) | **PASS** — 11 files, 101 tests (4.85s) | Executed via `npm` because `pnpm` is not installed in container `PATH`. |
| Lint check | `npm run lint` (`eslint .`) | **PASS** — 0 errors, 0 warnings | Identical underlying `eslint .` script as `pnpm lint`. |
| Production build | `npm run build` (`tsc -b && vite build`) | **PASS** — 28 modules built in 301ms | Produced `dist/` assets with zero TypeScript errors. |
| Dev server check | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` | **PASS** (`200`) | Pre-running Vite dev server (`vite --host 0.0.0.0 --port 3000`). |
| Browser screenshots | `playwright-cli` (headless Chromium against `http://localhost:3000`) | **PASS** — 0 console errors/warnings | Saved 5 screenshots under `docs/baseline/screenshots/`. |

---

## Screenshot Locations

All baseline screenshots were captured from the live Vite dev server at `http://localhost:3000` using headless Chromium:

- `docs/baseline/screenshots/catalog-desktop.png` — Full-page desktop view (`1440×900`): header, hero banner, search/category/sort controls, 4-column product grid (5 products), empty cart section, and `#about` heading.
- `docs/baseline/screenshots/filtered-catalog.png` — Catalog section (`#products`) filtered with search query `"shirt"` and sorted `"Price: High to Low"` (`2 products found`).
- `docs/baseline/screenshots/product-card.png` — Isolated `ProductCard` component (`Essential Oversized One`) showing `4:5` image, metadata, price, Color/Size variant buttons, availability status, and `Add to Cart` CTA.
- `docs/baseline/screenshots/cart.png` — Populated `#cart` section (`Your Cart (3)`) with two line items (`Essential Oversized One` qty `2`, `Classic Cotton T-Shirt` qty `1`), quantity controls, `Remove` buttons, and `Order Summary` (`$124.97`).
- `docs/baseline/screenshots/catalog-mobile.png` — Full-page mobile layout (`390×844`): stacked header, responsive hero, stacked sort control, and 2-column mobile product grid.

---

## Current Strengths

1. **Clean Separation of Domain Logic (`ADR 0001`):** Core catalog filtering/sorting, variant availability, immutable cart updates, integer-cent calculations, and `localStorage` reconciliation live in pure, framework-free TypeScript modules.
2. **Strong Automated Test Coverage:** 101 passing Vitest tests (fast pure unit tests + `jsdom` React Testing Library integration tests) plus strict `tsc -b` and `eslint .`.
3. **Resilient Cart Persistence (`ADR 0003`):** Versioned `localStorage` key (`shoppilot_cart_v1`), runtime validation (`isValidCartItem`), catalog reconciliation (`reconcileCartItems`) discarding stale/zero-stock items and clamping over-stock quantities, and graceful error handling.
4. **Zero-Float Monetary Math (`ADR 0004`):** Integer `priceCents` and `subtotalCents` prevent floating-point rounding bugs.
5. **Accessible, Responsive Baseline UI:** Semantic landmarks, `<fieldset>/<legend>` radio/option groupings, `aria-pressed` and `role="status"` live announcements, `:focus-visible` outlines, reduced-motion support, and clean 4/3/2-column CSS Grid scaling.
6. **Minimal Runtime Footprint:** Only `react` and `react-dom` in runtime dependencies.

---

## Current Weaknesses

1. **Monolithic `src/App.tsx` (431 lines):** Houses hero, catalog controls, catalog grid, cart items, order summary, and `#about` placeholder in one component.
2. **No Routing or Multi-View Architecture:** Only `#anchor` navigation exists; product detail views, cart drawer/page, checkout, or seller views cannot be addressed by URL.
3. **Global Plain CSS Cascade:** `index.css`, `Header.css`, and `ProductCard.css` share global class scope, increasing collision risk during a broad redesign.
4. **Incomplete / Unpolished UX Details:**
   - `#about` renders only a section heading.
   - Selecting a different product color in `ProductCard` does not swap the displayed product image to `selectedVariant.imageUrl`.
   - `Add to Cart` buttons in `.product-grid` sit at uneven vertical heights across cards with differing variant option rows.
   - Silent cart pruning/clamping during hydration provides no notice to the shopper.
   - `straightLegJeans` has lowercase `"khaki"` label in `data.ts`.
5. **Minor Structural Drift:** Lowercase filename `removefromcart.ts` vs camelCase siblings; `README.md` mobile/tablet breakpoint docs (`640px` / `1024px`) diverge from `index.css` (`800px` / `1100px`); `useEffect` writes `[]` to `localStorage` on initial empty render.

---

## Recommended Redesign Boundaries

To evolve ShopPilot AI safely toward **ShopAI SellerHub** without breaking verified behavior:

1. **Keep Domain Modules Stable First:** Preserve signatures and tests in `src/features/cart/*` and `src/features/products/{catalogOperations,checkAvailability,types}.ts` during UI/layout refactoring.
2. **Decompose `App.tsx` Before Visual Overhaul:** Extract `Hero`, `CatalogSection` (filters + grid), `CartSection`, and `AboutSection` into focused components before restyling or introducing new SellerHub views.
3. **Introduce a Scoped Styling Strategy Explicitly:** If migrating from global plain CSS3 to Tailwind CSS or CSS Modules for SellerHub, create an ADR superseding `ADR 0002` rather than mixing conflicting global and utility styles ad hoc.
4. **Gate Layout & Navigation Changes on Automated Tests:** Keep existing RTL role/label semantics (`searchbox`, `combobox`, `radio`, `button`, `heading`) or update tests intentionally in lockstep so all 101 baseline checks stay green.
5. **Reconcile External/Seller Catalog Mutations at the Boundary:** When SellerHub introduces seller-side product creation, editing, or stock updates, route persisted buyer carts through `reconcileCartItems(cart, activeProducts)` so `calculateCartTotals()` invariants hold.
6. **Maintain Single-Lockfile Discipline:** Keep `pnpm-lock.yaml` as the sole committed lockfile in Git (`bun.lock` is an AI Studio container artifact).
