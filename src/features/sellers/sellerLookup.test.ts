import { describe, it, expect } from "vitest";
import { products } from "../products/data";
import { sellers } from "./data";
import {
  getProductsBySeller,
  getSellerById,
  getSellerProductCount,
  getSellerProfile,
} from "./sellerLookup";

describe("sellerLookup", () => {
  it("resolves an existing seller by ID", () => {
    const seller = getSellerById(sellers, "atelier-north");
    expect(seller).toBeDefined();
    expect(seller?.storeName).toBe("Atelier North");
    expect(seller?.sellerName).toBe("Maya Lin");
  });

  it("returns undefined for missing or undefined seller IDs", () => {
    expect(getSellerById(sellers, undefined)).toBeUndefined();
    expect(getSellerById(sellers, "unknown-seller")).toBeUndefined();
  });

  it("filters products belonging to a given seller without mutating input", () => {
    const snapshot = [...products];
    const atelierProducts = getProductsBySeller(products, "atelier-north");

    expect(atelierProducts.length).toBeGreaterThan(0);
    expect(atelierProducts.every((p) => p.sellerId === "atelier-north")).toBe(
      true
    );
    expect(getSellerProductCount(products, "atelier-north")).toBe(
      atelierProducts.length
    );
    expect(products).toEqual(snapshot);
  });

  it("returns a populated SellerProfile with accurate product count and categories", () => {
    const profile = getSellerProfile(sellers, products, "loom-and-indigo");

    expect(profile).not.toBeNull();
    expect(profile?.seller.storeName).toBe("Loom & Indigo");
    expect(profile?.productCount).toBe(profile?.products.length);
    expect(profile?.productCount).toBe(2);
    expect(profile?.categories).toEqual(["Jeans", "Sweatshirts"]);
  });

  it("returns null when seller ID is missing or unknown", () => {
    expect(getSellerProfile(sellers, products, null)).toBeNull();
    expect(getSellerProfile(sellers, products, "does-not-exist")).toBeNull();
  });
});
