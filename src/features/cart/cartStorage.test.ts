/** @vitest-environment jsdom */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  CART_STORAGE_KEY,
  isValidCartItem,
  loadCart,
  reconcileCartItems,
  saveCart,
} from "./cartStorage";
import type { CartItem } from "./types";
import type { Product } from "../products/types";

const testCatalog: Product[] = [
  {
    id: "prod-1",
    name: "Essential Hoodie",
    description: "Warm fleece hoodie",
    category: "Hoodies",
    priceCents: 4999,
    currency: "USD",
    images: ["/images/hoodie.jpeg"],
    variants: [
      {
        sku: "sku-1",
        color: "Black",
        size: "M",
        stock: 5,
      },
      {
        sku: "sku-zero",
        color: "White",
        size: "M",
        stock: 0,
      },
    ],
  },
  {
    id: "prod-3",
    name: "Classic T-Shirt",
    description: "Cotton T-shirt",
    category: "T-Shirts",
    priceCents: 2499,
    currency: "USD",
    images: ["/images/tshirt.jpeg"],
    variants: [
      {
        sku: "sku-3",
        color: "Black",
        size: "L",
        stock: 3,
      },
    ],
  },
];

describe("cartStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("CART_STORAGE_KEY", () => {
    it("defines a versioned key string", () => {
      expect(CART_STORAGE_KEY).toBe("shoppilot_cart_v1");
      expect(CART_STORAGE_KEY).toMatch(/_v\d+$/);
    });
  });

  describe("isValidCartItem", () => {
    it("returns true for a valid CartItem", () => {
      const validItem: CartItem = {
        productId: "prod-1",
        variantSku: "sku-1",
        quantity: 2,
      };

      expect(isValidCartItem(validItem)).toBe(true);
    });

    it("rejects non-object or null values", () => {
      expect(isValidCartItem(null)).toBe(false);
      expect(isValidCartItem(undefined)).toBe(false);
      expect(isValidCartItem("string")).toBe(false);
      expect(isValidCartItem(123)).toBe(false);
      expect(isValidCartItem(true)).toBe(false);
      expect(isValidCartItem([])).toBe(false);
    });

    it("rejects items with missing, empty, or non-string productId", () => {
      expect(
        isValidCartItem({
          variantSku: "sku-1",
          quantity: 1,
        })
      ).toBe(false);

      expect(
        isValidCartItem({
          productId: "",
          variantSku: "sku-1",
          quantity: 1,
        })
      ).toBe(false);

      expect(
        isValidCartItem({
          productId: "   ",
          variantSku: "sku-1",
          quantity: 1,
        })
      ).toBe(false);

      expect(
        isValidCartItem({
          productId: 123,
          variantSku: "sku-1",
          quantity: 1,
        })
      ).toBe(false);
    });

    it("rejects items with missing, empty, or non-string variantSku", () => {
      expect(
        isValidCartItem({
          productId: "prod-1",
          quantity: 1,
        })
      ).toBe(false);

      expect(
        isValidCartItem({
          productId: "prod-1",
          variantSku: "",
          quantity: 1,
        })
      ).toBe(false);

      expect(
        isValidCartItem({
          productId: "prod-1",
          variantSku: "   ",
          quantity: 1,
        })
      ).toBe(false);

      expect(
        isValidCartItem({
          productId: "prod-1",
          variantSku: null,
          quantity: 1,
        })
      ).toBe(false);
    });

    it("rejects items with invalid, non-integer, zero, negative, or non-finite quantity", () => {
      expect(
        isValidCartItem({
          productId: "prod-1",
          variantSku: "sku-1",
          quantity: 0,
        })
      ).toBe(false);

      expect(
        isValidCartItem({
          productId: "prod-1",
          variantSku: "sku-1",
          quantity: -1,
        })
      ).toBe(false);

      expect(
        isValidCartItem({
          productId: "prod-1",
          variantSku: "sku-1",
          quantity: 1.5,
        })
      ).toBe(false);

      expect(
        isValidCartItem({
          productId: "prod-1",
          variantSku: "sku-1",
          quantity: "1",
        })
      ).toBe(false);

      expect(
        isValidCartItem({
          productId: "prod-1",
          variantSku: "sku-1",
          quantity: NaN,
        })
      ).toBe(false);

      expect(
        isValidCartItem({
          productId: "prod-1",
          variantSku: "sku-1",
          quantity: Infinity,
        })
      ).toBe(false);
    });
  });

  describe("reconcileCartItems", () => {
    it("preserves valid cart items without altering them", () => {
      const items: CartItem[] = [
        { productId: "prod-1", variantSku: "sku-1", quantity: 2 },
        { productId: "prod-3", variantSku: "sku-3", quantity: 3 },
      ];

      const result = reconcileCartItems(items, testCatalog);
      expect(result).toEqual(items);
    });

    it("discards items referencing nonexistent products", () => {
      const items: CartItem[] = [
        { productId: "removed-prod", variantSku: "sku-1", quantity: 1 },
        { productId: "prod-1", variantSku: "sku-1", quantity: 2 },
      ];

      expect(reconcileCartItems(items, testCatalog)).toEqual([
        { productId: "prod-1", variantSku: "sku-1", quantity: 2 },
      ]);
    });

    it("discards items referencing removed variant SKUs", () => {
      const items: CartItem[] = [
        { productId: "prod-1", variantSku: "removed-sku", quantity: 1 },
        { productId: "prod-3", variantSku: "sku-3", quantity: 1 },
      ];

      expect(reconcileCartItems(items, testCatalog)).toEqual([
        { productId: "prod-3", variantSku: "sku-3", quantity: 1 },
      ]);
    });

    it("discards items referencing variants with zero stock", () => {
      const items: CartItem[] = [
        { productId: "prod-1", variantSku: "sku-zero", quantity: 1 },
        { productId: "prod-1", variantSku: "sku-1", quantity: 2 },
      ];

      expect(reconcileCartItems(items, testCatalog)).toEqual([
        { productId: "prod-1", variantSku: "sku-1", quantity: 2 },
      ]);
    });

    it("clamps quantities exceeding available stock to the variant stock limit", () => {
      const items: CartItem[] = [
        { productId: "prod-1", variantSku: "sku-1", quantity: 12 },
        { productId: "prod-3", variantSku: "sku-3", quantity: 4 },
      ];

      expect(reconcileCartItems(items, testCatalog)).toEqual([
        { productId: "prod-1", variantSku: "sku-1", quantity: 5 },
        { productId: "prod-3", variantSku: "sku-3", quantity: 3 },
      ]);
    });

    it("deduplicates repeated productId/variantSku entries capped at available stock", () => {
      const items: CartItem[] = [
        { productId: "prod-1", variantSku: "sku-1", quantity: 3 },
        { productId: "prod-1", variantSku: "sku-1", quantity: 4 },
      ];

      expect(reconcileCartItems(items, testCatalog)).toEqual([
        { productId: "prod-1", variantSku: "sku-1", quantity: 5 },
      ]);
    });

    it("returns an empty array when catalog is empty", () => {
      const items: CartItem[] = [
        { productId: "prod-1", variantSku: "sku-1", quantity: 2 },
      ];

      expect(reconcileCartItems(items, [])).toEqual([]);
    });

    it("does not mutate the input cart items or product catalog", () => {
      const inputItems: CartItem[] = [
        { productId: "prod-1", variantSku: "sku-1", quantity: 99 },
        { productId: "missing", variantSku: "sku-x", quantity: 1 },
      ];
      const originalItemsSnapshot = structuredClone(inputItems);
      const originalCatalogSnapshot = structuredClone(testCatalog);

      const result = reconcileCartItems(inputItems, testCatalog);

      expect(result).toEqual([
        { productId: "prod-1", variantSku: "sku-1", quantity: 5 },
      ]);
      expect(inputItems).toEqual(originalItemsSnapshot);
      expect(testCatalog).toEqual(originalCatalogSnapshot);
      expect(result[0]).not.toBe(inputItems[0]);
    });
  });

  describe("saveCart", () => {
    it("serializes and saves cart items using JSON.stringify to localStorage", () => {
      const items: CartItem[] = [
        {
          productId: "prod-1",
          variantSku: "sku-1",
          quantity: 3,
        },
      ];

      saveCart(items);

      const stored = window.localStorage.getItem(CART_STORAGE_KEY);
      expect(stored).toBe(JSON.stringify(items));
    });

    it("handles storage access failures gracefully without throwing", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
        throw new Error("QuotaExceededError");
      });

      const items: CartItem[] = [
        {
          productId: "prod-1",
          variantSku: "sku-1",
          quantity: 1,
        },
      ];

      expect(() => saveCart(items)).not.toThrow();
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  describe("loadCart", () => {
    it("returns an empty array when nothing is stored", () => {
      const result = loadCart(testCatalog);
      expect(result).toEqual([]);
    });

    it("loads and parses valid stored cart items matching the catalog", () => {
      const items: CartItem[] = [
        {
          productId: "prod-1",
          variantSku: "sku-1",
          quantity: 2,
        },
        {
          productId: "prod-3",
          variantSku: "sku-3",
          quantity: 1,
        },
      ];

      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));

      const result = loadCart(testCatalog);
      expect(result).toEqual(items);
    });

    it("handles malformed JSON syntax gracefully and returns an empty array", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      window.localStorage.setItem(CART_STORAGE_KEY, "invalid-json{[:");

      const result = loadCart(testCatalog);
      expect(result).toEqual([]);
      expect(warnSpy).toHaveBeenCalled();
    });

    it("handles unexpected stored data structures gracefully", () => {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ notAnArray: true })
      );
      expect(loadCart(testCatalog)).toEqual([]);

      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(42));
      expect(loadCart(testCatalog)).toEqual([]);

      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify("string"));
      expect(loadCart(testCatalog)).toEqual([]);

      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(null));
      expect(loadCart(testCatalog)).toEqual([]);
    });

    it("filters out malformed, stale, zero-stock, and invalid-quantity items while clamping over-stock quantities", () => {
      const rawStored = [
        {
          productId: "prod-1",
          variantSku: "sku-1",
          quantity: 2,
        },
        {
          corrupted: "item",
        },
        null,
        "not-an-item",
        {
          productId: "missing-product",
          variantSku: "sku-1",
          quantity: 1,
        },
        {
          productId: "prod-1",
          variantSku: "removed-sku",
          quantity: 1,
        },
        {
          productId: "prod-1",
          variantSku: "sku-zero",
          quantity: 1,
        },
        {
          productId: "prod-3",
          variantSku: "sku-3",
          quantity: -5,
        },
        {
          productId: "prod-3",
          variantSku: "sku-3",
          quantity: 10,
        },
      ];

      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(rawStored));

      const result = loadCart(testCatalog);
      expect(result).toEqual([
        {
          productId: "prod-1",
          variantSku: "sku-1",
          quantity: 2,
        },
        {
          productId: "prod-3",
          variantSku: "sku-3",
          quantity: 3,
        },
      ]);
    });

    it("handles storage access failures gracefully when reading", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("SecurityError: Access denied");
      });

      expect(() => loadCart(testCatalog)).not.toThrow();
      expect(loadCart(testCatalog)).toEqual([]);
      expect(warnSpy).toHaveBeenCalled();
    });
  });
});
