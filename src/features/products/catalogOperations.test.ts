import { describe, it, expect } from "vitest";
import {
  filterProductsByCategory,
  searchProducts,
  sortProducts,
} from "./catalogOperations";
import type { Product } from "./types";

const sampleProducts: Product[] = [
  {
    id: "prod-hoodie",
    name: "Essential Oversized Hoodie",
    description: "Heavyweight fleece pullover",
    category: "Hoodies",
    priceCents: 4999,
    currency: "USD",
    images: ["/images/hoodie.jpeg"],
    variants: [
      { sku: "HD-1", color: "Black", size: "M", stock: 5 },
    ],
  },
  {
    id: "prod-tshirt",
    name: "Classic Cotton Tee",
    description: "Breathable everyday shirt",
    category: "T-Shirts",
    priceCents: 2499,
    currency: "USD",
    images: ["/images/tee.jpeg"],
    variants: [
      { sku: "TS-1", color: "White", size: "M", stock: 10 },
    ],
  },
  {
    id: "prod-jacket",
    name: "Alpine Shell Jacket",
    description: "Lightweight outer layer",
    category: "Jackets",
    priceCents: 8999,
    currency: "USD",
    images: ["/images/jacket.jpeg"],
    variants: [
      { sku: "JK-1", color: "Green", size: "L", stock: 3 },
    ],
  },
  {
    id: "prod-sweatshirt",
    name: "Relaxed Crew Sweatshirt",
    description: "Soft brushed cotton blend",
    category: "Sweatshirts",
    priceCents: 4999,
    currency: "USD",
    images: ["/images/sweatshirt.jpeg"],
    variants: [
      { sku: "SW-1", color: "Grey", size: "M", stock: 4 },
    ],
  },
];

describe("catalogOperations", () => {
  describe("searchProducts", () => {
    it("matches products by name", () => {
      const result = searchProducts(sampleProducts, "Alpine");
      expect(result.map((p) => p.id)).toEqual(["prod-jacket"]);
    });

    it("matches products by category", () => {
      const result = searchProducts(sampleProducts, "T-Shirts");
      expect(result.map((p) => p.id)).toEqual(["prod-tshirt"]);
    });

    it("does not match non-searchable fields such as description", () => {
      const result = searchProducts(sampleProducts, "Heavyweight fleece");
      expect(result).toEqual([]);
    });

    it("performs case-insensitive matching and trims whitespace", () => {
      const result = searchProducts(sampleProducts, "  essential oversized  ");
      expect(result.map((p) => p.id)).toEqual(["prod-hoodie"]);
    });

    it("returns all products when the query is empty or whitespace-only", () => {
      expect(searchProducts(sampleProducts, "")).toEqual(sampleProducts);
      expect(searchProducts(sampleProducts, "   ")).toEqual(sampleProducts);
    });

    it("returns an empty array when no products match", () => {
      expect(searchProducts(sampleProducts, "no-such-item")).toEqual([]);
    });

    it("returns an empty array for an empty product collection", () => {
      expect(searchProducts([], "hoodie")).toEqual([]);
    });
  });

  describe("filterProductsByCategory", () => {
    it("filters products by an existing category", () => {
      const result = filterProductsByCategory(sampleProducts, "Hoodies");
      expect(result.map((p) => p.id)).toEqual(["prod-hoodie"]);
    });

    it("filters products by another category", () => {
      const result = filterProductsByCategory(sampleProducts, "Jackets");
      expect(result.map((p) => p.id)).toEqual(["prod-jacket"]);
    });

    it("returns all products when 'all' is selected", () => {
      const result = filterProductsByCategory(sampleProducts, "all");
      expect(result).toEqual(sampleProducts);
    });

    it("returns an empty array when a category has no matching products", () => {
      const result = filterProductsByCategory(sampleProducts, "Jeans");
      expect(result).toEqual([]);
    });

    it("returns an empty array for an empty product collection", () => {
      expect(filterProductsByCategory([], "Hoodies")).toEqual([]);
      expect(filterProductsByCategory([], "all")).toEqual([]);
    });
  });

  describe("sortProducts", () => {
    it("preserves default ordering", () => {
      const result = sortProducts(sampleProducts, "default");
      expect(result.map((p) => p.id)).toEqual([
        "prod-hoodie",
        "prod-tshirt",
        "prod-jacket",
        "prod-sweatshirt",
      ]);
    });

    it("sorts products by priceCents ascending (price-low)", () => {
      const result = sortProducts(sampleProducts, "price-low");
      expect(result.map((p) => p.id)).toEqual([
        "prod-tshirt",
        "prod-hoodie",
        "prod-sweatshirt",
        "prod-jacket",
      ]);
    });

    it("sorts products by priceCents descending (price-high)", () => {
      const result = sortProducts(sampleProducts, "price-high");
      expect(result.map((p) => p.id)).toEqual([
        "prod-jacket",
        "prod-hoodie",
        "prod-sweatshirt",
        "prod-tshirt",
      ]);
    });

    it("sorts products alphabetically by name (name-az)", () => {
      const result = sortProducts(sampleProducts, "name-az");
      expect(result.map((p) => p.id)).toEqual([
        "prod-jacket",
        "prod-tshirt",
        "prod-hoodie",
        "prod-sweatshirt",
      ]);
    });

    it("preserves relative order predictably when prices are equal", () => {
      const equalPriceProducts: Product[] = [
        { ...sampleProducts[0], id: "first-equal", priceCents: 4999 },
        { ...sampleProducts[3], id: "second-equal", priceCents: 4999 },
      ];

      expect(
        sortProducts(equalPriceProducts, "price-low").map((p) => p.id)
      ).toEqual(["first-equal", "second-equal"]);

      expect(
        sortProducts(equalPriceProducts, "price-high").map((p) => p.id)
      ).toEqual(["first-equal", "second-equal"]);
    });

    it("preserves relative order predictably when names are equal", () => {
      const equalNameProducts: Product[] = [
        { ...sampleProducts[0], id: "first-name", name: "Same Name" },
        { ...sampleProducts[1], id: "second-name", name: "Same Name" },
      ];

      expect(
        sortProducts(equalNameProducts, "name-az").map((p) => p.id)
      ).toEqual(["first-name", "second-name"]);
    });

    it("returns an empty array when sorting an empty product collection", () => {
      expect(sortProducts([], "default")).toEqual([]);
      expect(sortProducts([], "price-low")).toEqual([]);
      expect(sortProducts([], "price-high")).toEqual([]);
      expect(sortProducts([], "name-az")).toEqual([]);
    });
  });

  describe("immutability", () => {
    it("does not mutate the original product array or product objects", () => {
      const input = structuredClone(sampleProducts);
      const originalSnapshot = structuredClone(sampleProducts);

      const searched = searchProducts(input, "");
      const filtered = filterProductsByCategory(input, "all");
      const sorted = sortProducts(input, "price-low");

      expect(input).toEqual(originalSnapshot);
      expect(searched).not.toBe(input);
      expect(filtered).not.toBe(input);
      expect(sorted).not.toBe(input);
    });
  });
});
