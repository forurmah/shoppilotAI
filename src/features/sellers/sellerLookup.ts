import type { Category, Product } from "../products/types";
import type { Seller } from "./types";

export type SellerProfile = {
  seller: Seller;
  products: Product[];
  productCount: number;
  categories: Category[];
};

/**
 * Resolves a seller by ID from the supplied seller list.
 */
export function getSellerById(
  sellerList: readonly Seller[],
  sellerId: string | undefined
): Seller | undefined {
  if (!sellerId) {
    return undefined;
  }

  return sellerList.find((seller) => seller.id === sellerId);
}

/**
 * Returns all catalog products belonging to a specific seller without mutating inputs.
 */
export function getProductsBySeller(
  productList: readonly Product[],
  sellerId: string
): Product[] {
  return productList.filter((product) => product.sellerId === sellerId);
}

/**
 * Counts how many active catalog listings belong to a specific seller.
 */
export function getSellerProductCount(
  productList: readonly Product[],
  sellerId: string
): number {
  return getProductsBySeller(productList, sellerId).length;
}

/**
 * Derives unique storefront categories combining seller metadata and active listings.
 */
export function getSellerCategories(
  seller: Seller,
  sellerProducts: readonly Product[]
): Category[] {
  const fromProducts = sellerProducts.map((product) => product.category);
  return [...new Set([...seller.categories, ...fromProducts])];
}

/**
 * Resolves full seller profile details alongside that seller's catalog preview.
 */
export function getSellerProfile(
  sellerList: readonly Seller[],
  productList: readonly Product[],
  sellerId: string | null | undefined
): SellerProfile | null {
  if (!sellerId) {
    return null;
  }

  const seller = getSellerById(sellerList, sellerId);
  if (!seller) {
    return null;
  }

  const sellerProducts = getProductsBySeller(productList, seller.id);
  return {
    seller,
    products: sellerProducts,
    productCount: sellerProducts.length,
    categories: getSellerCategories(seller, sellerProducts),
  };
}
