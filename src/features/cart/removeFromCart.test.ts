import { describe, it, expect } from "vitest";
import { removeFromCart } from "./removeFromCart";
import type { CartItem } from "./types";

describe("removeFromCart", () => {
  it("removes the selected variant and preserves other items", () => {
    const cartItems: CartItem[] = [
      { productId: "hoodie-001", variantSku: "BLK-M", quantity: 2 },
      { productId: "hoodie-001", variantSku: "BLK-L", quantity: 1 },
      { productId: "shirt-001", variantSku: "WHT-M", quantity: 3 },
    ];

    const result = removeFromCart(cartItems, "hoodie-001", "BLK-M");

    expect(result).toEqual([
      { productId: "hoodie-001", variantSku: "BLK-L", quantity: 1 },
      { productId: "shirt-001", variantSku: "WHT-M", quantity: 3 },
    ]);
  });

  it("does not mutate the original cart", () => {
    const cartItems: CartItem[] = [
      { productId: "hoodie-001", variantSku: "BLK-M", quantity: 2 },
      { productId: "hoodie-001", variantSku: "BLK-L", quantity: 1 },
    ];

    const originalCart = structuredClone(cartItems);
    const result = removeFromCart(cartItems, "hoodie-001", "BLK-M");

    expect(cartItems).toEqual(originalCart);
    expect(result).toEqual([
      { productId: "hoodie-001", variantSku: "BLK-L", quantity: 1 },
    ]);
    expect(result).not.toBe(cartItems);
  });
});
