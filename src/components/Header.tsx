import "./Header.css";

type HeaderProps = {
  cartCount?: number;
};

function Header({ cartCount = 0 }: HeaderProps) {
  return (
    <header className="header">
      <a href="#home" className="logo">
        ShopPilot AI
      </a>

      <nav className="nav" aria-label="Primary navigation">
        <a href="#home">Home</a>
        <a href="#products">Products</a>
        <a href="#about">About</a>
      </nav>

      <a
        href="#cart"
        className="header__cart-link"
        aria-label={`Shopping cart with ${cartCount} ${
          cartCount === 1 ? "item" : "items"
        }`}
      >
        Cart (<span className="tabular-nums">{cartCount}</span>)
      </a>
    </header>
  );
}

export default Header;