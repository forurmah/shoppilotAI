import { describe, it, expect } from "vitest";
import { formatCurrency } from "./formatCurrency";

describe("formatCurrency", () => {
  it("formats USD cents accurately", () => {
    expect(formatCurrency(4999, "USD")).toBe("$49.99");
    expect(formatCurrency(0)).toBe("$0.00");
    expect(formatCurrency(125000, "USD")).toBe("$1,250.00");
  });

  it("supports other valid ISO currency codes", () => {
    expect(formatCurrency(2500, "EUR")).toContain("25.00");
  });

  it("handles invalid currency codes or non-finite numbers safely", () => {
    expect(formatCurrency(1999, "INVALID")).toBe("$19.99");
    expect(formatCurrency(Number.NaN, "USD")).toBe("$0.00");
  });
});
