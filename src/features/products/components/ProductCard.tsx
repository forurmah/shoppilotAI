import type { Product } from "../types";
import "./ProductCard.css";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
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

        <p className="product-card__price">
          {formattedPrice}
        </p>
      </div>
    </article>
  );
}