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
 * Safely loads and parses cart items from localStorage using JSON.parse().
 * Returns an empty array if storage is empty, inaccessible, or contains malformed data.
 */
export function loadCart(): CartItem[] {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return [];
    }

    const rawData = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!rawData) {
      return [];
    }

    const parsedData: unknown = JSON.parse(rawData);

    if (!Array.isArray(parsedData)) {
      return [];
    }

    // Filter and keep only validated cart items
    return parsedData.filter(isValidCartItem);
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
