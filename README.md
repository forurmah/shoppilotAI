# ShopPilot AI

A modern, responsive fashion e-commerce application built with **React, TypeScript, Vite, and CSS**.

ShopPilot AI is a frontend engineering portfolio project focused on creating a practical online shopping experience through reusable components, type-safe data modeling, responsive design, and automated testing.

## Project Overview

ShopPilot AI aims to provide a clean and intuitive shopping experience where customers can browse clothing products and explore product information.

The application emphasizes maintainable code, accessible interfaces, reusable React components, and real-world frontend development practices.

## Tech Stack

| Technology | Purpose |
|---|---|
| React | Reusable user interface components |
| TypeScript | Type-safe application development |
| Vite | Development server and production builds |
| CSS3 | Styling and responsive design |
| CSS Grid | Responsive product catalog |
| Flexbox | Navigation and component alignment |
| Vitest | Automated testing |
| React Testing Library | Component rendering tests |
| jest-dom | DOM-specific assertions |
| jsdom | Browser-like testing environment |
| pnpm | Package management |
| Git & GitHub | Version control |

## Features

### Product Data Model

- TypeScript interfaces for product information.
- Product identifiers, names, descriptions, categories, and prices.
- Product images and color/size variants.
- SKU and stock information for individual variants.
- Product data separated from UI components.

### Inventory Availability Logic

- Reusable stock availability functionality.
- Product variant lookup by color and size.
- Handling of available, out-of-stock, and nonexistent variants.
- Automated tests for inventory behavior.

### Reusable ProductCard Component

- Displays product information using React props.
- Uses TypeScript for type safety.
- Displays product images, names, categories, and prices.
- Reusable across the product catalog.

### Dynamic Product Catalog

- Product cards generated dynamically from product data.
- React `.map()` rendering with unique keys.
- Empty-state handling when no products exist.
- Responsive CSS Grid layout.

### Responsive Design

- Mobile-first product catalog.
- Two-column mobile layout.
- Three-column tablet layout.
- Four-column desktop layout.
- Responsive product images with consistent aspect ratios.
- Mobile-friendly navigation.
- Responsive hero section.

### Shopping Cart

- Add selected product variants to the cart
- Merge repeated additions of the same variant
- Increase and decrease item quantities
- Enforce minimum quantity of 1
- Prevent quantity increases beyond available stock
- Display variant-specific inventory
- Preserve immutable React state updates
- Unit-tested cart business logic

**Implementation:**
Cart quantity calculations are handled by a pure
TypeScript helper. React manages interaction and
state updates separately.

## Responsive Layout

ShopPilot AI uses mobile-first CSS and media queries to create a consistent shopping experience across different viewport sizes.

| Viewport Width | Product Columns |
|---|---|
| Below 640px | 2 |
| 640px–1023px | 3 |
| 1024px and above | 4 |

### Design Decisions

**CSS Grid**

The product catalog uses CSS Grid to create flexible, organized layouts that adapt to different screen sizes.

**Mobile-First Approach**

The default layout targets smaller screens, and media queries progressively enhance the interface for larger viewports.

**Responsive Images**

Product images use `aspect-ratio` and `object-fit: cover` to maintain consistent visual proportions without distortion.

**Separation of Responsibilities**

The product grid manages layout, while individual ProductCard components handle product presentation.

**Responsive Navigation**

The header adapts its layout to smaller screens while maintaining readable and accessible navigation links.

### Product Search

- Real-time product filtering by name or category
- Case-insensitive search
- Whitespace handling for search queries
- Dynamic product result count
- Helpful empty state when no products match
- Responsive search input

### Technical Implementation

Product search is implemented using React's `useState`
and JavaScript's `filter()` method.

The catalog component owns the search state and derives
the filtered products during rendering, keeping the
original product dataset unchanged.

Search behavior is verified using Vitest and
React Testing Library.

## Project Structure

The main application follows a feature-oriented folder structure:

```text
src/
├── components/
│   ├── Header.tsx
│   └── Header.css
│
├── features/
│   └── products/
│       ├── components/
│       │   ├── ProductCard.tsx
│       │   ├── ProductCard.css
│       │   └── ProductCard.test.tsx
│       │
│       ├── types.ts
│       ├── data.ts
│       └── data.test.ts
│
├── App.tsx
├── index.css
└── main.tsx
```

Additional utility files and tests support inventory availability functionality.

This structure organizes related components, data, and logic within the same feature, improving maintainability as the application grows.

## Getting Started

### Prerequisites

- Node.js compatible with the project's Vite version
- pnpm
- Git

### Installation

Clone the repository:

```bash
git clone <your-repository-url>
```

Navigate to the project directory and install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open the local URL displayed in the terminal, typically `http://localhost:5173`.

### Run Tests

```bash
pnpm exec vitest run
```

### Production Build

```bash
pnpm build
```

The production build generates optimized application assets in the `dist` directory.

## Testing Strategy

ShopPilot AI uses automated testing to verify important application behaviors.

### Product Data Tests

Validate product data structure and consistency, including:

- Required product properties.
- Product variants and SKU information.
- Stock quantities.
- Product image references.

### Inventory Tests

Verify inventory functionality for:

- Available product variants.
- Out-of-stock variants.
- Nonexistent variants.

### Component Tests

React Testing Library verifies that ProductCard components render the expected product information.

### Catalog Tests

Verify that the product catalog renders data correctly and handles empty product collections.

### Responsive Testing

Responsive layouts are manually verified using browser developer tools.

Tested viewport widths include:

- 320px
- 375px
- 768px
- 1024px
- 1440px

## Engineering Decisions

### TypeScript for Data Modeling

TypeScript provides clear data contracts and helps prevent invalid product structures during development.

### Reusable Component Architecture

Product information is passed through props rather than hardcoded into individual components.

This improves reusability, consistency, and maintainability.

### Separation of Concerns

The application separates:

- Product data
- Inventory logic
- React components
- Styling
- Automated tests

This makes individual features easier to understand, modify, and test.

### Responsive Design

CSS Grid and Flexbox are used to build layouts that adapt to different screen sizes without duplicating React components.

### Maintainable Code

The project prioritizes readable code, focused components, meaningful tests, and incremental improvements.

## Current Status

ShopPilot AI is under active development.

The current implementation focuses on reusable React components, typed product data, responsive catalog layouts, inventory logic, and automated testing.

Checkout, payment processing, backend inventory synchronization, and AI-assisted shopping functionality are not yet implemented.

## Author

Built as a frontend engineering portfolio project focused on practical problem-solving, modern web development, and software engineering best practices.