import type { SortOption } from "../catalogOperations";
import {
  PRICE_RANGE_OPTIONS,
  type PriceRangeFilter,
} from "../priceFilter";
import "./CatalogToolbar.css";

type CatalogToolbarProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  priceRange: PriceRangeFilter;
  onPriceRangeChange: (priceRange: PriceRangeFilter) => void;
  sortOption: SortOption;
  onSortChange: (sortOption: SortOption) => void;
  filteredCount: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

export function CatalogToolbar({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  sortOption,
  onSortChange,
  filteredCount,
  hasActiveFilters,
  onClearFilters,
}: CatalogToolbarProps) {
  return (
    <div className="catalog-toolbar">
      <div className="catalog-toolbar__top">
        {/* Search */}
        <div className="catalog__search">
          <label htmlFor="product-search">Search products:</label>

          <input
            id="product-search"
            type="search"
            placeholder="Search by name or category..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>

        <div className="catalog-toolbar__selects">
          {/* Price range filter */}
          <div className="catalog__price">
            <label htmlFor="product-price">Price</label>

            <select
              id="product-price"
              value={priceRange}
              onChange={(event) =>
                onPriceRangeChange(event.target.value as PriceRangeFilter)
              }
            >
              {PRICE_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Product sorting */}
          <div className="catalog__sort">
            <label htmlFor="product-sort">Sort by</label>

            <select
              id="product-sort"
              value={sortOption}
              onChange={(event) =>
                onSortChange(event.target.value as SortOption)
              }
            >
              <option value="default">Default order</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name-az">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category filtering */}
      <fieldset className="catalog__categories">
        <legend>Filter by category</legend>

        <div className="catalog__category-options">
          <label
            className={
              selectedCategory === "all"
                ? "catalog__category-option catalog__category-option--active"
                : "catalog__category-option"
            }
          >
            <input
              type="radio"
              name="category"
              value="all"
              checked={selectedCategory === "all"}
              aria-current={selectedCategory === "all" ? "true" : undefined}
              onChange={() => onCategoryChange("all")}
            />
            <span>All</span>
          </label>

          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <label
                key={category}
                className={
                  isSelected
                    ? "catalog__category-option catalog__category-option--active"
                    : "catalog__category-option"
                }
              >
                <input
                  type="radio"
                  name="category"
                  value={category}
                  checked={isSelected}
                  aria-current={isSelected ? "true" : undefined}
                  onChange={() => onCategoryChange(category)}
                />
                <span>{category}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="catalog-toolbar__meta">
        <p className="catalog-toolbar__count tabular-nums">
          {filteredCount} {filteredCount === 1 ? "product" : "products"} found
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            className="catalog-toolbar__clear"
            onClick={onClearFilters}
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
