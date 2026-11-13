import { EmptyState } from "../../../components/ui/EmptyState";
import type { Seller } from "../../sellers/types";
import { getSellerById } from "../../sellers/sellerLookup";
import type { Product } from "../types";
import { ProductCard } from "./ProductCard";
import "./CatalogGrid.css";

type CatalogGridProps = {
  products: Product[];
  sellers: readonly Seller[];
  totalProductsCount: number;
  onAddToCart: (productId: string, variantSku: string) => void;
  onViewDetails: (product: Product) => void;
  onViewSeller: (sellerId: string) => void;
  onClearFilters: () => void;
};

export function CatalogGrid({
  products,
  sellers,
  totalProductsCount,
  onAddToCart,
  onViewDetails,
  onViewSeller,
  onClearFilters,
}: CatalogGridProps) {
  if (totalProductsCount === 0) {
    return (
      <EmptyState
        title="No products available yet."
        description="Check back soon as independent sellers publish new listings."
      />
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title="No products match your search."
        description="Try a different product, category, or store name, or reset your active filters."
        action={
          <button
            type="button"
            className="catalog__empty-reset"
            onClick={onClearFilters}
          >
            Clear filters
          </button>
        }
      />
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          seller={getSellerById(sellers, product.sellerId) ?? null}
          onAddToCart={onAddToCart}
          onViewDetails={onViewDetails}
          onViewSeller={onViewSeller}
        />
      ))}
    </div>
  );
}
