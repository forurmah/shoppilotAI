import type { Product } from "./types";

export type AvailabilityStatus =
  | "in-stock"
  | "out-of-stock"
  | "unavailable";

export function checkAvailability(
  product: Product,
  color: string,
  size: string
): AvailabilityStatus {

  const selectedVariant = product.variants.find(
    (variant) =>
      variant.color === color &&
      variant.size === size
  );


  if (!selectedVariant) {
    return "unavailable";
  }

  if (selectedVariant.stock > 0) {
    return "in-stock";
  }

  return "out-of-stock";
}