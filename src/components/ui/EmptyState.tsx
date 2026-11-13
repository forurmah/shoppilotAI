import type { ReactNode } from "react";
import "./EmptyState.css";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  align?: "center" | "left";
  headingLevel?: "h2" | "h3" | "p";
  headingId?: string;
  role?: "status";
};

export function EmptyState({
  title,
  description,
  action,
  align = "center",
  headingLevel = "p",
  headingId,
  role = "status",
}: EmptyStateProps) {
  const HeadingTag = headingLevel;

  return (
    <div
      className={`empty-state empty-state--${align}`}
      role={role}
    >
      <div className="empty-state__copy">
        <HeadingTag id={headingId} className="empty-state__title">
          {title}
        </HeadingTag>

        {description && (
          <p className="empty-state__description">{description}</p>
        )}
      </div>

      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
}
