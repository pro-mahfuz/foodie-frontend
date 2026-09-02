// src/components/ui/modal/ConfirmationModal.tsx
import { Modal } from "./index";
import Button from "../button/Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  width?: string; // Optional prop for width
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal = ({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmationModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      width="400px" // Default width can be adjusted
      onClose={onCancel}
      showCloseButton={false}
      isFullscreen={false}
      className="max-w-[700px] m-4"
    >
      <div className="relative w-full p-4 overflow-y-auto bg-white rounded-3xl dark:bg-gray-900 lg:p-11">
        <div className="px-2 text-center">
          <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            {title}
          </h4>
          {message && (
            <p className="text-gray-600 dark:text-gray-300">{message}</p>
          )}
        </div>
        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-center">
          <Button size="sm" variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button size="sm" variant="primary" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;
