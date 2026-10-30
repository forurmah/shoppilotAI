/** @vitest-environment jsdom */

import { describe, it, expect, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import App from "./App";
import { products } from "./features/products/data";

// Prevent rendered components from leaking between tests
afterEach(() => {
  cleanup();
});

// The results count renders as "5 products found" / "1 product found".
// Matching by text keeps the tests independent of ARIA roles.
const getResultsCount = () => screen.getByText(/^\d+ products? found$/);

describe("Product catalog", () => {
  // TEST 1: Render all products
  it("renders every product from the dataset", () => {
    // ARRANGE
    expect(products.length).toBeGreaterThan(0);

    // ACT
    render(<App />);

    // ASSERT
    expect(getResultsCount()).toHaveTextContent(
      `${products.length} products found`
    );

    for (const product of products) {
      expect(
        screen.getByRole("heading", { name: product.name })
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
      screen.getByRole("heading", { name: product.name })
    ).toBeInTheDocument();

    expect(screen.getByText("1 product found")).toBeInTheDocument();
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

    expect(screen.getByText("0 products found")).toBeInTheDocument();

    for (const product of products) {
      expect(
        screen.queryByRole("heading", { name: product.name })
      ).not.toBeInTheDocument();
    }
  });

  // TEST 4: Category filter
  it("shows only Hoodies when the category is selected", () => {
    // ARRANGE
    const hoodie = products.find(
      (product) => product.category === "Hoodies"
    );

    const otherProduct = products.find(
      (product) => product.category !== "Hoodies"
    );

    if (!hoodie || !otherProduct) {
      throw new Error("Required test products are missing");
    }

    render(<App />);

    // ACT
    fireEvent.click(screen.getByRole("radio", { name: "Hoodies" }));

    // ASSERT
    expect(
      screen.getByRole("heading", { name: hoodie.name })
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("heading", { name: otherProduct.name })
    ).not.toBeInTheDocument();
  });

  // TEST 5: Reset category
  it("restores all products when All is selected", () => {
    // ARRANGE
    const otherProduct = products.find(
      (product) => product.category !== "Hoodies"
    );

    if (!otherProduct) {
      throw new Error("A non-hoodie product is required");
    }

    render(<App />);

    // ACT 1: Select Hoodies
    fireEvent.click(screen.getByRole("radio", { name: "Hoodies" }));

    // ASSERT 1: Another category is hidden
    expect(
      screen.queryByRole("heading", { name: otherProduct.name })
    ).not.toBeInTheDocument();

    // ACT 2: Reset to All
    fireEvent.click(screen.getByRole("radio", { name: "All" }));

    // ASSERT 2: All products are restored
    for (const product of products) {
      expect(
        screen.getByRole("heading", { name: product.name })
      ).toBeInTheDocument();
    }
  });

  // TEST 6: Search + category together
  it("combines search and category filtering correctly", () => {
    // ARRANGE
    const hoodie = products.find(
      (product) => product.category === "Hoodies"
    );

    const otherProduct = products.find(
      (product) => product.category !== "Hoodies"
    );

    if (!hoodie || !otherProduct) {
      throw new Error("Required test products are missing");
    }

    render(<App />);

    // ACT 1: Search for the hoodie
    const searchInput = screen.getByRole("searchbox", {
      name: /search products/i,
    });

    fireEvent.change(searchInput, {
      target: { value: hoodie.name },
    });

    // ACT 2: Select a different category
    fireEvent.click(
      screen.getByRole("radio", { name: otherProduct.category })
    );

    // ASSERT 1: No products match both conditions
    expect(getResultsCount()).toHaveTextContent("0 products found");

    // ACT 3: Select Hoodies again
    fireEvent.click(screen.getByRole("radio", { name: "Hoodies" }));

    // ASSERT 2: Matching hoodie is restored
    expect(
      screen.getByRole("heading", { name: hoodie.name })
    ).toBeInTheDocument();

    // ASSERT 3: Search query was preserved
    expect(searchInput).toHaveValue(hoodie.name);
  });

  // TEST 7: Sort by price, low to high
  it("sorts products by price from low to high", () => {
    // ARRANGE
    render(<App />);

    // ACT
    const sortSelect = screen.getByRole("combobox", { name: /sort by/i });

    fireEvent.change(sortSelect, { target: { value: "price-low" } });

    // ASSERT
    const actualNames = screen
      .getAllByRole("article")
      .map((card) => within(card).getByRole("heading").textContent);

    const expectedNames = [...products]
      .sort((a, b) => a.priceCents - b.priceCents)
      .map((product) => product.name);

    expect(actualNames).toEqual(expectedNames);
  });

  // TEST 8: Sort by price, high to low
  it("sorts products by price from high to low", () => {
    // ARRANGE
    render(<App />);

    // ACT
    const sortSelect = screen.getByRole("combobox", { name: /sort by/i });

    fireEvent.change(sortSelect, { target: { value: "price-high" } });

    // ASSERT
    const actualNames = screen
      .getAllByRole("article")
      .map((card) => within(card).getByRole("heading").textContent);

    const expectedNames = [...products]
      .sort((a, b) => b.priceCents - a.priceCents)
      .map((product) => product.name);

    expect(actualNames).toEqual(expectedNames);
  });

  // TEST 9: Sort by name, A to Z
  it("sorts products alphabetically from A to Z", () => {
    // ARRANGE
    render(<App />);

    // ACT
    const sortSelect = screen.getByRole("combobox", { name: /sort by/i });

    fireEvent.change(sortSelect, { target: { value: "name-az" } });

    // ASSERT
    const actualNames = screen
      .getAllByRole("article")
      .map((card) => within(card).getByRole("heading").textContent);

    const expectedNames = [...products]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((product) => product.name);

    expect(actualNames).toEqual(expectedNames);
  });
});