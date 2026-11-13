import { useState } from "react";
import { formatCurrency } from "../../../lib/formatCurrency";
import type { Seller } from "../../sellers/types";
import { sellers as defaultSellers } from "../../sellers/data";
import { getSellerById } from "../../sellers/sellerLookup";
import { SellerBadge } from "../../sellers/components/SellerBadge";
import type { Product } from "../types";
import { checkAvailability } from "../checkAvailability";
import "./ProductCard.css";

type ProductCardProps = {
  product: Product;
  seller?: Seller | null;
  onAddToCart: (productId: string, variantSku: string) => void;
  onViewDetails?: (product: Product) => void;
  onViewSeller?: (sellerId: string) => void;
};

export function ProductCard({
  product,
  seller,
  onAddToCart,
  onViewDetails,
  onViewSeller,
}: ProductCardProps) {
  const resolvedSeller =
    seller === undefined
      ? getSellerById(defaultSellers, product.sellerId)
      : seller;

  const firstVariant = product.variants[0];

  const [selectedColor, setSelectedColor] = useState(
    firstVariant?.color ?? ""
  );

  const [selectedSize, setSelectedSize] = useState(
    firstVariant?.size ?? ""
  );

  const selectedVariant = product.variants.find(
    (variant) =>
      variant.color === selectedColor && variant.size === selectedSize
  );

  const availability =
    selectedColor && selectedSize
      ? checkAvailability(product, selectedColor, selectedSize)
      : null;

  const colorOptions = [
    ...new Set(product.variants.map((variant) => variant.color)),
  ];

  const sizeOptions = [
    ...new Set(product.variants.map((variant) => variant.size)),
  ];

  const colorPreviewImageUrl = product.variants.find(
    (variant) => variant.color === selectedColor && variant.imageUrl
  )?.imageUrl;

  const imageUrl =
    product.images.length === 0
      ? undefined
      : (selectedVariant?.imageUrl ?? colorPreviewImageUrl ?? product.images[0]);

  const formattedPrice = formatCurrency(product.priceCents, product.currency);

  const isAddToCartDisabled =
    !selectedVariant || availability !== "in-stock";

  const handleAddToCartClick = () => {
    if (!selectedVariant || isAddToCartDisabled) {
      return;
    }

    onAddToCart(product.id, selectedVariant.sku);
  };

  const mediaContent = imageUrl ? (
    <img
      className="product-card__image"
      src={imageUrl}
      alt={product.name}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  ) : (
    <div className="product-card__placeholder">Image unavailable</div>
  );

  return (
    <article className="product-card">
      {onViewDetails ? (
        <button
          type="button"
          className="product-card__media-button"
          aria-label={`Open ${product.name} preview`}
          onClick={() => onViewDetails(product)}
        >
          {mediaContent}
        </button>
      ) : (
        mediaContent
      )}

      <div className="product-card__content">
        <p className="product-card__category">
          <span>{product.category}</span>
        </p>

        <h3 className="product-card__name">{product.name}</h3>

        <div className="product-card__seller-row">
          {resolvedSeller ? (
            onViewSeller ? (
              <button
                type="button"
                className="product-card__seller-link"
                aria-label={`View seller profile for ${resolvedSeller.storeName}`}
                onClick={() => onViewSeller(resolvedSeller.id)}
              >
                <span className="product-card__seller-store">
                  {resolvedSeller.storeName}
                </span>
                <SellerBadge
                  isVerified={resolvedSeller.isVerified}
                  variant="compact"
                />
              </button>
            ) : (
              <span className="product-card__seller-static">
                <span>{resolvedSeller.storeName}</span>
                <SellerBadge
                  isVerified={resolvedSeller.isVerified}
                  variant="compact"
                />
              </span>
            )
          ) : (
            <span className="product-card__seller-missing">
              Seller information unavailable
            </span>
          )}
        </div>

        <p className="product-card__description">{product.description}</p>

        <p className="product-card__price tabular-nums">{formattedPrice}</p>

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

        <div className="product-card__footer">
          <p className="product-options__summary" aria-live="polite">
            Selected: {selectedColor || "—"} / {selectedSize || "—"}
          </p>

          <p className="product-options__availability" role="status">
            {availability === null
              ? "Select a color and size"
              : availability === "in-stock"
                ? `In stock · ${selectedVariant?.stock ?? 0} left`
                : availability === "out-of-stock"
                  ? "Out of stock"
                  : "Combination unavailable"}
          </p>

          <div className="product-card__actions">
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

            {onViewDetails && (
              <button
                type="button"
                className="product-card__details-button"
                onClick={() => onViewDetails(product)}
              >
                View details
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
