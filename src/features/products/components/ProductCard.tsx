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

export function ProductCard({ product ,onAddToCart}: ProductCardProps) {
  const firstVariant = product.variants[0];

  const [selectedColor, setSelectedColor] = useState(
    firstVariant?.color ?? ""
  );

  const [selectedSize, setSelectedSize] = useState(
    firstVariant?.size ?? ""
  );
  const availability =
    selectedColor && selectedSize
      ? checkAvailability(product, selectedColor, selectedSize)
      : null;
  const selectedVariant = product.variants.find(
    (variant) =>
      variant.color === selectedColor &&
      variant.size === selectedSize
  );

  const colorOptions = [
    ...new Set(product.variants.map((variant) => variant.color)),
  ];

  const sizeOptions = [
    ...new Set(product.variants.map((variant) => variant.size)),
    ];

  const imageUrl = product.images[0];

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency,
  }).format(product.price);

  return (
    <article className="product-card">
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

        <p className="product-options__summary" aria-live="polite">
          Selected: {selectedColor || "—"} / {selectedSize || "—"}
        </p>
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
          disabled={availability !== "in-stock" }
          onClick={()=> {
             if(!selectedVariant || availability !== "in-stock"){
              return;
            }
            onAddToCart(product.id,selectedVariant.sku)
          }}
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}