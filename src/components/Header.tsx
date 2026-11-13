import "./Header.css";

type HeaderProps = {
  cartCount?: number;
  onOpenSellerWorkspace?: () => void;
};

function Header({ cartCount = 0, onOpenSellerWorkspace }: HeaderProps) {
  return (
    <header className="header">
      <a href="#home" className="logo">
        ShopAI SellerHub
      </a>

      <nav className="nav" aria-label="Primary navigation">
        <a href="#home">Discover</a>
        <a href="#products">Products</a>
        <a href="#about">About</a>
      </nav>

      <div className="header__actions">
        <button
          type="button"
          className="header__workspace-btn"
          onClick={onOpenSellerWorkspace}
        >
          Seller Workspace
        </button>

        <a
          href="#cart"
          className="header__cart-link"
          aria-label={`Shopping cart with ${cartCount} ${
            cartCount === 1 ? "item" : "items"
          }`}
        >
          Cart (<span className="tabular-nums">{cartCount}</span>)
        </a>
      </div>
    </header>
  );
}

export default Header;