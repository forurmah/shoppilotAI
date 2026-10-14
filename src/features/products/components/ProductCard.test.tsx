/** @vitest-environment jsdom */

import { describe, it, expect, afterEach } from "vitest";
import {
  render,
  screen,
  cleanup,
} from "@testing-library/react";

import "@testing-library/jest-dom/vitest";

import { ProductCard } from "./ProductCard";
import { products } from "../data";

// Clean up rendered components after each test
afterEach(() => {
  cleanup();
});

describe("ProductCard", () => {
  // TEST 1: Product name
  it("displays the product name", () => {
    const product = products[0];

    if (!product) {
      throw new Error("Test product is missing");
    }

    render(<ProductCard product={product} />);

    expect(
      screen.getByRole("heading", { name: product.name })
    ).toBeInTheDocument();
  });

  // TEST 2: Product category
  it("displays the product category", () => {
    const product = products[0];

    if (!product) {
      throw new Error("Test product is missing");
    }

    render(<ProductCard product={product} />);

    expect(
      screen.getByText(product.category)
    ).toBeInTheDocument();
  });

  // TEST 3: Missing image
  it("displays a fallback when the product has no images", () => {
    const product = products[0];

    if (!product) {
      throw new Error("Test product is missing");
    }

    const productWithoutImages = {
      ...product,
      images: [],
    };

    render(<ProductCard product={productWithoutImages} />);

    expect(
      screen.getByText("Image unavailable")
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("img")
    ).not.toBeInTheDocument();
  });

  // TEST 4: Formatted price
  it("displays the correctly formatted product price", () => {
    const product = products[0];

    if (!product) {
      throw new Error("Test product is missing");
    }

    const testProduct = {
      ...product,
      price: 49.99,
      currency: "USD",
    };

    render(<ProductCard product={testProduct} />);

    expect(
      screen.getByText("$49.99")
    ).toBeInTheDocument();
  });

  // TEST 5: Component reusability
  it("renders different products using the same component", () => {
    const baseProduct = products[0];

    if (!baseProduct) {
      throw new Error("Test product is missing");
    }

    const hoodie = {
      ...baseProduct,
      id: "test-hoodie",
      name: "Essential Oversized Hoodie",
      category: "Hoodies",
      price: 49.99,
      currency: "USD",
    };

    const tshirt = {
      ...baseProduct,
      id: "test-tshirt",
      name: "Classic Cotton T-Shirt",
      category: "T-Shirts",
      price: 24.99,
      currency: "USD",
    };

    // Render the hoodie
    const { rerender } = render(
      <ProductCard product={hoodie} />
    );

    expect(
      screen.getByRole("heading", {
        name: "Essential Oversized Hoodie",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("$49.99")
    ).toBeInTheDocument();

    // Update the component with a different product
    rerender(<ProductCard product={tshirt} />);

    // Verify the T-shirt information
    expect(
      screen.getByRole("heading", {
        name: "Classic Cotton T-Shirt",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("T-Shirts")
    ).toBeInTheDocument();

    expect(
      screen.getByText("$24.99")
    ).toBeInTheDocument();

    // Verify the old product name disappeared
    expect(
      screen.queryByRole("heading", {
        name: "Essential Oversized Hoodie",
      })
    ).not.toBeInTheDocument();
  });
});