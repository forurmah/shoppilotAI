import type { Product } from "./types";

export type SortOption =
  | "default"
  | "price-low"
  | "price-high"
  | "name-az";

/**
 * Filters products by checking whether the trimmed, case-insensitive query
 * appears in the product's name or category. Returns a new array without
 * mutating the input collection.
 */
export function searchProducts(
  products: readonly Product[],
  query: string
): Product[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery === "") {
    return [...products];
  }

  return products.filter((product) => {
    const matchesName = product.name
      .toLowerCase()
      .includes(normalizedQuery);
    const matchesCategory = product.category
      .toLowerCase()
      .includes(normalizedQuery);

    return matchesName || matchesCategory;
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
