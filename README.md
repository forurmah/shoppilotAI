## Dynamic Product Catalog

The storefront renders product records dynamically
using React and TypeScript.

### Implementation

- Typed product records in data.ts
- Reusable ProductCard components
- Dynamic rendering with .map()
- Stable product ID keys
- CSS Grid layout
- Empty-state handling

### Testing

Automated tests verify that products are
rendered from the dataset and that an
empty collection displays a helpful message.

Run tests:
`pnpm exec vitest run`

Production build:
`pnpm build`