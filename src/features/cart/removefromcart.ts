import type { CartItem } from "./types";

export function removeFromCart(
  items: CartItem[],
  productId: string,
  variantSku: string
): CartItem[] {
 return items.filter(
    (item)=> !(item.productId===productId&&item.variantSku===variantSku)
 );
}