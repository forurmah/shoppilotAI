import { Modal } from "../../../components/ui/Modal";
import "./SellerWorkspaceNoticeModal.css";

type SellerWorkspaceNoticeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function SellerWorkspaceNoticeModal({
  isOpen,
  onClose,
}: SellerWorkspaceNoticeModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titleId="workspace-preview-title"
      eyebrow="ShopAI SellerHub · Entry Point"
      closeLabel="Close workspace notice"
      maxWidth="sm"
      zIndex="elevated"
    >
      <h2 id="workspace-preview-title" className="workspace-modal__title">
        Seller Workspace is planned for the next stage
      </h2>

      <p className="workspace-modal__copy">
        This public storefront stage focuses on buyer discovery, variant stock
        accuracy, and seller profiles. Tools for sellers to manage catalogs,
        inventory, and store details will be introduced in the next milestone.
      </p>

      <button
        type="button"
        className="workspace-modal__ack"
        onClick={onClose}
      >
        Back to Marketplace
      </button>
    </Modal>
  );
}
