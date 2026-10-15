/** @vitest-environment jsdom */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import App from "./App";
import { products } from "./features/products/data";

describe("Product catalog", () => {
  it("renders every product from the dataset", () => {
    // ARRANGE
    expect(products.length).toBeGreaterThan(0);

    // ACT
    render(<App />);

    // ASSERT
    for (const product of products) {
      expect(
        screen.getByRole("heading", {
          name: product.name,
        })
      ).toBeInTheDocument();
    }
  });
});