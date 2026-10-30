
import { it, expect } from "vitest";
import { calculateCartTotals } from "./calculateCartTotals";
import type { Product } from "../products/types";

// Shared test fixture
const testProducts: Product[] = [
  {
    id: "hoodie-001",
    name: "Essential Hoodie",
    description: "A comfortable hoodie",
    category: "Clothing",
    priceCents: 4999,
    currency: "USD",
    images: [],
    variants: [
      {
        sku: "BLK-M",
        color: "Black",
        size: "M",
        stock: 8
      },
        {
        sku: "BLK-L",
        color: "Black",
        size: "L",
        stock: 3
      }
    ]
  },
  {
    id: "tshirt-001",
    name: "Classic Cotton T-Shirt",
    description: "A comfortable cotton T-shirt",
    category: "Clothing",
    priceCents: 2499,
    currency: "USD",
    images: [],
    variants: [
      {
        sku: "TS-BLK-M",
        color: "Black",
        size: "M",
        stock: 12
      }
    ]
  }
];

// TEST 1: Empty cart
it("returns zero totals for an empty cart", () => {
  // Arrange + Act
  const result = calculateCartTotals([], []);

  // Assert
  expect(result).toEqual({
    totalQuantity: 0,
    subtotalCents: 0
  });
});

// TEST 2: One product, quantity one
it("calculates totals for one product with quantity one", () => {
  // Arrange
  const cartItems = [
    {
      productId: "hoodie-001",
      variantSku: "BLK-M",
      quantity: 1
    }
  ];

  // Act
  const result = calculateCartTotals(cartItems, testProducts);

  // Assert
  expect(result).toEqual({
    totalQuantity: 1,
    subtotalCents: 4999
  });
});

// TEST 3: One product, quantity three
it("calculates totals for one product with quantity three", () => {
  // Arrange
  const cartItems = [
    {
      productId: "hoodie-001",
      variantSku: "BLK-M",
      quantity: 3
    }
  ];

  // Act
  const result = calculateCartTotals(cartItems, testProducts);

  // Assert
  expect(result).toEqual({
    totalQuantity: 3,
    subtotalCents: 14997
  });
});

it("calculates totals for multiple products", () => {
  // Arrange
  const cartItems = [
    {
      productId: "hoodie-001",
      variantSku: "BLK-M",
      quantity: 2
    },
    {
      productId: "tshirt-001",
      variantSku: "TS-BLK-M",
      quantity: 3
    }
  ];

  // Act
  const result = calculateCartTotals(
    cartItems,
    testProducts
  );

  // Assert
  expect(result).toEqual({
    totalQuantity: 5,
    subtotalCents: 17495
  });
});
it("calculates totals for multiple variants of the same product", () => {
  const cartItems = [
    {
      productId: "hoodie-001",
      variantSku: "BLK-M",
      quantity: 2
    },
    {
      productId: "hoodie-001",
      variantSku: "BLK-L",
      quantity: 1
    }
  ];

  const result = calculateCartTotals(cartItems, testProducts);

  expect(result).toEqual({
    totalQuantity: 3,
    subtotalCents: 14997
  });
});


it("throws an error when a product does not exist", () => {
  const cartItems = [
    {
      productId: "unknown-product",
      variantSku: "BLK-M",
      quantity: 1
    }
  ];

  expect(() => {
    calculateCartTotals(cartItems, testProducts);
  }).toThrow(/product not found/i);
});


it("throws an error when a variant does not exist", () => {
  const cartItems = [
    {
      productId: "hoodie-001",
      variantSku: "INVALID-SKU",
      quantity: 1
    }
  ];

  expect(() => {
    calculateCartTotals(cartItems, testProducts);
  }).toThrow(/variant not found/i);
});

it("does not mutate the original cart items or products", () => {
  const cartItems = [
    {
      productId: "hoodie-001",
      variantSku: "BLK-M",
      quantity: 2
    }
  ];

  const originalCartItems = cartItems.map(item => ({
    ...item
  }));

  const originalProducts = testProducts.map(product => ({
    ...product,
    images: [...product.images],
    variants: product.variants.map(variant => ({
      ...variant
    }))
  }));

  calculateCartTotals(cartItems, testProducts);

  expect(cartItems).toEqual(originalCartItems);
  expect(testProducts).toEqual(originalProducts);
});


