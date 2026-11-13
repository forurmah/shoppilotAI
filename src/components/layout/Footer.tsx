import "./Footer.css";

type FooterProps = {
  sellerCount: number;
  productCount: number;
  onOpenSellerWorkspace: () => void;
};

export function Footer({
  sellerCount,
  productCount,
  onOpenSellerWorkspace,
}: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <a href="#home" className="site-footer__logo">
            ShopAI SellerHub
          </a>
          <p className="site-footer__summary">
            Curated public marketplace connecting independent sellers with
            transparent variant inventory and store profiles.{" "}
            <span className="tabular-nums">
              {sellerCount} {sellerCount === 1 ? "store" : "stores"} ·{" "}
              {productCount} {productCount === 1 ? "listing" : "listings"}
            </span>
            .
          </p>
        </div>

        <nav className="site-footer__nav" aria-label="Footer navigation">
          <a href="#home">Discover</a>
          <a href="#products">Products</a>
          <a href="#cart">Cart</a>
          <a href="#about">About</a>
          <button
            type="button"
            className="site-footer__workspace-btn"
            onClick={onOpenSellerWorkspace}
          >
            Seller Workspace
          </button>
        </nav>
      </div>
    </footer>
  );
}
