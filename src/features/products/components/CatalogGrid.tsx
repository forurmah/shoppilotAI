import type { Product } from "../types";
import { ProductCard } from "./ProductCard";
import "./CatalogGrid.css";

type CatalogGridProps = {
  products: Product[];
  totalProductsCount: number;
  onAddToCart: (productId: string, variantSku: string) => void;
  onViewDetails: (product: Product) => void;
  onClearFilters: () => void;
};

export function CatalogGrid({
  products,
  totalProductsCount,
  onAddToCart,
  onViewDetails,
  onClearFilters,
}: CatalogGridProps) {
  if (totalProductsCount === 0) {
    return (
      <div className="catalog__empty" role="status">
        <p>No products available yet.</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="catalog__empty" role="status">
        <p className="catalog__empty-title">No products match your search.</p>
        <p className="catalog__empty-copy">
          Try a different search or category, or reset your active filters.
        </p>
        <button
          type="button"
          className="catalog__empty-reset"
          onClick={onClearFilters}
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
}
