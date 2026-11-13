/** @vitest-environment jsdom */

import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { SellerProfileModal } from "./SellerProfileModal";
import { sellers } from "../data";
import { products } from "../../products/data";

afterEach(() => {
  cleanup();
});

describe("SellerProfileModal", () => {
  it("renders nothing when sellerId is null", () => {
    render(
      <SellerProfileModal
        sellerId={null}
        sellers={sellers}
        products={products}
        onClose={vi.fn()}
        onSelectProduct={vi.fn()}
      />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("displays store details, verification, delivery info, product count, and catalog preview", () => {
    const onSelectProduct = vi.fn();
    render(
      <SellerProfileModal
        sellerId="atelier-north"
        sellers={sellers}
        products={products}
        onClose={vi.fn()}
        onSelectProduct={onSelectProduct}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Atelier North" })
    ).toBeInTheDocument();
    expect(screen.getByText(/Maya Lin/i)).toBeInTheDocument();
    expect(screen.getByText(/Portland, OR/i)).toBeInTheDocument();
    expect(screen.getByText(/Verified seller/i)).toBeInTheDocument();
    expect(screen.getByText(/Replies in under 2 hours/i)).toBeInTheDocument();
    expect(screen.getByText(/2 products/i)).toBeInTheDocument();

    const viewButtons = screen.getAllByRole("button", { name: /view product/i });
    expect(viewButtons.length).toBe(2);
    fireEvent.click(viewButtons[0]);
    expect(onSelectProduct).toHaveBeenCalledTimes(1);
  });

  it("shows a missing-seller state when sellerId does not match any seller", () => {
    render(
      <SellerProfileModal
        sellerId="unknown-seller-999"
        sellers={sellers}
        products={products}
        onClose={vi.fn()}
        onSelectProduct={vi.fn()}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /seller information unavailable/i })
    ).toBeInTheDocument();
  });

  it("closes on Escape and focuses the close button initially", () => {
    const onClose = vi.fn();
    render(
      <SellerProfileModal
        sellerId="loom-and-indigo"
        sellers={sellers}
        products={products}
        onClose={onClose}
        onSelectProduct={vi.fn()}
      />
    );

    expect(
      screen.getByRole("button", { name: /close seller profile/i })
    ).toHaveFocus();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
