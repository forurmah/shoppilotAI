/** @vitest-environment jsdom */

import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { ProductDetailModal } from "./ProductDetailModal";
import { products } from "../data";

afterEach(() => {
  cleanup();
});

describe("ProductDetailModal", () => {
  it("renders nothing when product is null", () => {
    render(
      <ProductDetailModal
        product={null}
        onClose={vi.fn()}
        onAddToCart={vi.fn()}
      />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders gallery, SKU, exact stock, seller info, and variant matrix when open", () => {
    const hoodie = products[0];

    render(
      <ProductDetailModal
        product={hoodie}
        onClose={vi.fn()}
        onAddToCart={vi.fn()}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: hoodie.name })
    ).toBeInTheDocument();
    expect(screen.getByText(/Sold by Atelier North/i)).toBeInTheDocument();
    expect(screen.getByText(/SKU: HD-BLK-M/i)).toBeInTheDocument();
    expect(screen.getByText(/In stock · 8 left/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /close product details/i })
    ).toHaveFocus();
  });

  it("updates stock, SKU, image, and button state when switching variants", () => {
    const hoodie = products[0];
    const onAddToCart = vi.fn();

    render(
      <ProductDetailModal
        product={hoodie}
        onClose={vi.fn()}
        onAddToCart={onAddToCart}
      />
    );

    // Switch to White -> out-of-stock variant HD-WHT-M
    fireEvent.click(screen.getByRole("button", { name: "White" }));

    expect(screen.getByText(/SKU: HD-WHT-M/i)).toBeInTheDocument();
    const previewImg = screen.getByAltText(`${hoodie.name} preview`);
    expect(previewImg).toHaveAttribute("src", "/images/products/hoodie-WHITE.jpeg");
    expect(screen.getByRole("button", { name: /out of stock/i })).toBeDisabled();

    // Switch back to Black and click Add to Cart
    fireEvent.click(screen.getByRole("button", { name: "Black" }));
    const addButton = screen.getByRole("button", { name: /add to cart/i });
    expect(addButton).toBeEnabled();
    fireEvent.click(addButton);

    expect(onAddToCart).toHaveBeenCalledWith(hoodie.id, "HD-BLK-M");
  });

  it("closes when Escape is pressed", () => {
    const onClose = vi.fn();

    render(
      <ProductDetailModal
        product={products[0]}
        onClose={onClose}
        onAddToCart={vi.fn()}
      />
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
