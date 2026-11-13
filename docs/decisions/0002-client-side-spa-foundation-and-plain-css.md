# ADR 0002: Client-Side React, TypeScript, and Vite SPA Foundation with Plain CSS3 and Local State

## Status

`Accepted` *(Retrospective record documenting the existing implementation foundation)*

## Date

2026-11-13

## Context

ShopPilot AI (ShopAI) currently operates as a self-contained front-end e-commerce storefront showcasing product browsing, color/size variant selection, catalog search/filtering/sorting, and a persistent shopping cart (`src/App.tsx`).

Before any visual redesign, multi-page navigation, or backend integration is introduced, the repository reflects several foundational technology and architectural choices already in place:

- **Runtime & Build:** React `19.2.8` and `react-dom` `19.2.8` bundled with Vite `8.3.0` and strict TypeScript `~6.0.2` (`package.json`, `vite.config.ts`, `tsconfig.app.json`).
- **Package Management:** Managed with **`pnpm`**, evidenced by `pnpm-lock.yaml` (`lockfileVersion: '9.0'`) and `README.md` (`pnpm install`, `pnpm dev`, `pnpm exec vitest run`, `pnpm build`). Note: `package.json` does not currently declare a `"packageManager"` field, and the AI Studio container environment lacks `pnpm` in `PATH` by default (provisioning `node_modules` via `bun.lock` and exposing `npm`).
- **Styling:** Plain CSS3 stylesheets (`src/index.css`, `src/components/Header.css`, `src/features/products/components/ProductCard.css`) using CSS Grid, Flexbox, and CSS custom properties (`--font-body`, `--font-heading`) without Tailwind CSS, CSS Modules, or CSS-in-JS libraries.
- **Navigation:** Single-page layout in `src/App.tsx` using HTML fragment anchors (`#home`, `#products`, `#cart`, `#about`) in `src/components/Header.tsx` with no client-side router.
- **Data & State:** Static in-memory product catalog (`src/features/products/data.ts`) and component-local React `useState` in `src/App.tsx` and `src/features/products/components/ProductCard.tsx`, with zero third-party state management or data-fetching libraries.

This record captures the reasoning, trade-offs, and evolution boundaries of that baseline stack before future architectural changes supersede parts of it.

## Decision Drivers

- **Minimal Runtime Surface:** Keep runtime dependencies strictly to `react` and `react-dom` while focusing engineering effort on domain modeling, accessibility, and automated testing.
- **Fast Local Feedback Loop:** Sub-second Vite dev/build cycles and fast Vitest + React Testing Library execution in `jsdom`.
- **Strict Static Type Checking:** Catch contract mismatches at compile time using `tsc -b` (`verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`) alongside ESLint 10 (`typescript-eslint`, `eslint-plugin-react-hooks`).
- **Explicit Responsive Control:** Direct CSS Grid and Flexbox media queries with full control over typography, focus outlines, and reduced-motion rules without framework lock-in.
- **Zero Backend Operational Overhead:** Deliver a working, deterministic storefront from static TypeScript data without requiring a database or API server during early storefront construction.

## Options Considered

### Option 1: Lightweight React + TypeScript + Vite SPA with Plain CSS3 and Local `useState` (Existing Approach)

Use React + Vite + TypeScript with only `react` and `react-dom` at runtime, co-located CSS3 stylesheets, anchor-based section navigation, static TypeScript catalog data, and local React `useState`.

- **Advantages:**
  - Minimal bundle and dependency tree; fast installs, builds, and Vitest runs.
  - Zero framework/library churn—UI semantics (`fieldset`, `legend`, `aria-pressed`, `role="status"`) and responsive CSS Grid layouts remain transparent and easy to inspect.
  - Easy to layer routing, Tailwind/design systems, React Context, or API fetching later without unwinding heavy starter frameworks.
- **Disadvantages:**
  - Single-page fragment navigation cannot represent shareable product detail URLs, filter query parameters, or multi-step checkout pages.
  - Plain CSS classes rely on manual BEM-like naming discipline (`.product-card__content`, `.option-button--selected`) to avoid global cascade collisions.
  - All state shared across sections (`cartItems`, `cartMessage`, catalog filters) concentrates inside `src/App.tsx`.

### Option 2: Full-Stack Meta-Framework (e.g., Next.js) with Utility CSS (e.g., Tailwind CSS)

Adopt a full-stack React framework with file-based routing, server rendering, and utility-first CSS from day one.

- **Advantages:**
  - Built-in URL routing, SSR/SEO primitives, and standardized design tokens.
  - Ready-made API route handlers for future checkout or database queries.
- **Disadvantages:**
  - Premature complexity when catalog data is static and checkout/auth do not yet exist.
  - Adds significant build/framework coupling and obscures foundational React/TypeScript/CSS mechanics.

### Option 3: React SPA with `react-router`, Redux/Zustand, and a Component Library

Introduce client-side routing, an external store, and a prebuilt UI kit up front.

- **Advantages:**
  - Standardizes multi-page navigation and global state access early.
- **Disadvantages:**
  - Unjustified boilerplate and dependency weight for a single-page storefront with five products and two features (`products`, `cart`).

## Decision

ShopAI is currently structured as a **zero-backend React 19 + TypeScript 6 + Vite 8 Single Page Application** using **`pnpm`** as the project package manager (`pnpm-lock.yaml`), styled with **plain CSS3** (`index.css`, `Header.css`, `ProductCard.css`), navigated via **HTML fragment links** (`#home`, `#products`, `#cart`, `#about`), powered by **static typed catalog data** (`src/features/products/data.ts`), and coordinated via **local React `useState`** in `src/App.tsx` and `ProductCard.tsx`.

Project scripts in `package.json` invoke tool binaries directly (`vite`, `tsc`, `eslint`, `vitest`) without hardcoding a package manager, preserving `pnpm` as the canonical workflow while remaining runnable in environments where only `npm` is pre-installed.

## Rationale

For the initial storefront phase, keeping the runtime stack minimal maximizes clarity and testability:

- Direct Vite + React + TypeScript keeps build tooling simple (`tsc -b && vite build`) and avoids masking core web fundamentals (semantic HTML, accessible controls, CSS Grid responsive breakpoints, and React state flow) behind third-party abstractions.
- Plain CSS3 stylesheets achieve responsive 2/3/4-column catalog grids, accessible `:focus-visible` states, and `@media (prefers-reduced-motion: reduce)` handling without additional build plugins.
- Local `useState` in `App.tsx` and `ProductCard.tsx` is sufficient while the entire user flow lives on one page.

## Trade-offs and Consequences

- **Positive:**
  - Tiny runtime dependency footprint (`react`, `react-dom` only).
  - Transparent, inspectable CSS and semantic HTML without library abstractions.
  - Fast compilation (`tsc -b`) and unit/integration test execution (`vitest run`).
- **Negative / Cost:**
  - **No URL State or Deep Linking:** Search queries, selected category, sort option, and individual products cannot be bookmarked or navigated via browser history.
  - **Single-Component Concentration:** `src/App.tsx` (~430 lines) owns both catalog filtering controls and cart UI rendering.
  - **Global CSS Cascade Risk:** Stylesheets (`Header.css`, `ProductCard.css`, `index.css`) share a global CSS scope rather than CSS Modules or scoped styles.
  - **Static Inventory:** Stock counts in `data.ts` are fixed in the client bundle and reset on reload rather than reflecting real-time inventory reservations.
- **Future Architectural Impact:**
  - Any upcoming UI redesign, product detail page, or checkout flow will likely supersede the single-page anchor navigation and plain global CSS approach via new ADRs.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| **Global CSS selector collisions** as more UI components are added during redesigns | Medium | Use BEM-style component class prefixes (e.g., `.product-card__*`, `.cart-item__*`) or adopt CSS Modules / Tailwind CSS via a future superseding ADR before scaling component count. |
| **Growth of `App.tsx` into a monolithic component** | Medium | Extract dedicated feature view components (e.g., Catalog section, Cart section) and introduce `CartContext` when additional pages or header badges need cart access. |
| **Lack of shareable URL state** for search/filter/sort or product pages | Low (current scope) / High (post-redesign) | Adopt client-side routing and URL search params in a dedicated future ADR when multi-view navigation is introduced. |
| **Package-manager and lockfile drift** (`pnpm-lock.yaml` vs container-generated `bun.lock`, and missing `"packageManager"` field) | Medium | Retain `pnpm-lock.yaml` as the canonical lockfile, avoid committing `bun.lock` or `package-lock.json`, and consider pinning `"packageManager": "pnpm@..."` in `package.json` via Corepack. |

## Validation

Verified continuously via existing scripts in `package.json` (canonical `pnpm` workflow; `npm run ...` produces identical script execution in environments without `pnpm` installed):

- `pnpm test` (`vitest run`) — 11 test files, 101 tests covering `App`, `App.empty`, `ProductCard`, catalog operations, product data invariants, availability, and cart operations/storage.
- `pnpm build` (`tsc -b && vite build`) — verifies strict TypeScript compilation and Vite production bundling.
- `pnpm lint` (`eslint .`) — verifies TypeScript, React Hooks, and Vite React Refresh rules.

## Review Triggers

Revisit or supersede this ADR when any of the following occur:

1. **Multi-Page Storefront or Checkout Flow:** Adding dedicated product detail pages, a checkout route, or order confirmation pages where `#anchor` links are insufficient.
2. **Design System / UI Redesign:** Introducing a styling system (e.g., CSS Modules, Tailwind CSS, or design-token architecture) across an expanded component library.
3. **Shared Cross-Route State:** Reaching >2–3 component levels or routes that need read/write access to cart state or user authentication state.
4. **Dynamic Catalog / Real Inventory:** Replacing `src/features/products/data.ts` with remote API endpoints or backend persistence.

## References and Evidence

- `package.json` — Minimal runtime dependencies (`react`, `react-dom`) and package-manager-agnostic scripts (`dev`, `build`, `lint`, `test`).
- `pnpm-lock.yaml` — Canonical `pnpm` lockfile (`lockfileVersion: '9.0'`).
- `README.md` — Documents `pnpm` as the project package manager (`pnpm install`, `pnpm dev`, `pnpm exec vitest run`, `pnpm build`).
- `vite.config.ts` — Vite React plugin and dev server configuration.
- `tsconfig.app.json` — Strict TypeScript compiler options (`verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`).
- `eslint.config.js` — Flat ESLint config enforcing `typescript-eslint` and `eslint-plugin-react-hooks`.
- `index.html` & `src/main.tsx` — SPA mount point (`<div id="root">`).
- `src/components/Header.tsx` & `src/components/Header.css` — Fragment-based navigation (`#home`, `#products`, `#about`).
- `src/App.tsx` — Single-page storefront orchestrating catalog and cart state with `useState`.
- `src/features/products/data.ts` — Static in-memory catalog dataset.
- `src/index.css` & `src/features/products/components/ProductCard.css` — Plain CSS3 responsive styling.
