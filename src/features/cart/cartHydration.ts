import type { Product } from "../products/types";
import type { CartItem } from "./types";
import {
  CART_STORAGE_KEY,
  isValidCartItem,
  loadCart,
} from "./cartStorage";

export type CartHydrationResult = {
  items: CartItem[];
  notice: string | null;
};

/**
 * Hydrates the cart via `loadCart(products)` and inspects whether any saved
 * items were removed (stale product/SKU, sold-out variant, corrupt entry) or
 * clamped to available stock so the UI can show a non-blocking notice.
 */
export function hydrateCartWithReport(
  products: readonly Product[]
): CartHydrationResult {
  let rawStored: string | null = null;
  let storageReadFailed = false;

  try {
    if (typeof window !== "undefined" && window.localStorage) {
      rawStored = window.localStorage.getItem(CART_STORAGE_KEY);
    }
  } catch {
    storageReadFailed = true;
  }

  const items = loadCart(products);

  if (storageReadFailed) {
    return {
      items,
      notice:
        "Browser storage is unavailable. Your cart will persist for this session only.",
    };
  }

  if (!rawStored) {
    return { items, notice: null };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawStored);
  } catch {
    return {
      items,
      notice:
        "Saved cart data was unreadable and has been reset to keep your session safe.",
    };
  }

  if (!Array.isArray(parsed)) {
    return {
      items,
      notice:
        "Saved cart data was invalid and has been reset to keep your session safe.",
    };
  }

  if (parsed.length === 0) {
    return { items, notice: null };
  }

  const rawValidItems = parsed.filter(isValidCartItem);
  const rawTotalUnits = rawValidItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const reconciledTotalUnits = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const hadInvalidEntries = rawValidItems.length < parsed.length;
  const hadQuantityOrLineAdjustments =
    rawTotalUnits !== reconciledTotalUnits ||
    items.length !== rawValidItems.length;

  if (hadInvalidEntries || hadQuantityOrLineAdjustments) {
    if (items.length === 0) {
      return {
        items,
        notice:
          "Previously saved cart items are no longer available and were removed from your cart.",
      };
    }

    return {
      items,
      notice:
        "Some saved cart items or quantities were updated to match current product availability.",
    };
  }

  return { items, notice: null };
}

/**
 * Verifies whether `saveCart(cartItems)` succeeded by confirming the serialized
 * cart payload is readable in localStorage. Does not modify `cartStorage.ts`.
 */
export function verifyCartSaved(cartItems: CartItem[]): boolean {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return false;
    }

    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    return stored === JSON.stringify(cartItems);
  } catch {
    return false;
  }
}
