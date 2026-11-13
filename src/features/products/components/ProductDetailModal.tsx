import { useEffect, useRef, useState } from "react";
import type { Product } from "../types";
import { checkAvailability } from "../checkAvailability";
import "./ProductDetailModal.css";

type ProductDetailModalProps = {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (productId: string, variantSku: string) => void;
};

export function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  if (!product) {
    return null;
  }

  return (
    <ProductDetailModalContent
      key={product.id}
      product={product}
      onClose={onClose}
      onAddToCart={onAddToCart}
    />
  );
}

function ProductDetailModalContent({
  product,
  onClose,
  onAddToCart,
}: {
  product: Product;
  onClose: () => void;
  onAddToCart: (productId: string, variantSku: string) => void;
}) {
  const firstVariant = product.variants[0];
  const [selectedColor, setSelectedColor] = useState(
    firstVariant?.color ?? ""
  );
  const [selectedSize, setSelectedSize] = useState(
    firstVariant?.size ?? ""
  );
  const [manualImageUrl, setManualImageUrl] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusable.length === 0) {
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

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

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: product.currency,
  }).format(product.priceCents / 100);

  const isAddToCartDisabled =
    !selectedVariant || availability !== "in-stock";

  return (
    <div
      className="product-modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className="product-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
      >
        <div className="product-modal__header">
          <p className="product-modal__eyebrow">
            <span>{product.category}</span>
            <span aria-hidden="true"> · </span>
            <span>Atelier North</span>
          </p>

          <button
            ref={closeButtonRef}
            type="button"
            className="product-modal__close"
            aria-label="Close product details"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="product-modal__body">
          {/* Gallery */}
          <div className="product-modal__gallery">
            {activeImageUrl ? (
              <img
                className="product-modal__main-image"
                src={activeImageUrl}
                alt={`${product.name} preview`}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="product-modal__placeholder">
                Image unavailable
              </div>
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

          {/* Purchase module & seller metadata */}
          <div className="product-modal__details">
            <h2 id="product-detail-title" className="product-modal__title">
              {product.name}
            </h2>

            <p className="product-modal__price tabular-nums">
              {formattedPrice}
            </p>

            <p className="product-modal__description">{product.description}</p>

            <div className="product-modal__seller">
              <p className="product-modal__seller-name">
                Sold by Atelier North · Demo Verified Merchant
              </p>
              <p className="product-modal__seller-meta">
                Portland, OR · Typical response under 2h · Ships in 1–2 business
                days
              </p>
            </div>

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

            {/* Full variant inventory matrix */}
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
      </div>
    </div>
  );
}
