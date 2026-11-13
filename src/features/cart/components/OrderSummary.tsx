import { formatCurrency } from "../../../lib/formatCurrency";

type OrderSummaryProps = {
  subtotalCents: number;
};

export function OrderSummary({ subtotalCents }: OrderSummaryProps) {
  const formattedSubtotal = formatCurrency(subtotalCents, "USD");

  return (
    <div className="cart-summary">
      <h3>Order Summary</h3>

      <p className="cart-summary__row">
        <span>Subtotal</span>

        <strong className="tabular-nums">{formattedSubtotal}</strong>
      </p>

      <p className="cart-summary__note">
        Shipping and taxes calculated at checkout.
      </p>
    </div>
  );
}
