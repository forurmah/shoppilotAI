import { EmptyState } from "../../../components/ui/EmptyState";
import { StatusMessage } from "../../../components/ui/StatusMessage";
import type { Seller } from "../../sellers/types";
import { getSellerById } from "../../sellers/sellerLookup";
import type { Product } from "../../products/types";
import type { CartItem } from "../types";
import { CartItemRow } from "./CartItemRow";
import { OrderSummary } from "./OrderSummary";
import "./CartSection.css";

type CartSectionProps = {
  cartItems: CartItem[];
  products: Product[];
  sellers: readonly Seller[];
  cartCount: number;
  subtotalCents: number;
  hydrationNotice: string | null;
  onDismissHydrationNotice: () => void;
  storageError: string | null;
  onDismissStorageError: () => void;
  cartActionFeedback?: string;
  onQuantityChange: (
    productId: string,
    variantSku: string,
    change: 1 | -1
  ) => void;
  onRemoveFromCart: (productId: string, variantSku: string) => void;
};

export function CartSection({
  cartItems,
  products,
  sellers,
  cartCount,
  subtotalCents,
  hydrationNotice,
  onDismissHydrationNotice,
  storageError,
  onDismissStorageError,
  cartActionFeedback,
  onQuantityChange,
  onRemoveFromCart,
}: CartSectionProps) {
  return (
    <section id="cart" className="cart-section">
      <div className="cart-section__header">
        <h2>
          Your Cart (<span className="tabular-nums">{cartCount}</span>)
        </h2>
        <p className="cart-section__sub">
          Saved automatically to this browser · Stock checked against active
          listings
        </p>
      </div>

      {hydrationNotice && (
        <StatusMessage
          variant="info"
          className="cart-section__status"
          onDismiss={onDismissHydrationNotice}
          dismissLabel="Dismiss cart notice"
        >
          {hydrationNotice}
        </StatusMessage>
      )}

      {storageError && (
        <StatusMessage
          variant="error"
          role="alert"
          className="cart-section__status"
          onDismiss={onDismissStorageError}
          dismissLabel="Dismiss storage warning"
        >
          {storageError}
        </StatusMessage>
      )}

      {cartActionFeedback && (
        <StatusMessage variant="success" className="cart-section__status">
          {cartActionFeedback}
        </StatusMessage>
      )}

      {cartItems.length === 0 ? (
        <EmptyState
          align="left"
          title="Your cart is empty."
          description="Select a product variant from the marketplace catalog to add it here."
          action={
            <a href="#products" className="cart-section__browse-link">
              Browse marketplace catalog
            </a>
          }
        />
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => {
              const product = products.find(
                (candidate) => candidate.id === item.productId
              );
              const seller = getSellerById(sellers, product?.sellerId);

              return (
                <CartItemRow
                  key={`${item.productId}-${item.variantSku}`}
                  item={item}
                  product={product}
                  sellerStoreName={seller?.storeName}
                  onQuantityChange={onQuantityChange}
                  onRemove={onRemoveFromCart}
                />
              );
            })}
          </div>

          <OrderSummary subtotalCents={subtotalCents} />
        </>
      )}
    </section>
  );
}
