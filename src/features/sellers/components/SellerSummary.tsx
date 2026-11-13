import type { Seller } from "../types";
import { SellerBadge } from "./SellerBadge";
import "./SellerSummary.css";

type SellerSummaryProps = {
  seller: Seller | null | undefined;
  onViewSeller?: (sellerId: string) => void;
};

export function SellerSummary({ seller, onViewSeller }: SellerSummaryProps) {
  if (!seller) {
    return (
      <div className="seller-summary">
        <p className="seller-summary__name">Seller information unavailable</p>
        <p className="seller-summary__meta">
          Store details could not be loaded for this listing.
        </p>
      </div>
    );
  }

  return (
    <div className="seller-summary">
      <div className="seller-summary__header">
        <div className="seller-summary__title-group">
          <p className="seller-summary__name">
            Sold by {seller.storeName}
          </p>
          <SellerBadge isVerified={seller.isVerified} variant="compact" />
        </div>

        {onViewSeller && (
          <button
            type="button"
            className="seller-summary__btn"
            onClick={() => onViewSeller(seller.id)}
          >
            View seller profile
          </button>
        )}
      </div>

      <p className="seller-summary__meta">
        {seller.sellerName} · {seller.location} · {seller.responseTime}
      </p>
      <p className="seller-summary__meta">{seller.deliveryInfo}</p>
    </div>
  );
}
