import "./SellerBadge.css";

type SellerBadgeProps = {
  isVerified: boolean;
  variant?: "compact" | "full";
};

export function SellerBadge({
  isVerified,
  variant = "compact",
}: SellerBadgeProps) {
  if (!isVerified) {
    if (variant === "compact") {
      return null;
    }

    return <span className="seller-badge seller-badge--standard">Independent seller</span>;
  }

  return (
    <span
      className={
        variant === "full"
          ? "seller-badge seller-badge--verified seller-badge--full"
          : "seller-badge seller-badge--verified"
      }
    >
      <svg
        width={variant === "full" ? 14 : 13}
        height={variant === "full" ? 14 : 13}
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="8" cy="8" r="7" fill="currentColor" />
        <path
          d="M5 8.2L7 10.2L11.2 6"
          stroke="#fffdf9"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {variant === "full" ? "Verified seller" : "Verified"}
    </span>
  );
}
