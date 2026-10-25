
import { useState } from "react";
import Header from "./components/Header";
import { ProductCard } from "./features/products/components/ProductCard";
import { products } from "./features/products/data";
import type { CartItem } from "./features/cart/types";
import { addToCart } from "./features/cart/addToCart";
import { checkAvailability } from "./features/products/checkAvailability";

type SortOption =
  | "default"
  | "price-low"
  | "price-high"
  | "name-az";

function App() {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("all");
  const [sortOption, setSortOption] =
    useState<SortOption>("default");

  // Shopping cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartMessage, setCartMessage] = useState("");

  // Derived cart count: total units, not cart lines
  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  // Add a selected product variant to the cart
  const handleAddToCart = (
    productId: string,
    variantSku: string
  ) => {
    const product = products.find(
      (item) => item.id === productId
    );

    if (!product) {
      setCartMessage("Product not found.");
      return;
    }

    const variant = product.variants.find(
      (item) => item.sku === variantSku
    );

    if (!variant) {
      setCartMessage("Selected variant is unavailable.");
      return;
    }

    // Reuse the existing availability logic
    const availability = checkAvailability(
      product,
      variant.color,
      variant.size
    );

    if (availability !== "in-stock") {
      setCartMessage(
        availability === "out-of-stock"
          ? "Sorry, this variant is out of stock."
          : "This variant is unavailable."
      );
      return;
    }

    // Find the existing cart line for this exact variant
    const existingItem = cartItems.find(
      (item) =>
        item.productId === productId &&
        item.variantSku === variantSku
    );

    const currentQuantity = existingItem?.quantity ?? 0;

    // Prevent adding more units than the available stock
    if (currentQuantity >= variant.stock) {
      setCartMessage(
        `Stock limit reached. Only ${variant.stock} available.`
      );
      return;
    }

    // Update using the latest cart state
    setCartItems((currentItems) =>
      addToCart(currentItems, productId, variantSku)
    );

    setCartMessage(`${product.name} added to cart.`);
  };

  // Get unique categories
  const categories = [
    ...new Set(products.map((product) => product.category)),
  ];

  // Normalize search query
  const normalizedQuery = searchQuery.trim().toLowerCase();

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesName = product.name
      .toLowerCase()
      .includes(normalizedQuery);

    const matchesCategory = product.category
      .toLowerCase()
      .includes(normalizedQuery);

    const matchesSelectedCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory;

    return (
      (matchesName || matchesCategory) &&
      matchesSelectedCategory
    );
  });

  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case "price-low":
        return a.price - b.price;

      case "price-high":
        return b.price - a.price;

      case "name-az":
        return a.name.localeCompare(b.name);

      default:
        return 0;
    }
  });

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

        <section id="products" className="catalog">
          <h2>Our Products</h2>

          {/* Shopping cart summary */}
          <p className="catalog__cart-count">
            Cart ({cartCount})
          </p>

          {cartMessage && (
            <p role="status">{cartMessage}</p>
          )}

          {/* Search */}
          <div className="catalog__search">
            <label htmlFor="product-search">
              Search products:
            </label>

            <input
              id="product-search"
              type="search"
              placeholder="Search by name or category..."
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
            />
          </div>

          {/* Category filtering */}
          <fieldset className="catalog__categories">
            <legend>Filter by category</legend>

            <div className="catalog__category-options">
              <label>
                <input
                  type="radio"
                  name="category"
                  value="all"
                  checked={selectedCategory === "all"}
                  onChange={() => setSelectedCategory("all")}
                />
                All
              </label>

              {categories.map((category) => (
                <label key={category}>
                  <input
                    type="radio"
                    name="category"
                    value={category}
                    checked={selectedCategory === category}
                    onChange={() =>
                      setSelectedCategory(category)
                    }
                  />
                  {category}
                </label>
              ))}
            </div>
          </fieldset>

          {/* Product sorting */}
          <div className="catalog__sort">
            <label htmlFor="product-sort">
              Sort by
            </label>

            <select
              id="product-sort"
              value={sortOption}
              onChange={(event) => {
                setSortOption(
                  event.target.value as SortOption
                );
              }}
            >
              <option value="default">Default order</option>
              <option value="price-low">
                Price: Low to High
              </option>
              <option value="price-high">
                Price: High to Low
              </option>
              <option value="name-az">
                Name: A to Z
              </option>
            </select>
          </div>

          {/* Product count */}
          <p>
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "product"
              : "products"}{" "}
            found
          </p>

          {/* Product grid */}
          {products.length === 0 ? (
            <p>No products available yet.</p>
          ) : filteredProducts.length === 0 ? (
            <p className="catalog__empty">
              No products match your search.
              Try a different search or category.
            </p>
          ) : (
            <div className="product-grid">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
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
