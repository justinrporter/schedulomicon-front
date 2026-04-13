import { PlusCircleIcon } from '@heroicons/react/24/outline'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
} from '@headlessui/react'
import { startTransition, useMemo, useState } from 'react'

import { normalizeText } from '../../utils/strings'

interface BulkAddNamesButtonProps {
  dialogTitle: string
  description: string
  textareaLabel: string
  placeholder: string
  itemLabelSingular: string
  itemLabelPlural: string
  submitLabel: string
  onAdd: (names: string[]) => void
}

export function BulkAddNamesButton({
  dialogTitle,
  description,
  textareaLabel,
  placeholder,
  itemLabelSingular,
  itemLabelPlural,
  submitLabel,
  onAdd,
}: BulkAddNamesButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState('')

  const parsedNames = useMemo(
    () =>
      draft
        .split(/\r?\n/)
        .map((line) => normalizeText(line))
        .filter(Boolean),
    [draft],
  )

  function handleSubmit() {
    if (parsedNames.length === 0) {
      return
    }

    startTransition(() => {
      onAdd(parsedNames)
    })

    setDraft('')
    setIsOpen(false)
  }

  return (
    <>
      <button type="button" className="ghost-button" onClick={() => setIsOpen(true)}>
        <PlusCircleIcon className="h-5 w-5" />
        Add Multiple
      </button>

      <Dialog open={isOpen} onClose={setIsOpen} className="relative z-50">
        <div className="fixed inset-0 bg-[#173442]/40 backdrop-blur-sm" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="panel-shell w-full max-w-2xl p-6">
            <DialogTitle className="text-2xl font-semibold">{dialogTitle}</DialogTitle>
            <p className="mt-3 text-sm leading-6 text-[#6d6048]">{description}</p>

            <label className="mt-5 block">
              <span className="field-label">{textareaLabel}</span>
              <textarea
                rows={12}
                className="input-field min-h-[14rem] resize-y font-mono text-sm"
                value={draft}
                placeholder={placeholder}
                onChange={(event) => setDraft(event.target.value)}
              />
            </label>

            <p className="mt-3 text-sm text-[#7b6b52]">
              {parsedNames.length}{' '}
              {parsedNames.length === 1 ? itemLabelSingular : itemLabelPlural} ready to add
            </p>

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button type="button" className="ghost-button" onClick={() => setIsOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="primary-button"
                disabled={parsedNames.length === 0}
                onClick={handleSubmit}
              >
                {submitLabel}
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
