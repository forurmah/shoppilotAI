import { EmptyState } from "../../../components/ui/EmptyState";
import { Modal } from "../../../components/ui/Modal";
import { formatCurrency } from "../../../lib/formatCurrency";
import type { Product } from "../../products/types";
import type { Seller } from "../types";
import { getSellerProfile } from "../sellerLookup";
import { SellerBadge } from "./SellerBadge";
import "./SellerProfileModal.css";

type SellerProfileModalProps = {
  sellerId: string | null;
  sellers: readonly Seller[];
  products: readonly Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
};

export function SellerProfileModal({
  sellerId,
  sellers,
  products,
  onClose,
  onSelectProduct,
}: SellerProfileModalProps) {
  const profile = sellerId
    ? getSellerProfile(sellers, products, sellerId)
    : null;

  return (
    <Modal
      isOpen={Boolean(sellerId)}
      onClose={onClose}
      titleId="seller-profile-title"
      eyebrow="Independent Seller Profile"
      closeLabel="Close seller profile"
      maxWidth="md"
      zIndex="elevated"
    >
      {!profile ? (
        <div className="seller-modal__missing">
          <EmptyState
            align="left"
            headingLevel="h2"
            headingId="seller-profile-title"
            title="Seller information unavailable"
            description="This store profile could not be found in the current marketplace catalog."
          />
        </div>
      ) : (
        <div className="seller-modal__body">
          <div className="seller-modal__identity">
            <div className="seller-modal__title-row">
              <h2 id="seller-profile-title" className="seller-modal__title">
                {profile.seller.storeName}
              </h2>
              <SellerBadge
                isVerified={profile.seller.isVerified}
                variant="full"
              />
            </div>

            <p className="seller-modal__owner">
              <span>Owner: {profile.seller.sellerName}</span>
              <span aria-hidden="true"> · </span>
              <span>{profile.seller.location}</span>
            </p>

            <p className="seller-modal__description">
              {profile.seller.description}
            </p>
          </div>

          <dl className="seller-modal__facts">
            <div className="seller-modal__fact">
              <dt>Verification status</dt>
              <dd>
                {profile.seller.isVerified
                  ? "Verified store identity"
                  : "Standard listing"}
              </dd>
            </div>
            <div className="seller-modal__fact">
              <dt>Response time</dt>
              <dd>{profile.seller.responseTime}</dd>
            </div>
            <div className="seller-modal__fact">
              <dt>Delivery information</dt>
              <dd>{profile.seller.deliveryInfo}</dd>
            </div>
            <div className="seller-modal__fact">
              <dt>Storefront catalog</dt>
              <dd className="tabular-nums">
                {profile.productCount}{" "}
                {profile.productCount === 1 ? "product" : "products"}
                {profile.categories.length > 0
                  ? ` · ${profile.categories.join(", ")}`
                  : ""}
              </dd>
            </div>
          </dl>

          <div className="seller-modal__catalog">
            <h3>Public Catalog Preview</h3>

            {profile.products.length === 0 ? (
              <EmptyState
                align="left"
                title="No active products listed"
                description="This seller has no active products listed right now."
              />
            ) : (
              <ul className="seller-modal__product-list">
                {profile.products.map((product) => {
                  const formattedPrice = formatCurrency(
                    product.priceCents,
                    product.currency
                  );

                  const totalStock = product.variants.reduce(
                    (sum, variant) => sum + variant.stock,
                    0
                  );

                  return (
                    <li key={product.id} className="seller-modal__product-item">
                      <div className="seller-modal__product-media">
                        {product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <span>No image</span>
                        )}
                      </div>

                      <div className="seller-modal__product-info">
                        <p className="seller-modal__product-cat">
                          {product.category}
                        </p>
                        <p className="seller-modal__product-name">
                          {product.name}
                        </p>
                        <p className="seller-modal__product-meta tabular-nums">
                          {formattedPrice} ·{" "}
                          {totalStock > 0
                            ? `${totalStock} units across ${product.variants.length} variants`
                            : "Currently out of stock"}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="seller-modal__product-btn"
                        onClick={() => onSelectProduct(product)}
                      >
                        View product
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
