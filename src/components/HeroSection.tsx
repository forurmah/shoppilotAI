import "./HeroSection.css";

export function HeroSection() {
  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero__inner">
        <p className="hero-label">ShopPilot AI</p>

        <h1 id="hero-heading">Find your next favorite outfit.</h1>

        <p className="hero-description">
          Explore curated clothing with verified variant stock, clear pricing,
          and reliable cart persistence.
        </p>

        <a href="#products" className="hero-button">
          Explore Products
        </a>
      </div>
    </section>
  );
}
