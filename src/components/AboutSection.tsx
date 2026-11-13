import "./AboutSection.css";

export function AboutSection() {
  return (
    <section
      id="about"
      className="about-section"
      aria-labelledby="about-heading"
    >
      <div className="about-section__inner">
        <div className="about-section__lead">
          <p className="about-section__eyebrow">About ShopAI SellerHub</p>
          <h2 id="about-heading">
            Clear catalogs for independent online sellers
          </h2>
          <p>
            ShopAI helps independent online sellers create clear, trustworthy
            catalogs and manage their products simply — pairing transparent store
            profiles with accurate variant inventory for confident discovery.
          </p>
        </div>

        <div className="about-section__pillars">
          <div className="about-pillar">
            <h3>Trustworthy Store Profiles</h3>
            <p>
              Every product connects to its seller’s location, verification
              status, response expectations, and fulfillment terms before you
              buy.
            </p>
          </div>

          <div className="about-pillar">
            <h3>Transparent Variant Stock</h3>
            <p>
              Each color and size maps directly to a SKU and live inventory
              count so shoppers never add unavailable combinations.
            </p>
          </div>

          <div className="about-pillar">
            <h3>Exact Pricing &amp; Resilient Carts</h3>
            <p>
              Totals are calculated in exact integer cents, and saved carts
              reconcile automatically against catalog availability on return.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
