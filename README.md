# ShopPilot AI

An AI-powered shopping assistant and e-commerce application — under development.

ShopPilot AI is a React and TypeScript project designed to help clothing stores manage product information, track inventory availability, and eventually provide customers with AI-assisted shopping experiences.

The project is being developed incrementally, with an emphasis on clean architecture, reusable business logic, automated testing, and practical software engineering.

## Tech Stack

- React — User interface development
- TypeScript — Static typing and safer code
- Vite — Development environment and build tooling
- Vitest — Automated testing
- CSS — Styling
- pnpm— Package management
- Git & GitHub — Version control

## Implemented Features

### Product Inventory

The application currently contains five sample clothing products:

1. Essential Oversized Hoodie
2. Classic Cotton T-Shirt
3. Straight-Leg Jeans
4. Everyday Jacket
5. Relaxed Crewneck Sweatshirt

Each product includes:

- Unique product ID
- Name, description, and category
- Price and currency
- Product image references
- Multiple color and size variants
- Unique SKU for each variant
- Variant-specific stock quantities

### Inventory Availability

Inventory is managed at the product-variant level.

For example, a black hoodie in size M can have different stock availability from a white hoodie in size M.

The sample inventory includes three stock situations:

| Stock quantity | Status |
|---|---|
| 0 | Sold out |
| 1–3 | Low stock |
| 4 or more | In stock |

The low-stock threshold is a sample business rule and can be made configurable in a future implementation.

### Product Data Operations

The project uses TypeScript and JavaScript array methods to work with product information:

- `.find()` — Locate a specific product
- `.filter()` — Filter products or variants
- `.map()` — Transform product information
- `.flatMap()` — Collect variants across products
- `Set` — Identify duplicate IDs and SKUs

## Project Structure

```text
src/
├── components/
│   └── Header.tsx
├── features/
│   └── products/
│       ├── types.ts
│       ├── data.ts
│       ├── data.test.ts
│       ├── checkAvailability.ts
│       └── checkAvailability.test.ts
├── App.tsx
├── index.css
└── main.tsx

public/
└── images/
    └── products/
```

## Architecture and Technical Decisions

### Strongly Typed Product Models

Product and variant types are defined separately from the inventory data.

- `types.ts` defines the expected data structure.
- `data.ts` contains the product inventory.
- Inventory-related functions handle business logic independently of React components.

This separation makes product information easier to maintain, test, and reuse.

### Variant-Level Inventory

Products contain arrays of variants rather than storing one stock quantity for the entire product.

This allows different color and size combinations to have independent SKUs and inventory levels.

### Automated Testing

Vitest is used to verify important dataset requirements, including:

- Expected product count
- Minimum number of variants
- Unique product IDs
- Unique variant SKUs
- Non-negative stock quantities
- Positive product prices
- Sold-out and low-stock sample data
- Consistency between product and variant image references
- Product lookup and filtering

The goal is to catch incorrect inventory data early and reduce the risk of errors as the application grows.

## Getting Started

### Prerequisites

- Node.js
- pnpm

### Installation

Clone the repository and enter the project directory.

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

### Run Tests

```bash
pnpm exec vitest run
```

### Production Build

```bash
pnpm build
```

## Development Roadmap

Completed or implemented so far:

- Initial React + TypeScript setup
- Product and variant data modeling
- Five-product sample inventory
- Inventory availability logic
- Product dataset tests

**Planned improvements:**

- Dynamic product listing in React
- Product cards and category filters
- Interactive size and color selection
- Shopping cart functionality
- Backend API and persistent inventory
- AI-assisted product recommendations
- Deployment and end-to-end testing

## Current Status

ShopPilot AI is an active portfolio project. The current development focus is building reliable product data, inventory business logic, and automated tests before expanding the customer-facing interface.

AI shopping features are planned and are not yet part of the completed implementation.