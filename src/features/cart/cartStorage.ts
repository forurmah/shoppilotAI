import type { Product } from "../products/types";
import type { CartItem } from "./types";

/**
 * Versioned localStorage key for persisting shopping cart items.
 * Versioning allows safe schema migrations in future updates.
 */
export const CART_STORAGE_KEY = "shoppilot_cart_v1";

/**
 * Runtime type guard to validate whether an unknown value conforms to the CartItem contract.
 * Ensures that corrupted, partially missing, or unexpected data types in localStorage are rejected.
 */
export function isValidCartItem(item: unknown): item is CartItem {
  if (typeof item !== "object" || item === null) {
    return false;
  }

  const candidate = item as Record<string, unknown>;

  const hasValidProductId =
    typeof candidate.productId === "string" &&
    candidate.productId.trim().length > 0;

  const hasValidVariantSku =
    typeof candidate.variantSku === "string" &&
    candidate.variantSku.trim().length > 0;

  const hasValidQuantity =
    typeof candidate.quantity === "number" &&
    Number.isInteger(candidate.quantity) &&
    candidate.quantity > 0;

  return hasValidProductId && hasValidVariantSku && hasValidQuantity;
}

/**
 * Pure reconciliation helper that treats persisted cart data as untrusted and
 * validates/reconciles it against the current product catalog:
 * - Discards malformed entries and invalid quantities
 * - Discards entries referencing missing products or removed variant SKUs
 * - Discards entries referencing variants with zero (or non-positive) stock
 * - Clamps quantities exceeding available stock to the variant's stock limit
 * - Deduplicates matching (productId, variantSku) lines without mutating inputs
 */
export function reconcileCartItems(
  rawItems: unknown,
  products: readonly Product[]
): CartItem[] {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  const reconciled: CartItem[] = [];
  const lineIndexByKey = new Map<string, number>();

  for (const entry of rawItems) {
    if (!isValidCartItem(entry)) {
      continue;
    }

    const product = products.find((item) => item.id === entry.productId);
    if (!product) {
      continue;
    }

    const variant = product.variants.find(
      (item) => item.sku === entry.variantSku
    );
    if (!variant || !Number.isFinite(variant.stock) || variant.stock <= 0) {
      continue;
    }

    const lineKey = `${entry.productId}\0${entry.variantSku}`;
    const existingIndex = lineIndexByKey.get(lineKey);

    if (existingIndex !== undefined) {
      const existingItem = reconciled[existingIndex];
      const mergedQuantity = Math.min(
        existingItem.quantity + entry.quantity,
        variant.stock
      );
      reconciled[existingIndex] = {
        ...existingItem,
        quantity: mergedQuantity,
      };
      continue;
    }

    lineIndexByKey.set(lineKey, reconciled.length);
    reconciled.push({
      productId: entry.productId,
      variantSku: entry.variantSku,
      quantity: Math.min(entry.quantity, variant.stock),
    });
  }

  return reconciled;
}

/**
 * Safely loads, parses, and reconciles cart items from localStorage against the
 * current product catalog. Returns an empty array if storage is empty,
 * inaccessible, or contains malformed data.
 */
export function loadCart(products: readonly Product[]): CartItem[] {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return [];
    }

    const rawData = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!rawData) {
      return [];
    }

    const parsedData: unknown = JSON.parse(rawData);
    return reconcileCartItems(parsedData, products);
  } catch (error) {
    console.warn("Failed to load cart from localStorage:", error);
    return [];
  }
}

/**
 * Safely saves cart items to localStorage using JSON.stringify().
 * Catches storage quota and security access exceptions gracefully.
 */
export function saveCart(cartItems: CartItem[]): void {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return;
    }

    const serializedData = JSON.stringify(cartItems);
    window.localStorage.setItem(CART_STORAGE_KEY, serializedData);
  } catch (error) {
    console.warn("Failed to save cart to localStorage:", error);
  }
}
