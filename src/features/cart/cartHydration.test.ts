/** @vitest-environment jsdom */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { CART_STORAGE_KEY, saveCart } from "./cartStorage";
import { hydrateCartWithReport, verifyCartSaved } from "./cartHydration";
import type { Product } from "../products/types";

const catalog: Product[] = [
  {
    id: "prod-1",
    name: "Essential Hoodie",
    description: "Fleece hoodie",
    category: "Hoodies",
    priceCents: 4999,
    currency: "USD",
    images: ["/images/hoodie.jpeg"],
    variants: [
      { sku: "HD-1", color: "Black", size: "M", stock: 4 },
      { sku: "HD-0", color: "White", size: "M", stock: 0 },
    ],
  },
];

describe("cartHydration", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("returns no notice when storage is empty or matches valid items", () => {
    expect(hydrateCartWithReport(catalog)).toEqual({ items: [], notice: null });

    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ productId: "prod-1", variantSku: "HD-1", quantity: 2 }])
    );

    expect(hydrateCartWithReport(catalog)).toEqual({
      items: [{ productId: "prod-1", variantSku: "HD-1", quantity: 2 }],
      notice: null,
    });
  });

  it("returns an adjustment notice when stale items are pruned or quantities clamped", () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([
        { productId: "missing", variantSku: "X", quantity: 1 },
        { productId: "prod-1", variantSku: "HD-1", quantity: 10 },
      ])
    );

    const result = hydrateCartWithReport(catalog);
    expect(result.items).toEqual([
      { productId: "prod-1", variantSku: "HD-1", quantity: 4 },
    ]);
    expect(result.notice).toMatch(/updated to match current product availability/i);
  });

  it("returns a removal notice when all saved items are unavailable", () => {
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([{ productId: "prod-1", variantSku: "HD-0", quantity: 1 }])
    );

    const result = hydrateCartWithReport(catalog);
    expect(result.items).toEqual([]);
    expect(result.notice).toMatch(/no longer available/i);
  });

  it("returns an unreadable notice on malformed JSON", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    window.localStorage.setItem(CART_STORAGE_KEY, "{broken-json");

    const result = hydrateCartWithReport(catalog);
    expect(result.items).toEqual([]);
    expect(result.notice).toMatch(/unreadable/i);
  });

  it("reports storage errors when reading or verifying fails", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });

    const result = hydrateCartWithReport(catalog);
    expect(result.items).toEqual([]);
    expect(result.notice).toMatch(/unavailable/i);
    expect(verifyCartSaved([])).toBe(false);
  });

  it("verifies when saveCart succeeds vs when setItem fails", () => {
    const items = [{ productId: "prod-1", variantSku: "HD-1", quantity: 1 }];
    saveCart(items);
    expect(verifyCartSaved(items)).toBe(true);

    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });

    const updated = [{ productId: "prod-1", variantSku: "HD-1", quantity: 2 }];
    saveCart(updated);
    expect(verifyCartSaved(updated)).toBe(false);
  });
});
