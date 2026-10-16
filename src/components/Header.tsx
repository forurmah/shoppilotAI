import "./Header.css";
function Header() {
  return (
    <header className="header">
      <a href="#home" className="logo">
        ShopPilot AI
      </a>

      <nav className="nav">
        <a href="#home">Home</a>
        <a href="#products">Products</a>
        <a href="#about">About</a>
      </nav>
    </header>
  );
}

export default Header;