import type { FormEvent } from "react";
import "./HeroSection.css";

type HeroSectionProps = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sellerCount: number;
  productCount: number;
};

export function HeroSection({
  searchQuery,
  onSearchChange,
  sellerCount,
  productCount,
}: HeroSectionProps) {
  const handleHeroSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const productsSection = document.getElementById("products");
    productsSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero__inner">
        <p className="hero-label">
          <span>ShopAI SellerHub</span>
          <span aria-hidden="true"> · </span>
          <span className="tabular-nums">
            {sellerCount} independent {sellerCount === 1 ? "store" : "stores"} ·{" "}
            {productCount} verified {productCount === 1 ? "listing" : "listings"}
          </span>
        </p>

        <h1 id="hero-heading">Discover independent sellers</h1>

        <p className="hero-description">
          Discover products from independent, trustworthy sellers with real-time
          variant stock, transparent store details, and dependable pricing.
        </p>

        <form className="hero-search" onSubmit={handleHeroSearchSubmit}>
          <label htmlFor="hero-discover-search" className="hero-search__label">
            Find items or categories, or store names
          </label>
          <input
            id="hero-discover-search"
            type="search"
            className="hero-search__input"
            placeholder="Search products, categories, or stores"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <button type="submit" className="hero-button">
            Search Marketplace
          </button>
        </form>
      </div>
    </section>
  );
}
