import type { CartItem } from "./types";

export function addToCart(
  cartItems: CartItem[],
  productId: string,
  variantSku: string
): CartItem[] {
  const existingItem = cartItems.find(
    (item) =>
        item.productId === productId &&
        item.variantSku === variantSku
    );
    if (existingItem !== undefined) {
      return cartItems.map((item) =>
          item.productId === productId && item.variantSku === variantSku
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    }

  return [...cartItems, { productId, variantSku, quantity: 1 }];
}