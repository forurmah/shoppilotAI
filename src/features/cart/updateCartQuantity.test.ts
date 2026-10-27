
import { describe, it, expect } from "vitest";
import { updateCartQuantity } from "./updateCartQuantity";

describe("updateCartQuantity", () => {
  // TEST 1: Increase quantity
  it("increases the quantity of an existing cart item", () => {
    const cartItems = [
      {
        productId: "hoodie-001",
        variantSku: "hoodie-001-black-m",
        quantity: 1,
      },
    ];

    const result = updateCartQuantity(
      cartItems,
      "hoodie-001",
      "hoodie-001-black-m",
      1,
      5
    );

    expect(result[0].quantity).toBe(2);

    // The original cart must remain unchanged.
    expect(cartItems[0].quantity).toBe(1);
  });

  // TEST 2: Decrease quantity
  it("decreases the quantity of an existing cart item", () => {
    const cartItems = [
      {
        productId: "hoodie-001",
        variantSku: "hoodie-001-black-m",
        quantity: 2,
      },
    ];

    const result = updateCartQuantity(
      cartItems,
      "hoodie-001",
      "hoodie-001-black-m",
      -1,
      5
    );

    expect(result[0].quantity).toBe(1);
    expect(cartItems[0].quantity).toBe(2);
  });

  // TEST 3: Prevent quantity below 1
  it("does not decrease quantity below one", () => {
    const cartItems = [
      {
        productId: "hoodie-001",
        variantSku: "hoodie-001-black-m",
        quantity: 1,
      },
    ];

    const result = updateCartQuantity(
      cartItems,
      "hoodie-001",
      "hoodie-001-black-m",
      -1,
      5
    );

    expect(result[0].quantity).toBe(1);
    expect(cartItems[0].quantity).toBe(1);
  });

  // TEST 4: Prevent quantity above stock
  it("does not increase quantity beyond available stock", () => {
    const cartItems = [
      {
        productId: "hoodie-001",
        variantSku: "hoodie-001-black-m",
        quantity: 5,
      },
    ];

    const result = updateCartQuantity(
      cartItems,
      "hoodie-001",
      "hoodie-001-black-m",
      1,
      5
    );

    expect(result[0].quantity).toBe(5);
    expect(cartItems[0].quantity).toBe(5);
  });

  // TEST 5: Update only the matching variant
  it("updates only the matching product variant", () => {
    const cartItems = [
      {
        productId: "hoodie-001",
        variantSku: "HD-BLK-M",
        quantity: 2,
      },
      {
        productId: "hoodie-001",
        variantSku: "HD-BLK-L",
        quantity: 1,
      },
      {
        productId: "tshirt-001",
        variantSku: "TS-WHT-M",
        quantity: 3,
      },
    ];

    const result = updateCartQuantity(
      cartItems,
      "hoodie-001",
      "HD-BLK-M",
      1,
      5
    );

    expect(result).toEqual([
      {
        productId: "hoodie-001",
        variantSku: "HD-BLK-M",
        quantity: 3,
      },
      {
        productId: "hoodie-001",
        variantSku: "HD-BLK-L",
        quantity: 1,
      },
      {
        productId: "tshirt-001",
        variantSku: "TS-WHT-M",
        quantity: 3,
      },
    ]);

    // Original objects must not be mutated.
    expect(cartItems[0].quantity).toBe(2);
    expect(cartItems[1].quantity).toBe(1);
    expect(cartItems[2].quantity).toBe(3);
  });

  // TEST 6: Handle a missing cart item
  it("returns the cart unchanged when the item does not exist", () => {
    const cartItems = [
      {
        productId: "hoodie-001",
        variantSku: "HD-BLK-M",
        quantity: 2,
      },
    ];

    const result = updateCartQuantity(
      cartItems,
      "tshirt-001",
      "TS-WHT-M",
      1,
      5
    );

    expect(result).toBe(cartItems);
    expect(result[0].quantity).toBe(2);
  });
});
