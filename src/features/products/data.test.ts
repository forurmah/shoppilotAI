import { describe, it, expect } from "vitest";
import { products } from "./data";

describe("Product dataset", () => {
  // Test 1: Check total number of products
  it("should contain exactly 5 products", () => {
    expect(products).toHaveLength(5);
  });

  // Test 2: Every product must have at least 3 variants
  it("should have at least 3 variants per product", () => {
    products.forEach((product) => {
      expect(product.variants.length).toBeGreaterThanOrEqual(3);
    });
  });

  // Test 3: Product IDs must be unique
  it("should have unique product IDs", () => {
    const ids = products.map((product) => product.id);

    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  // Test 4: Variant SKUs must be unique across all products
  it("should have unique variant SKUs", () => {
    const allVariants = products.flatMap(
      (product) => product.variants
    );

    const skus = allVariants.map(
      (variant) => variant.sku
    );

    const uniqueSkus = new Set(skus);

    expect(uniqueSkus.size).toBe(skus.length);
  });

  // Test 5: Stock must never be negative
  it("should never have negative stock", () => {
    const allVariants = products.flatMap(
      (product) => product.variants
    );

    allVariants.forEach((variant) => {
      expect(variant.stock).toBeGreaterThanOrEqual(0);
    });
  });

  // Test 6: Every product must have a positive price
  it("should have positive product prices", () => {
    products.forEach((product) => {
      expect(product.priceCents).toBeGreaterThan(0);
    });
  });
  // Test 7: Check sold-out inventory
  it("should contain sold-out variants", () => {
    const allVariants = products.flatMap(
      (product) => product.variants
    );

    const soldOutVariants = allVariants.filter(
      (variant) => variant.stock === 0
    );

    expect(soldOutVariants.length).toBeGreaterThan(0);
  });

  // Test 8: Check low-stock inventory
  it("should contain low-stock variants", () => {
    const allVariants = products.flatMap(
      (product) => product.variants
    );

    const lowStockVariants = allVariants.filter(
      (variant) =>
        variant.stock > 0 && variant.stock <= 3
    );

    expect(lowStockVariants.length).toBeGreaterThan(0);
  });

  // Test 9: Validate variant image consistency
  it("should list every variant image in product images", () => {
    products.forEach((product) => {
      product.variants.forEach((variant) => {
        expect(product.images).toContain(variant.imageUrl);
      });
    });
  });

  // Test 10: Find a product by ID
  it("should find a product by ID", () => {
    const product = products.find(
      (product) => product.id === "tshirt-001"
    );

    expect(product?.name).toBe("Classic Cotton T-Shirt");
  });

  // Test 11: Filter products by category
  it("should filter products by category", () => {
    const jeans = products.filter(
      (product) => product.category === "Jeans"
    );

    expect(jeans).toHaveLength(1);
  });

  // Test 12: Extract product names
  it("should extract all product names", () => {
    const names = products.map(
      (product) => product.name
    );

    expect(names).toHaveLength(5);
    expect(names).toContain("Straight-Leg Jeans");
  });
});