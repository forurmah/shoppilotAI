/** @vitest-environment jsdom */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  CART_STORAGE_KEY,
  isValidCartItem,
  loadCart,
  saveCart,
} from "./cartStorage";
import type { CartItem } from "./types";

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
        variantSku: "sku-hoodie-black-m",
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

    it("rejects items with invalid, non-integer, zero, or negative quantity", () => {
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
      const result = loadCart();
      expect(result).toEqual([]);
    });

    it("loads and parses valid stored cart items", () => {
      const items: CartItem[] = [
        {
          productId: "prod-1",
          variantSku: "sku-1",
          quantity: 2,
        },
        {
          productId: "prod-2",
          variantSku: "sku-2",
          quantity: 1,
        },
      ];

      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));

      const result = loadCart();
      expect(result).toEqual(items);
    });

    it("handles malformed JSON syntax gracefully and returns an empty array", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      window.localStorage.setItem(CART_STORAGE_KEY, "invalid-json{[:");

      const result = loadCart();
      expect(result).toEqual([]);
      expect(warnSpy).toHaveBeenCalled();
    });

    it("handles stored non-array data gracefully", () => {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ notAnArray: true })
      );
      expect(loadCart()).toEqual([]);

      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(42));
      expect(loadCart()).toEqual([]);

      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify("string"));
      expect(loadCart()).toEqual([]);
    });

    it("filters out malformed items and preserves only valid CartItems", () => {
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
          productId: "prod-2",
          variantSku: "sku-2",
          quantity: -5,
        },
        {
          productId: "prod-3",
          variantSku: "sku-3",
          quantity: 1,
        },
      ];

      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(rawStored));

      const result = loadCart();
      expect(result).toEqual([
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
      ]);
    });

    it("handles storage access failures gracefully when reading", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
        throw new Error("SecurityError: Access denied");
      });

      expect(() => loadCart()).not.toThrow();
      expect(loadCart()).toEqual([]);
      expect(warnSpy).toHaveBeenCalled();
    });
  });
});
