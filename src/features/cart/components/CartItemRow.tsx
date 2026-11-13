import { formatCurrency } from "../../../lib/formatCurrency";
import type { Product } from "../../products/types";
import type { CartItem } from "../types";

type CartItemRowProps = {
  item: CartItem;
  product: Product | undefined;
  sellerStoreName?: string;
  onQuantityChange: (
    productId: string,
    variantSku: string,
    change: 1 | -1
  ) => void;
  onRemove: (productId: string, variantSku: string) => void;
};

export function CartItemRow({
  item,
  product,
  sellerStoreName,
  onQuantityChange,
  onRemove,
}: CartItemRowProps) {
  const variant = product?.variants.find(
    (candidate) => candidate.sku === item.variantSku
  );

  const lineTotalCents = product ? product.priceCents * item.quantity : 0;
  const formattedLineTotal = product
    ? formatCurrency(lineTotalCents, product.currency)
    : null;

  return (
    <div className="cart-item">
      <div className="cart-item__info">
        <h3>{product?.name ?? "Unknown product"}</h3>

        <p>
          {variant ? `${variant.color} / ${variant.size}` : item.variantSku}
          {sellerStoreName ? ` · Sold by ${sellerStoreName}` : ""}
        </p>

        <p className="tabular-nums">
          Stock: {variant?.stock ?? "Unavailable"}
          {formattedLineTotal ? ` · ${formattedLineTotal}` : ""}
        </p>
      </div>

      <div className="cart-item__controls">
        <button
          type="button"
          aria-label={`Decrease quantity of ${item.variantSku}`}
          onClick={() => onQuantityChange(item.productId, item.variantSku, -1)}
          disabled={item.quantity <= 1 || !variant}
        >
          −
        </button>

        <span className="tabular-nums">{item.quantity}</span>

        <button
          type="button"
          aria-label={`Increase quantity of ${item.variantSku}`}
          onClick={() => onQuantityChange(item.productId, item.variantSku, 1)}
          disabled={!variant || item.quantity >= variant.stock}
        >
          +
        </button>

        <button
          type="button"
          className="cart-item__remove"
          aria-label={`Remove ${item.variantSku} from cart`}
          onClick={() => onRemove(item.productId, item.variantSku)}
        >
          Remove
        </button>
      </div>
    </div>
  );
}
