import {
  ChevronDownIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'
import type { ReactNode } from 'react'

interface SectionPanelProps {
  title: string
  description: string
  warningCount?: number
  actions?: ReactNode
  children: ReactNode
  defaultOpen?: boolean
}

export function SectionPanel({
  title,
  description,
  warningCount = 0,
  actions,
  children,
  defaultOpen = true,
}: SectionPanelProps) {
  return (
    <div className="panel-shell overflow-hidden">
      <Disclosure defaultOpen={defaultOpen}>
        {({ open }) => (
          <>
            <div className="flex items-start justify-between gap-4 border-b border-[#e6d9c1] px-5 py-4">
              <DisclosureButton className="flex min-w-0 flex-1 items-start gap-3 text-left">
                <span className="mt-1 rounded-full bg-[#ede2ca] p-1 text-[#725b3a]">
                  <ChevronDownIcon
                    className={`h-4 w-4 transition ${open ? 'rotate-0' : '-rotate-90'}`}
                  />
                </span>
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2 text-lg font-semibold text-ink">
                    {title}
                    {warningCount > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#fff0d6] px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6419]">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        {warningCount}
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-sm text-[#75674d]">{description}</span>
                </span>
              </DisclosureButton>

              {actions ? <div className="shrink-0">{actions}</div> : null}
            </div>

            <DisclosurePanel className="space-y-4 px-5 py-5">
              {children}
            </DisclosurePanel>
          </>
        )}
      </Disclosure>
    </div>
  )
}
