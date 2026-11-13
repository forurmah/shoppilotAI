import "./AboutSection.css";

export function AboutSection() {
  return (
    <section id="about" className="about-section" aria-labelledby="about-heading">
      <div className="about-section__inner">
        <div className="about-section__lead">
          <h2 id="about-heading">About Our Shop</h2>
          <p>
            ShopPilot AI is evolving into a transparent marketplace foundation
            where independent clothing sellers pair structured variant catalogs
            with clear, trustworthy stock information.
          </p>
        </div>

        <div className="about-section__pillars">
          <div className="about-pillar">
            <h3>Transparent Variant Stock</h3>
            <p>
              Every color and size maps to a specific SKU and live inventory
              count so shoppers never add unavailable combinations.
            </p>
          </div>

          <div className="about-pillar">
            <h3>Exact Integer-Cent Pricing</h3>
            <p>
              Product prices and order subtotals are computed strictly in minor
              currency units to prevent rounding discrepancies.
            </p>
          </div>

          <div className="about-pillar">
            <h3>Resilient Cart Persistence</h3>
            <p>
              Saved carts reconcile automatically against active catalog SKUs and
              stock ceilings whenever you return.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
