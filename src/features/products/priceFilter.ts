import type { Product } from "./types";

export type PriceRangeFilter =
  | "all"
  | "under-50"
  | "50-to-75"
  | "over-75";

export const PRICE_RANGE_OPTIONS: ReadonlyArray<{
  value: PriceRangeFilter;
  label: string;
}> = [
  { value: "all", label: "All prices" },
  { value: "under-50", label: "Under $50" },
  { value: "50-to-75", label: "$50 – $75" },
  { value: "over-75", label: "Over $75" },
];

/**
 * Pure helper that filters products by integer-cent price range buckets
 * without mutating the input array.
 */
export function filterProductsByPrice(
  products: readonly Product[],
  priceRange: PriceRangeFilter
): Product[] {
  switch (priceRange) {
    case "all":
      return [...products];

    case "under-50":
      return products.filter((product) => product.priceCents < 5000);

    case "50-to-75":
      return products.filter(
        (product) =>
          product.priceCents >= 5000 && product.priceCents <= 7500
      );

    case "over-75":
      return products.filter((product) => product.priceCents > 7500);
  }
}
