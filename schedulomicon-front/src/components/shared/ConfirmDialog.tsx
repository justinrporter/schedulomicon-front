import {
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-[#173442]/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="panel-shell w-full max-w-md p-6">
          <DialogTitle className="text-2xl font-semibold">{title}</DialogTitle>
          <p className="mt-3 text-sm leading-6 text-[#6d6048]">{description}</p>

          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <button type="button" className="ghost-button" onClick={onClose}>
              {cancelLabel}
            </button>
            <button type="button" className="danger-button" onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
