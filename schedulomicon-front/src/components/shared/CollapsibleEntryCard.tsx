import { ChevronDownIcon } from '@heroicons/react/24/outline'
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import type { ReactNode } from 'react'
import { useId } from 'react'

import {
  getCardValidationClass,
  type ValidationState,
} from '../../utils/validationUi'
import { DeleteRowButton } from './DeleteRowButton'

interface CollapsibleEntryCardProps {
  title: string
  validationState?: ValidationState
  onDelete: () => void
  children: ReactNode
  defaultOpen?: boolean
  panelClassName?: string
}

export function CollapsibleEntryCard({
  title,
  validationState,
  onDelete,
  children,
  defaultOpen = true,
  panelClassName = 'space-y-3',
}: CollapsibleEntryCardProps) {
  const titleId = useId()

  return (
    <Disclosure defaultOpen={defaultOpen}>
      {({ open }) => (
        <div
          role="group"
          aria-labelledby={titleId}
          className={`entry-card overflow-hidden p-0 ${getCardValidationClass(validationState)}`}
        >
          <div
            className={`flex items-start gap-3 px-4 py-3 ${
              open ? 'border-b border-[#e6d9c1]' : ''
            }`}
          >
            <DisclosureButton
              id={titleId}
              className="flex min-w-0 flex-1 items-center gap-3 text-left"
            >
              <ChevronDownIcon
                className={`h-5 w-5 shrink-0 text-[#7c653d] transition ${
                  open ? 'rotate-0' : '-rotate-90'
                }`}
              />
              <span className="truncate text-base font-semibold text-ink">
                {title}
              </span>
            </DisclosureButton>

            <DeleteRowButton className="shrink-0" size="compact" onClick={onDelete} />
          </div>

          <DisclosurePanel className={`px-4 py-4 ${panelClassName}`}>
            {children}
          </DisclosurePanel>
        </div>
      )}
    </Disclosure>
  )
}
