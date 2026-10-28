import { describe, it, expect } from "vitest";
import { removeFromCart } from "./removefromcart";
import type { CartItem } from "./types";

describe("removeFromCart", () => {
  // TEST 1: Remove a specific variant from the cart
  it("removes the selected variant and preserves other items", () => {
    // ARRANGE
    const cartItems: CartItem[] = [
      { productId: "hoodie-001", variantSku: "BLK-M", quantity: 2 },
      { productId: "hoodie-001", variantSku: "BLK-L", quantity: 1 },
      { productId: "shirt-001", variantSku: "WHT-M", quantity: 3 },
    ];

    const productId = "hoodie-001";
    const variantSku = "BLK-M";

    // ACT
    const result = removeFromCart(cartItems, productId, variantSku);

    // ASSERT
    expect(result).toEqual([
      { productId: "hoodie-001", variantSku: "BLK-L", quantity: 1 },
      { productId: "shirt-001", variantSku: "WHT-M", quantity: 3 },
    ]);
  });
  // TEST 2: Verify the original cart is not mutated
  it("does not mutate the original cart", () => {
    // ARRANGE
    const cartItems: CartItem[] = [
      { productId: "hoodie-001", variantSku: "BLK-M", quantity: 2 },
      { productId: "hoodie-001", variantSku: "BLK-L", quantity: 1 },
    ];

    const originalCart = structuredClone(cartItems);

    // ACT
    const result = removeFromCart(cartItems, "hoodie-001", "BLK-M");

    // ASSERT
    expect(cartItems).toEqual(originalCart);

    expect(result).toEqual([
      { productId: "hoodie-001", variantSku: "BLK-L", quantity: 1 },
    ]);

    expect(result).not.toBe(cartItems);
  });
});
