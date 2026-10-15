/** @vitest-environment jsdom */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

vi.mock("./features/products/data", () => ({
  products: [],
}));

import App from "./App";

describe("Empty product catalog", () => {
  it("displays a message when no products exist", () => {
    // ACT
    render(<App />);

    // ASSERT
    expect(
      screen.getByText("No products available yet.")
    ).toBeInTheDocument();
  });
});