import { useEffect, useRef, type ReactNode } from "react";
import "./Modal.css";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  titleId: string;
  eyebrow: ReactNode;
  closeLabel: string;
  maxWidth?: "sm" | "md" | "lg";
  zIndex?: "base" | "elevated";
  children: ReactNode;
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  isOpen,
  onClose,
  titleId,
  eyebrow,
  closeLabel,
  maxWidth = "md",
  zIndex = "base",
  children,
}: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <ModalDialog
      onClose={onClose}
      titleId={titleId}
      eyebrow={eyebrow}
      closeLabel={closeLabel}
      maxWidth={maxWidth}
      zIndex={zIndex}
    >
      {children}
    </ModalDialog>
  );
}

function ModalDialog({
  onClose,
  titleId,
  eyebrow,
  closeLabel,
  maxWidth,
  zIndex,
  children,
}: Omit<ModalProps, "isOpen">) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        );

        if (focusable.length === 0) {
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [onClose]);

  return (
    <div
      className={`ui-modal-backdrop ui-modal-backdrop--${zIndex}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        className={`ui-modal ui-modal--${maxWidth}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="ui-modal__header">
          <p className="ui-modal__eyebrow">{eyebrow}</p>

          <button
            ref={closeButtonRef}
            type="button"
            className="ui-modal__close"
            aria-label={closeLabel}
            onClick={onClose}
          >
            Close
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
