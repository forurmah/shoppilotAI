import type { ReactNode } from "react";
import "./StatusMessage.css";

type StatusMessageProps = {
  variant?: "info" | "success" | "error";
  role?: "status" | "alert";
  children: ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
  className?: string;
};

export function StatusMessage({
  variant = "info",
  role,
  children,
  onDismiss,
  dismissLabel = "Dismiss message",
  className,
}: StatusMessageProps) {
  const resolvedRole = role ?? (variant === "error" ? "alert" : "status");
  const classes = [
    "status-message",
    `status-message--${variant}`,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} role={resolvedRole}>
      <p className="status-message__text">{children}</p>

      {onDismiss && (
        <button
          type="button"
          className="status-message__dismiss"
          aria-label={dismissLabel}
          onClick={onDismiss}
        >
          Dismiss
        </button>
      )}
    </div>
  );
}
