import { useEffect, useState } from "react";
import Header from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { AboutSection } from "./components/AboutSection";
import { Footer } from "./components/layout/Footer";
import { StatusMessage } from "./components/ui/StatusMessage";
import { products } from "./features/products/data";
import { checkAvailability } from "./features/products/checkAvailability";
import {
  filterProductsByCategory,
  searchProducts,
  sortProducts,
  type SortOption,
} from "./features/products/catalogOperations";
import {
  filterProductsByPrice,
  type PriceRangeFilter,
} from "./features/products/priceFilter";
import type { Product } from "./features/products/types";
import { CatalogToolbar } from "./features/products/components/CatalogToolbar";
import { CatalogGrid } from "./features/products/components/CatalogGrid";
import { ProductDetailModal } from "./features/products/components/ProductDetailModal";
import { sellers } from "./features/sellers/data";
import { getSellerById } from "./features/sellers/sellerLookup";
import { SellerProfileModal } from "./features/sellers/components/SellerProfileModal";
import { SellerWorkspaceNoticeModal } from "./features/sellers/components/SellerWorkspaceNoticeModal";
import type { CartItem } from "./features/cart/types";
import { addToCart } from "./features/cart/addToCart";
import { updateCartQuantity } from "./features/cart/updateCartQuantity";
import { removeFromCart } from "./features/cart/removeFromCart";
import { calculateCartTotals } from "./features/cart/calculateCartTotals";
import { saveCart } from "./features/cart/cartStorage";
import {
  hydrateCartWithReport,
  verifyCartSaved,
} from "./features/cart/cartHydration";
import { CartSection } from "./features/cart/components/CartSection";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<PriceRangeFilter>("all");
  const [sortOption, setSortOption] = useState<SortOption>("default");

  const [selectedProductForDetails, setSelectedProductForDetails] =
    useState<Product | null>(null);
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);
  const [isWorkspaceNoticeOpen, setIsWorkspaceNoticeOpen] = useState(false);

  // Shopping cart state with lazy localStorage initialization + reconciliation notice
  const [initialHydration] = useState(() => hydrateCartWithReport(products));
  const [cartItems, setCartItems] = useState<CartItem[]>(initialHydration.items);
  const [hydrationNotice, setHydrationNotice] = useState<string | null>(
    initialHydration.notice
  );
  const [storageError, setStorageError] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState("");
  const [cartActionFeedback, setCartActionFeedback] = useState("");

  // Persist cart changes to localStorage
  useEffect(() => {
    saveCart(cartItems);
  }, [cartItems]);

  const checkStoragePersistence = (nextItems: CartItem[]) => {
    saveCart(nextItems);
    if (!verifyCartSaved(nextItems)) {
      setStorageError(
        "Unable to save your cart to browser storage. Changes apply to this session only."
      );
    } else if (storageError !== null) {
      setStorageError(null);
    }
  };

  // Derived cart totals via strict pure calculation helper
  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const cartTotals = calculateCartTotals(cartItems, products);
  const subtotalCents = cartTotals.subtotalCents;

  // Add a selected product variant to the cart
  const handleAddToCart = (productId: string, variantSku: string) => {
    const product = products.find((item) => item.id === productId);

    if (!product) {
      setCartMessage("Product not found.");
      return;
    }

    const variant = product.variants.find((item) => item.sku === variantSku);

    if (!variant) {
      setCartMessage("Selected variant is unavailable.");
      return;
    }

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

    const existingItem = cartItems.find(
      (item) =>
        item.productId === productId && item.variantSku === variantSku
    );

    const currentQuantity = existingItem?.quantity ?? 0;

    if (currentQuantity >= variant.stock) {
      setCartMessage(
        `Stock limit reached. Only ${variant.stock} available.`
      );
      return;
    }

    const nextItems = addToCart(cartItems, productId, variantSku);
    setCartItems(nextItems);
    checkStoragePersistence(nextItems);
    setCartMessage(`${product.name} added to cart.`);
    setCartActionFeedback(
      `Added ${product.name} (${variant.color} / ${variant.size}) to your cart.`
    );
  };

  const handleRemoveFromCart = (productId: string, variantSku: string) => {
    const product = products.find((item) => item.id === productId);
    const nextItems = removeFromCart(cartItems, productId, variantSku);
    setCartItems(nextItems);
    checkStoragePersistence(nextItems);
    setCartActionFeedback(
      `Removed ${product?.name ?? variantSku} from your cart.`
    );
  };

  // Handle increasing or decreasing cart quantity
  const handleQuantityChange = (
    productId: string,
    variantSku: string,
    change: 1 | -1
  ) => {
    const product = products.find((item) => item.id === productId);

    if (!product) {
      setCartMessage("Product not found.");
      return;
    }

    const variant = product.variants.find((item) => item.sku === variantSku);

    if (!variant) {
      setCartMessage("Selected variant is unavailable.");
      return;
    }

    const nextItems = updateCartQuantity(
      cartItems,
      productId,
      variantSku,
      change,
      variant.stock
    );
    setCartItems(nextItems);
    checkStoragePersistence(nextItems);

    const updatedItem = nextItems.find(
      (item) =>
        item.productId === productId && item.variantSku === variantSku
    );
    if (updatedItem) {
      setCartActionFeedback(
        `Updated ${product.name} (${variant.color} / ${variant.size}) quantity to ${updatedItem.quantity}.`
      );
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceRange("all");
    setSortOption("default");
  };

  const handleOpenSellerFromCatalog = (sellerId: string) => {
    setSelectedProductForDetails(null);
    setSelectedSellerId(sellerId);
  };

  const handleSelectProductFromSeller = (product: Product) => {
    setSelectedSellerId(null);
    setSelectedProductForDetails(product);
  };

  // Unique categories
  const categories = [
    ...new Set(products.map((product) => product.category)),
  ];

  // Derive filtered and sorted catalog products (searching product name, category, and store name)
  const searchedProducts = searchProducts(products, searchQuery, sellers);
  const categoryFilteredProducts = filterProductsByCategory(
    searchedProducts,
    selectedCategory
  );
  const priceFilteredProducts = filterProductsByPrice(
    categoryFilteredProducts,
    priceRange
  );
  const sortedProducts = sortProducts(priceFilteredProducts, sortOption);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    priceRange !== "all" ||
    sortOption !== "default";

  const selectedProductSeller = selectedProductForDetails
    ? (getSellerById(sellers, selectedProductForDetails.sellerId) ?? null)
    : undefined;

  return (
    <>
      <Header
        cartCount={cartCount}
        onOpenSellerWorkspace={() => setIsWorkspaceNoticeOpen(true)}
      />

      <main id="home">
        <HeroSection
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sellerCount={sellers.length}
          productCount={products.length}
        />

        <section id="products" className="catalog">
          <div className="catalog__header">
            <h2>Marketplace Catalog</h2>
            <p className="catalog__subcopy">
              Click any store name to view seller profile &amp; verification
              details.
            </p>
          </div>

          {cartMessage && (
            <StatusMessage
              variant="info"
              className="catalog__status"
              onDismiss={() => setCartMessage("")}
              dismissLabel="Dismiss catalog message"
            >
              {cartMessage}
            </StatusMessage>
          )}

          <CatalogToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            priceRange={priceRange}
            onPriceRangeChange={setPriceRange}
            sortOption={sortOption}
            onSortChange={setSortOption}
            filteredCount={priceFilteredProducts.length}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
          />

          <CatalogGrid
            products={sortedProducts}
            sellers={sellers}
            totalProductsCount={products.length}
            onAddToCart={handleAddToCart}
            onViewDetails={setSelectedProductForDetails}
            onViewSeller={handleOpenSellerFromCatalog}
            onClearFilters={handleClearFilters}
          />
        </section>

        <CartSection
          cartItems={cartItems}
          products={products}
          sellers={sellers}
          cartCount={cartCount}
          subtotalCents={subtotalCents}
          hydrationNotice={hydrationNotice}
          onDismissHydrationNotice={() => setHydrationNotice(null)}
          storageError={storageError}
          onDismissStorageError={() => setStorageError(null)}
          cartActionFeedback={cartActionFeedback}
          onQuantityChange={handleQuantityChange}
          onRemoveFromCart={handleRemoveFromCart}
        />

        <AboutSection />
      </main>

      <Footer
        sellerCount={sellers.length}
        productCount={products.length}
        onOpenSellerWorkspace={() => setIsWorkspaceNoticeOpen(true)}
      />

      <ProductDetailModal
        product={selectedProductForDetails}
        seller={selectedProductSeller}
        onClose={() => setSelectedProductForDetails(null)}
        onAddToCart={handleAddToCart}
        onViewSeller={handleOpenSellerFromCatalog}
      />

      <SellerProfileModal
        sellerId={selectedSellerId}
        sellers={sellers}
        products={products}
        onClose={() => setSelectedSellerId(null)}
        onSelectProduct={handleSelectProductFromSeller}
      />

      <SellerWorkspaceNoticeModal
        isOpen={isWorkspaceNoticeOpen}
        onClose={() => setIsWorkspaceNoticeOpen(false)}
      />
    </>
  );
}

export default App;
