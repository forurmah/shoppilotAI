## Product Card Component

ShopPilot AI includes a reusable product card built with
React and TypeScript.

### Features

- Displays product images, categories, names, and prices
- Uses a typed Product object as its input
- Formats prices with Intl.NumberFormat
- Handles missing product images with a fallback
- Uses responsive styling
- Supports different products without duplicating JSX

### Architecture

src/features/products/
├── types.ts
├── data.ts
└── components/
    ├── ProductCard.tsx
    ├── ProductCard.css
    └── ProductCard.test.tsx

### Testing

ProductCard is tested using Vitest and React Testing Library.

Test cases cover:
- Product name rendering
- Product category rendering
- Missing image fallback
- Currency formatting
- Component updates when props change

Run all tests:

    pnpm exec vitest run

Run the production build:

    pnpm build

### Current Limitations

The homepage currently displays one product card.

Future development will include:
- Rendering multiple products in a grid
- Product variant selection
- Stock availability integration
- Shopping cart functionality