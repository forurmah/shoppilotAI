/** @vitest-environment jsdom */

import { describe, it, expect, afterEach, beforeEach } from "vitest";
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
import { CART_STORAGE_KEY } from "./features/cart/cartStorage";

// Prevent rendered components and localStorage from leaking between tests
beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  cleanup();
  window.localStorage.clear();
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

  // TEST 10: Search + sorting together
  it("combines search and sorting together", () => {
    render(<App />);

    const searchInput = screen.getByRole("searchbox", {
      name: /search products/i,
    });
    const sortSelect = screen.getByRole("combobox", { name: /sort by/i });

    fireEvent.change(searchInput, { target: { value: "shirt" } });
    fireEvent.change(sortSelect, { target: { value: "price-high" } });

    const actualNames = screen
      .getAllByRole("article")
      .map((card) => within(card).getByRole("heading").textContent);

    expect(actualNames).toEqual([
      "Relaxed Sweatshirt",
      "Classic Cotton T-Shirt",
    ]);
    expect(getResultsCount()).toHaveTextContent("2 products found");
  });

  // TEST 11: Search + category + sorting all together
  it("combines search, category filtering, and sorting together", () => {
    render(<App />);

    const searchInput = screen.getByRole("searchbox", {
      name: /search products/i,
    });
    const sortSelect = screen.getByRole("combobox", { name: /sort by/i });

    fireEvent.change(searchInput, { target: { value: "shirt" } });
    fireEvent.change(sortSelect, { target: { value: "price-low" } });
    fireEvent.click(screen.getByRole("radio", { name: "Sweatshirts" }));

    const filteredNames = screen
      .getAllByRole("article")
      .map((card) => within(card).getByRole("heading").textContent);

    expect(filteredNames).toEqual(["Relaxed Sweatshirt"]);
    expect(getResultsCount()).toHaveTextContent("1 product found");

    // Resetting category to All preserves search and sort
    fireEvent.click(screen.getByRole("radio", { name: "All" }));

    const restoredNames = screen
      .getAllByRole("article")
      .map((card) => within(card).getByRole("heading").textContent);

    expect(restoredNames).toEqual([
      "Classic Cotton T-Shirt",
      "Relaxed Sweatshirt",
    ]);
  });
});

describe("Cart localStorage persistence", () => {
  it("initializes cartItems lazily from localStorage on initial render", () => {
    // ARRANGE: Pre-populate localStorage with a saved cart
    const initialItems = [
      {
        productId: products[0].id,
        variantSku: products[0].variants[0].sku,
        quantity: 2,
      },
    ];
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(initialItems)
    );

    // ACT: Render App
    render(<App />);

    // ASSERT: Cart displays restored items and count
    const cartHeading = screen.getByRole("heading", { name: /your cart \(2\)/i });
    expect(cartHeading).toBeInTheDocument();
    const cartSection = cartHeading.closest("section")!;
    expect(within(cartSection).getByText(products[0].name)).toBeInTheDocument();
  });

  it("saves cart items to localStorage when a product is added to the cart", () => {
    // ARRANGE
    render(<App />);
    const firstProduct = products[0];

    // Find the add-to-cart button for the first product
    const productCard = screen
      .getAllByRole("article")
      .find((card) => within(card).queryByRole("heading", { name: firstProduct.name }));

    expect(productCard).toBeDefined();
    const addButton = within(productCard!).getByRole("button", {
      name: /add to cart/i,
    });

    // ACT: Add product to cart
    fireEvent.click(addButton);

    // ASSERT: localStorage contains the newly added product
    const storedRaw = window.localStorage.getItem(CART_STORAGE_KEY);
    expect(storedRaw).not.toBeNull();
    const stored = JSON.parse(storedRaw!);
    expect(stored).toEqual([
      {
        productId: firstProduct.id,
        variantSku: firstProduct.variants[0].sku,
        quantity: 1,
      },
    ]);
  });

  it("persists quantity changes to localStorage", () => {
    // ARRANGE: Pre-populate with 1 item
    const firstProduct = products[0];
    const initialItems = [
      {
        productId: firstProduct.id,
        variantSku: firstProduct.variants[0].sku,
        quantity: 1,
      },
    ];
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(initialItems)
    );

    render(<App />);

    // ACT: Click increase quantity (+) button
    const increaseButton = screen.getByRole("button", {
      name: new RegExp(`increase quantity of ${firstProduct.variants[0].sku}`, "i"),
    });
    fireEvent.click(increaseButton);

    // ASSERT: localStorage is updated to quantity 2
    const stored = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!);
    expect(stored[0].quantity).toBe(2);
  });

  it("persists item removal to localStorage", () => {
    // ARRANGE: Pre-populate with 1 item
    const firstProduct = products[0];
    const initialItems = [
      {
        productId: firstProduct.id,
        variantSku: firstProduct.variants[0].sku,
        quantity: 1,
      },
    ];
    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(initialItems)
    );

    render(<App />);

    // ACT: Click remove button
    const removeButton = screen.getByRole("button", {
      name: new RegExp(`remove ${firstProduct.variants[0].sku} from cart`, "i"),
    });
    fireEvent.click(removeButton);

    // ASSERT: localStorage now contains an empty array
    const stored = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!);
    expect(stored).toEqual([]);
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it("discards stale products, removed SKUs, and zero-stock variants and clamps over-stock quantities on hydration without throwing", () => {
    // ARRANGE: Mix stale, zero-stock, over-stock, and valid entries
    const inStockProduct = products[0];
    const inStockVariant = inStockProduct.variants.find(
      (variant) => variant.stock > 0
    )!;
    const zeroStockVariant = inStockProduct.variants.find(
      (variant) => variant.stock === 0
    )!;

    const untrustedStoredCart = [
      {
        productId: "removed-product-999",
        variantSku: "OLD-SKU",
        quantity: 2,
      },
      {
        productId: inStockProduct.id,
        variantSku: "REMOVED-SKU-999",
        quantity: 1,
      },
      {
        productId: inStockProduct.id,
        variantSku: zeroStockVariant.sku,
        quantity: 1,
      },
      {
        productId: inStockProduct.id,
        variantSku: inStockVariant.sku,
        quantity: inStockVariant.stock + 50,
      },
    ];

    window.localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify(untrustedStoredCart)
    );

    // ACT: Render App (calculateCartTotals runs on initial render)
    render(<App />);

    // ASSERT: App renders cleanly with only the valid item clamped to available stock
    const cartHeading = screen.getByRole("heading", {
      name: new RegExp(`your cart \\(${inStockVariant.stock}\\)`, "i"),
    });
    expect(cartHeading).toBeInTheDocument();

    const stored = JSON.parse(window.localStorage.getItem(CART_STORAGE_KEY)!);
    expect(stored).toEqual([
      {
        productId: inStockProduct.id,
        variantSku: inStockVariant.sku,
        quantity: inStockVariant.stock,
      },
    ]);
  });
});