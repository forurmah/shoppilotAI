
import type { CartItem } from "./types";
import type { Product } from "../products/types";

type CartTotals = {
  totalQuantity: number;
  subtotalCents: number;
};

export function calculateCartTotals(
  cartItems: CartItem[],
  products: Product[]
): CartTotals {

  // 1. Calculate total quantity
  const totalQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // 2. Calculate subtotal
  const subtotalCents = cartItems.reduce(
    (total, item) => {

      // Find the p  roduct
      const product = products.find(
        (product) => product.id === item.productId
      );

      if (!product) {
        throw new Error(
          `Product not found for productId: ${item.productId}`
        );
      }

      // Find the selected variant
      const variant = product.variants.find(
        (variant) => variant.sku === item.variantSku
      );

      if (!variant) {
        throw new Error(
          `Variant not found for SKU: ${item.variantSku}`
        );
      }

      // Convert product price to cents
    

      // Calculate the line total
      const lineTotalCents = product.priceCents * item.quantity;

      // Add it to the running subtotal
      return total + lineTotalCents;

    },
    0
  );

  // 3. Return calculated totals
  return {
    totalQuantity,
    subtotalCents
  };
}
