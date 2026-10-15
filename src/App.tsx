import Header from "./components/Header";
import { ProductCard } from "./features/products/components/ProductCard";
import { products } from "./features/products/data";

function App() {
  return (
    <>
      <Header />

      <main id="home">
        <section className="hero">
          <p className="hero-label">
            WELCOME TO SHOPPILOT AI
          </p>

          <h1>Find your next favorite outfit.</h1>

          <p className="hero-description">
            Discover stylish clothing, explore colors
            and sizes, and shop with confidence.
          </p>

          <a href="#products" className="hero-button">
            Explore Products
          </a>
        </section>


        <section id="products">
          <h2>Our Products</h2>

          {products.length === 0 ? (
            <p>No products available yet.</p>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                />
              ))}
            </div>
          )}
        </section>


        <section id="about">
          <h2>About Our Shop</h2>
        </section>
      </main>
    </>
  );
}

export default App;