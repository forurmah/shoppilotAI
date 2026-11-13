import { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { formatCurrency } from "../../../lib/formatCurrency";
import type { Seller } from "../../sellers/types";
import { sellers as defaultSellers } from "../../sellers/data";
import { getSellerById } from "../../sellers/sellerLookup";
import { SellerSummary } from "../../sellers/components/SellerSummary";
import type { Product } from "../types";
import { checkAvailability } from "../checkAvailability";
import "./ProductDetailModal.css";

type ProductDetailModalProps = {
  product: Product | null;
  seller?: Seller | null;
  onClose: () => void;
  onAddToCart: (productId: string, variantSku: string) => void;
  onViewSeller?: (sellerId: string) => void;
};

export function ProductDetailModal({
  product,
  seller,
  onClose,
  onAddToCart,
  onViewSeller,
}: ProductDetailModalProps) {
  const resolvedSeller = product
    ? seller === undefined
      ? getSellerById(defaultSellers, product.sellerId)
      : seller
    : undefined;

  return (
    <Modal
      isOpen={Boolean(product)}
      onClose={onClose}
      titleId="product-detail-title"
      closeLabel="Close product details"
      maxWidth="lg"
      zIndex="base"
      eyebrow={
        product ? (
          <>
            <span>{product.category}</span>
            {resolvedSeller && (
              <>
                <span aria-hidden="true"> · </span>
                <span>{resolvedSeller.storeName}</span>
              </>
            )}
          </>
        ) : null
      }
    >
      {product && (
        <ProductDetailModalContent
          key={product.id}
          product={product}
          seller={resolvedSeller}
          onAddToCart={onAddToCart}
          onViewSeller={onViewSeller}
        />
      )}
    </Modal>
  );
}

function ProductDetailModalContent({
  product,
  seller,
  onAddToCart,
  onViewSeller,
}: {
  product: Product;
  seller?: Seller | null;
  onAddToCart: (productId: string, variantSku: string) => void;
  onViewSeller?: (sellerId: string) => void;
}) {
  const firstVariant = product.variants[0];
  const [selectedColor, setSelectedColor] = useState(
    firstVariant?.color ?? ""
  );
  const [selectedSize, setSelectedSize] = useState(
    firstVariant?.size ?? ""
  );
  const [manualImageUrl, setManualImageUrl] = useState<string | null>(null);

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

  const galleryImages = [
    ...new Set([
      ...product.images,
      ...product.variants
        .map((variant) => variant.imageUrl)
        .filter((url): url is string => Boolean(url)),
    ]),
  ];

  const colorPreviewImage = product.variants.find(
    (variant) => variant.color === selectedColor && variant.imageUrl
  )?.imageUrl;

  const activeImageUrl =
    manualImageUrl ??
    selectedVariant?.imageUrl ??
    colorPreviewImage ??
    galleryImages[0];

  const formattedPrice = formatCurrency(product.priceCents, product.currency);

  const isAddToCartDisabled =
    !selectedVariant || availability !== "in-stock";

  return (
    <div className="product-modal__body">
      <div className="product-modal__gallery">
        {activeImageUrl ? (
          <img
            className="product-modal__main-image"
            src={activeImageUrl}
            alt={`${product.name} preview`}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="product-modal__placeholder">Image unavailable</div>
        )}

        {galleryImages.length > 1 && (
          <div
            className="product-modal__thumbnails"
            role="group"
            aria-label="Product gallery"
          >
            {galleryImages.map((url, index) => (
              <button
                key={url}
                type="button"
                aria-label={`View image ${index + 1} for ${product.name}`}
                aria-pressed={activeImageUrl === url}
                className={
                  activeImageUrl === url
                    ? "product-modal__thumb product-modal__thumb--active"
                    : "product-modal__thumb"
                }
                onClick={() => setManualImageUrl(url)}
              >
                <img src={url} alt="" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="product-modal__details">
        <h2 id="product-detail-title" className="product-modal__title">
          {product.name}
        </h2>

        <p className="product-modal__price tabular-nums">{formattedPrice}</p>

        <p className="product-modal__description">{product.description}</p>

        <SellerSummary seller={seller} onViewSeller={onViewSeller} />

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
                onClick={() => {
                  setSelectedColor(color);
                  setManualImageUrl(null);
                }}
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
                onClick={() => {
                  setSelectedSize(size);
                  setManualImageUrl(null);
                }}
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="product-modal__status-row" role="status">
          <span className="product-modal__stock tabular-nums">
            {availability === "in-stock"
              ? `In stock · ${selectedVariant?.stock ?? 0} left`
              : availability === "out-of-stock"
                ? "Out of stock"
                : "Combination unavailable"}
          </span>
          <span className="product-modal__sku tabular-nums">
            {selectedVariant ? `SKU: ${selectedVariant.sku}` : ""}
          </span>
        </div>

        <button
          type="button"
          className="product-card__add-to-cart"
          disabled={isAddToCartDisabled}
          onClick={() => {
            if (selectedVariant) {
              onAddToCart(product.id, selectedVariant.sku);
            }
          }}
        >
          {availability === "out-of-stock"
            ? "Out of Stock"
            : availability === "unavailable"
              ? "Unavailable"
              : "Add to Cart"}
        </button>

        <div className="product-modal__variants">
          <h3>Variant Availability</h3>
          <table className="product-modal__variant-table">
            <thead>
              <tr>
                <th scope="col">SKU</th>
                <th scope="col">Color</th>
                <th scope="col">Size</th>
                <th scope="col">Stock</th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map((variant) => (
                <tr
                  key={variant.sku}
                  className={
                    selectedVariant?.sku === variant.sku
                      ? "product-modal__variant-row--active"
                      : undefined
                  }
                >
                  <td className="tabular-nums">{variant.sku}</td>
                  <td>{variant.color}</td>
                  <td>{variant.size}</td>
                  <td className="tabular-nums">
                    {variant.stock > 0
                      ? `${variant.stock} left`
                      : "Out of stock"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
