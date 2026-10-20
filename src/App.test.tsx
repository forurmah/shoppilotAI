/** @vitest-environment jsdom */

import { describe, it, expect, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import App from "./App";
import { products } from "./features/products/data";

// Prevent rendered components from leaking between tests
afterEach(() => {
  cleanup();
});

describe("Product catalog", () => {
  // TEST 1: Render all products
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

  // TEST 2: Search is case-insensitive
  it("filters products regardless of letter case", () => {
    // ARRANGE
    const product = products[0];

    if (!product) {
      throw new Error("Test product is missing");
    }

    // ACT
    render(<App />);

    const searchInput = screen.getByRole("searchbox", {
      name: /search products/i,
    });

    fireEvent.change(searchInput, {
      target: { value: product.name.toUpperCase() },
    });

    // ASSERT
    expect(
      screen.getByRole("heading", {
        name: product.name,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("1 product found")
    ).toBeInTheDocument();
  });

  // TEST 3: No matching products
  it("shows a message when no products match", () => {
    // ARRANGE
    render(<App />);

    const searchInput = screen.getByRole("searchbox", {
      name: /search products/i,
    });

    // ACT
    fireEvent.change(searchInput, {
      target: { value: "zzzz-no-match-12345" },
    });

    // ASSERT
    expect(
      screen.getByText(/no products match your search/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText("0 products found")
    ).toBeInTheDocument();

    for (const product of products) {
      expect(
        screen.queryByRole("heading", {
          name: product.name,
        })
      ).not.toBeInTheDocument();
    }
  });
});