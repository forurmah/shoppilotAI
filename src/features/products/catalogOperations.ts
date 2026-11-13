import type { Seller } from "../sellers/types";
import type { Product } from "./types";

export type SortOption =
  | "default"
  | "price-low"
  | "price-high"
  | "name-az";

/**
 * Filters products by checking whether the trimmed, case-insensitive query
 * appears in the product's name, category, or (when sellers are supplied) the
 * assigned seller's storeName. Returns a new array without mutating inputs.
 */
export function searchProducts(
  products: readonly Product[],
  query: string,
  sellers: readonly Seller[] = []
): Product[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery === "") {
    return [...products];
  }

  const sellerNamesById = new Map(
    sellers.map((seller) => [seller.id, seller.storeName.toLowerCase()])
  );

  return products.filter((product) => {
    const matchesName = product.name
      .toLowerCase()
      .includes(normalizedQuery);
    const matchesCategory = product.category
      .toLowerCase()
      .includes(normalizedQuery);
    const storeName = product.sellerId
      ? sellerNamesById.get(product.sellerId)
      : undefined;
    const matchesStore = storeName ? storeName.includes(normalizedQuery) : false;

    return matchesName || matchesCategory || matchesStore;
  });
}

/**
 * Filters products to those matching the selected category, or returns all
 * products when `"all"` is selected. Returns a new array without mutating
 * the input collection.
 */
export function filterProductsByCategory(
  products: readonly Product[],
  selectedCategory: string
): Product[] {
  if (selectedCategory === "all") {
    return [...products];
  }

  return products.filter(
    (product) => product.category === selectedCategory
  );
}

/**
 * Returns a new sorted copy of the product collection based on the active
 * SortOption, leaving the original array and product objects untouched.
 */
export function sortProducts(
  products: readonly Product[],
  sortOption: SortOption
): Product[] {
  if (sortOption === "default") {
    return [...products];
  }

  return [...products].sort((a, b) => {
    switch (sortOption) {
      case "price-low":
        return a.priceCents - b.priceCents;

      case "price-high":
        return b.priceCents - a.priceCents;

      case "name-az":
        return a.name.localeCompare(b.name);
    }
  });
}
