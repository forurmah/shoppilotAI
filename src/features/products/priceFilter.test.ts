import { describe, it, expect } from "vitest";
import { filterProductsByPrice } from "./priceFilter";
import type { Product } from "./types";

const sampleProducts: Product[] = [
  {
    id: "p-under",
    name: "Cotton Tee",
    description: "Everyday tee",
    category: "T-Shirts",
    priceCents: 2499,
    currency: "USD",
    images: [],
    variants: [{ sku: "TS-1", color: "Black", size: "M", stock: 5 }],
  },
  {
    id: "p-edge-low",
    name: "Hoodie",
    description: "Fleece hoodie",
    category: "Hoodies",
    priceCents: 4999,
    currency: "USD",
    images: [],
    variants: [{ sku: "HD-1", color: "Black", size: "M", stock: 5 }],
  },
  {
    id: "p-mid-start",
    name: "Crew Sweatshirt",
    description: "Cotton sweatshirt",
    category: "Sweatshirts",
    priceCents: 5000,
    currency: "USD",
    images: [],
    variants: [{ sku: "SW-1", color: "Grey", size: "M", stock: 5 }],
  },
  {
    id: "p-mid-end",
    name: "Denim Jeans",
    description: "Straight leg jeans",
    category: "Jeans",
    priceCents: 7500,
    currency: "USD",
    images: [],
    variants: [{ sku: "JN-1", color: "Blue", size: "30", stock: 5 }],
  },
  {
    id: "p-over",
    name: "Winter Coat",
    description: "Insulated coat",
    category: "Jackets",
    priceCents: 8999,
    currency: "USD",
    images: [],
    variants: [{ sku: "JK-1", color: "Green", size: "L", stock: 5 }],
  },
];

describe("filterProductsByPrice", () => {
  it("returns all products when priceRange is 'all'", () => {
    const result = filterProductsByPrice(sampleProducts, "all");
    expect(result).toEqual(sampleProducts);
    expect(result).not.toBe(sampleProducts);
  });

  it("filters products strictly under $50 (< 5000 cents)", () => {
    const result = filterProductsByPrice(sampleProducts, "under-50");
    expect(result.map((p) => p.id)).toEqual(["p-under", "p-edge-low"]);
  });

  it("filters products from $50 through $75 inclusive (5000–7500 cents)", () => {
    const result = filterProductsByPrice(sampleProducts, "50-to-75");
    expect(result.map((p) => p.id)).toEqual(["p-mid-start", "p-mid-end"]);
  });

  it("filters products strictly over $75 (> 7500 cents)", () => {
    const result = filterProductsByPrice(sampleProducts, "over-75");
    expect(result.map((p) => p.id)).toEqual(["p-over"]);
  });

  it("returns an empty array when given an empty catalog", () => {
    expect(filterProductsByPrice([], "under-50")).toEqual([]);
  });
});
