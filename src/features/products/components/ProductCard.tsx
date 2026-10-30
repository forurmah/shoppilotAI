
import { useState } from "react";
import type { Product } from "../types";
import { checkAvailability } from "../checkAvailability";
import "./ProductCard.css";

type ProductCardProps = {
  product: Product;
  onAddToCart: (
    productId: string,
    variantSku: string
  ) => void;
};

export function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  // Initialize selection using the first available variant
  const firstVariant = product.variants[0];



  const [selectedColor, setSelectedColor] = useState(
    firstVariant?.color ?? ""
  );

  const [selectedSize, setSelectedSize] = useState(
    firstVariant?.size ?? ""
  );

  // Find the exact variant matching the selected color and size
  const selectedVariant = product.variants.find(
    (variant) =>
      variant.color === selectedColor &&
      variant.size === selectedSize
  );

  // Check whether the selected combination is available
  const availability =
    selectedColor && selectedSize
      ? checkAvailability(
          product,
          selectedColor,
          selectedSize
        )
      : null;

  // Get unique color and size options
  const colorOptions = [
    ...new Set(
      product.variants.map((variant) => variant.color)
    ),
  ];

  const sizeOptions = [
    ...new Set(
      product.variants.map((variant) => variant.size)
    ),
  ];

  // Product image
  const imageUrl = product.images[0];

  // Format price
  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency,
  }).format(product.priceCents / 100);

  // Disable adding unavailable or out-of-stock variants
  const isAddToCartDisabled =
    !selectedVariant || availability !== "in-stock";

  // Handle Add to Cart
  const handleAddToCartClick = () => {
    if (!selectedVariant || isAddToCartDisabled) {
      return;
    }

    onAddToCart(product.id, selectedVariant.sku);
  };

  return (
    <article className="product-card">
      {/* Product image */}
      {imageUrl ? (
        <img
          className="product-card__image"
          src={imageUrl}
          alt={product.name}
          loading="lazy"
        />
      ) : (
        <div className="product-card__placeholder">
          Image unavailable
        </div>
      )}

      <div className="product-card__content">
        {/* Product information */}
        <p className="product-card__category">
          {product.category}
        </p>

        <h3 className="product-card__name">
          {product.name}
        </h3>

        <p className="product-card__description">
          {product.description}
        </p>

        <p className="product-card__price">
          {formattedPrice}
        </p>

        {/* Color selection */}
        <fieldset className="product-options">
          <legend>Color</legend>

          <div className="product-options__choices">
            {colorOptions.map((color) => (
              <button
                key={color}
                type="button"
                aria-pressed={selectedColor === color}
                className={
                  selectedColor === color
                    ? "option-button option-button--selected"
                    : "option-button"
                }
                onClick={() => setSelectedColor(color)}
              >
                {color}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Size selection */}
        <fieldset className="product-options">
          <legend>Size</legend>

          <div className="product-options__choices">
            {sizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={selectedSize === size}
                className={
                  selectedSize === size
                    ? "option-button option-button--selected"
                    : "option-button"
                }
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Selected variant summary */}
        <p
          className="product-options__summary"
          aria-live="polite"
        >
          Selected: {selectedColor || "—"} /{" "}
          {selectedSize || "—"}
        </p>

        {/* Availability status */}
        <p
          className="product-options__availability"
          role="status"
        >
          {availability === null
            ? "Select a color and size"
            : availability === "in-stock"
              ? "In stock"
              : availability === "out-of-stock"
                ? "Out of stock"
                : "Combination unavailable"}
        </p>


        <button
          type="button"
          className="product-card__add-to-cart"
          disabled={isAddToCartDisabled}
          onClick={handleAddToCartClick}
        >
          {availability === "out-of-stock"
            ? "Out of Stock"
            : availability === "unavailable"
              ? "Unavailable"
              : "Add to Cart"}
        </button>


      </div>
    </article>
  );
}
