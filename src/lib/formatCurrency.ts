/**
 * Formats integer minor-unit prices (cents) into a localized currency string.
 * Falls back cleanly to USD formatting if an unrecognized currency code is passed.
 */
export function formatCurrency(
  amountCents: number,
  currency = "USD"
): string {
  const safeAmount = Number.isFinite(amountCents) ? amountCents / 100 : 0;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(safeAmount);
  } catch {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(safeAmount);
  }
}
