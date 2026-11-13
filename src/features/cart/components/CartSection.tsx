import type { Product } from "../../products/types";
import type { CartItem } from "../types";
import { CartItemRow } from "./CartItemRow";
import { OrderSummary } from "./OrderSummary";
import "./CartSection.css";

type CartSectionProps = {
  cartItems: CartItem[];
  products: Product[];
  cartCount: number;
  subtotalCents: number;
  hydrationNotice: string | null;
  onDismissHydrationNotice: () => void;
  storageError: string | null;
  onDismissStorageError: () => void;
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
  cartCount,
  subtotalCents,
  hydrationNotice,
  onDismissHydrationNotice,
  storageError,
  onDismissStorageError,
  onQuantityChange,
  onRemoveFromCart,
}: CartSectionProps) {
  return (
    <section id="cart" className="cart-section">
      <h2>
        Your Cart (<span className="tabular-nums">{cartCount}</span>)
      </h2>

      {hydrationNotice && (
        <div className="cart-notice" role="status">
          <p>{hydrationNotice}</p>
          <button
            type="button"
            className="cart-notice__dismiss"
            aria-label="Dismiss cart notice"
            onClick={onDismissHydrationNotice}
          >
            Dismiss
          </button>
        </div>
      )}

      {storageError && (
        <div className="cart-error" role="alert">
          <p>{storageError}</p>
          <button
            type="button"
            className="cart-notice__dismiss"
            aria-label="Dismiss storage warning"
            onClick={onDismissStorageError}
          >
            Dismiss
          </button>
        </div>
      )}

      {cartItems.length === 0 ? (
        <p className="cart-section__empty">Your cart is empty.</p>
      ) : (
        <>
          <div className="cart-items">
            {cartItems.map((item) => {
              const product = products.find(
                (candidate) => candidate.id === item.productId
              );

              return (
                <CartItemRow
                  key={`${item.productId}-${item.variantSku}`}
                  item={item}
                  product={product}
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
