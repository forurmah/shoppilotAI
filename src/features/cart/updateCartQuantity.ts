import type { CartItem } from "./types";

export function updateCartQuantity(
  cartItems: CartItem[],
  productId: string,
  variantSku: string,
  change: 1 | -1,
  maxStock: number
): CartItem[] {
  const existingItem = cartItems.find(
    (item) => item.productId === productId && item.variantSku === variantSku
  );

  if (existingItem === undefined) {
    return cartItems;
  }
  const nextQuantity = existingItem.quantity + change;
  if (nextQuantity<1 || nextQuantity > maxStock){
    return cartItems;
  }
  return cartItems.map((item) =>
    item.productId === productId && item.variantSku === variantSku
      ? { ...item, quantity: nextQuantity }
      : item
  );
}