
/** @vitest-environment jsdom */

import {
  describe,
  it,
  expect,
  afterEach,
  beforeEach,
  vi,
} from "vitest";

import {
  render,
  screen,
  cleanup,
  fireEvent,
} from "@testing-library/react";

import "@testing-library/jest-dom/vitest";

import { ProductCard } from "./ProductCard";
import { products } from "../data";

const onAddToCart = vi.fn();

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ProductCard", () => {
  // TEST 1: Product name
  it("displays the product name", () => {
    const product = products[0];

    if (!product) {
      throw new Error("Test product is missing");
    }

    render(
      <ProductCard
        product={product}
        onAddToCart={onAddToCart}
      />
    );

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

    render(
      <ProductCard
        product={product}
        onAddToCart={onAddToCart}
      />
    );

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

    render(
      <ProductCard
        product={productWithoutImages}
        onAddToCart={onAddToCart}
      />
    );

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

    render(
      <ProductCard
        product={testProduct}
        onAddToCart={onAddToCart}
      />
    );

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

    const { rerender } = render(
      <ProductCard
        product={hoodie}
        onAddToCart={onAddToCart}
      />
    );

    expect(
      screen.getByRole("heading", {
        name: "Essential Oversized Hoodie",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText("$49.99")
    ).toBeInTheDocument();

    rerender(
      <ProductCard
        product={tshirt}
        onAddToCart={onAddToCart}
      />
    );

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

    expect(
      screen.queryByRole("heading", {
        name: "Essential Oversized Hoodie",
      })
    ).not.toBeInTheDocument();
  });

  // TEST 6: Add to Cart interaction
  it("calls onAddToCart with the selected product ID and variant SKU", () => {
    const product = products[0];

    if (!product) {
      throw new Error("Test product is missing");
    }

    const firstVariant = product.variants[0];

    if (!firstVariant) {
      throw new Error("Test variant is missing");
    }

    if (firstVariant.stock <= 0) {
      throw new Error("Test variant must be in stock");
    }

    render(
      <ProductCard
        product={product}
        onAddToCart={onAddToCart}
      />
    );

    const addToCartButton = screen.getByRole("button", {
      name: /add to cart/i,
    });

    expect(addToCartButton).toBeEnabled();

    fireEvent.click(addToCartButton);

    expect(onAddToCart).toHaveBeenCalledTimes(1);

    expect(onAddToCart).toHaveBeenCalledWith(
      product.id,
      firstVariant.sku
    );
  });
});
