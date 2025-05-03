import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./button";
import { Cross2Icon } from '@radix-ui/react-icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
}: ConfirmationModalProps) {
  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-overlayShow" />
        <Dialog.Content className="fixed left-[50%] top-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl focus:outline-none data-[state=open]:animate-contentShow">
          <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white">
            {title}
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            {description}
          </Dialog.Description>
          
          <div className="mt-6 flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </div>
          
          <Dialog.Close asChild>
            <button
              className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
              onClick={onClose}
              aria-label="Close"
            >
              <Cross2Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}