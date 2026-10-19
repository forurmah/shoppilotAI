import { describe, it, expect } from "vitest";
import { checkAvailability } from "./checkAvailability";
import { products } from "./data";

describe("checkAvailability", () => {
  it("returns in-stock when the selected variant has stock", () => {
    // ARRANGE: Get a product from our dataset
    const product = products[0];

    if (!product) {
      throw new Error("Test product is missing");
    }

    // ACT: Check the availability
    const result = checkAvailability(product, "Black", "M");

    // ASSERT: Verify the result
    expect(result).toBe("in-stock");
  });
  it("returns out-of-stock when stock is zero", () => {
    // ARRANGE
    const product = products[0];

    if (!product) {
        throw new Error("Test product is missing");
    }

    // ACT
    const result = checkAvailability(product, "White", "M");

    // ASSERT
    expect(result).toBe("out-of-stock");
    });
    it("returns unavailable when the combination does not exist", () => {
    // ARRANGE
    const product = products[0];

    if (!product) {
        throw new Error("Test product is missing");
    }

    // ACT
    const result = checkAvailability(product, "White", "L");

    // ASSERT
    expect(result).toBe("unavailable");
    });
    it("does not match a variant with the wrong size", () => {
    // ARRANGE
    const product = products[0];

    if (!product) {
        throw new Error("Test product is missing");
    }

    const firstVariant = product.variants[0];

    if (!firstVariant) {
        throw new Error("Test variant is missing");
    }

    // ACT
    const result = checkAvailability(
        product,
        firstVariant.color,
        "NOT_A_REAL_SIZE"
    );

    // ASSERT
    expect(result).toBe("unavailable");
    });
});
