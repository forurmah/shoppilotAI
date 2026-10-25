
import { describe, it, expect } from "vitest";
import { addToCart } from "./addToCart";
import type { CartItem } from "./types";

describe("addToCart", () => {
  // TEST 1: Add a variant to an empty cart
  it("adds a new variant to an empty cart", () => {
    // ARRANGE
    const cartItems: CartItem[] = [];
    const productId = "prod-1";
    const variantSku = "sku-shirt-black-m";

    // ACT
    const result = addToCart(cartItems, productId, variantSku);

    // ASSERT
    expect(result).toEqual([
      {
        productId: "prod-1",
        variantSku: "sku-shirt-black-m",
        quantity: 1,
      },
    ]);
  });

  // TEST 2: Increment quantity for the same variant
  it("increments quantity when the same variant is added again", () => {
    // ARRANGE
    const cartItems: CartItem[] = [
      {
        productId: "prod-1",
        variantSku: "sku-shirt-black-m",
        quantity: 1,
      },
    ];

    const productId = "prod-1";
    const variantSku = "sku-shirt-black-m";

    // ACT
    const result = addToCart(cartItems, productId, variantSku);

    // ASSERT
    expect(result).toEqual([
      {
        productId: "prod-1",
        variantSku: "sku-shirt-black-m",
        quantity: 2,
      },
    ]);
  });
});

  it("adds a different variant as a separate cart line", () => {
    // ARRANGE
    const cartItems: CartItem[] = [
        {
        productId: "prod-1",
        variantSku: "sku-shirt-black-m",
        quantity: 1,
        },
    ];

    const productId = "prod-1";
    const variantSku = "sku-shirt-black-l";

    // ACT
    const result = addToCart(cartItems, productId, variantSku);

    // ASSERT
    expect(result).toEqual([
        {
            productId:"prod-1",
            variantSku:"sku-shirt-black-m",
            quantity:1,
        },
        {
            productId:"prod-1",
            variantSku:"sku-shirt-black-l",
            quantity:1,
        },
    ]);
});
it("does not mutate the original cart", () => {
  // ARRANGE
  const cartItems: CartItem[] = [
    {
      productId: "prod-1",
      variantSku: "sku-shirt-black-m",
      quantity: 1,
    },
  ];

  // ACT
  const result = addToCart(cartItems, "prod-1", "sku-shirt-black-m");

  // ASSERT
  // 1. the original cart is unchanged
  expect(cartItems).toEqual([
    {
      productId: "prod-1",
      variantSku: "sku-shirt-black-m",
      quantity: 1,
    },
  ]);

  // 2. the result has the updated quantity
  expect(result).toEqual([
    {
      productId: "prod-1",
      variantSku: "sku-shirt-black-m",
      quantity: 2,
    },
  ]);
});