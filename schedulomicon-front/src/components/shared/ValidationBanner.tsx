import {
  ChevronDownIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'

import type { ValidationWarning } from '../../types'
import { WarningIcon } from './WarningIcon'

interface ValidationBannerProps {
  warnings: ValidationWarning[]
}

export function ValidationBanner({ warnings }: ValidationBannerProps) {
  const [closedAtCount, setClosedAtCount] = useState<number | null>(null)

  if (warnings.length === 0) {
    return null
  }

  const isOpen = closedAtCount !== warnings.length
  const errors = warnings.filter((warning) => warning.severity === 'error').length

  return (
    <div className="panel-shell overflow-hidden border-[#eed2b5] bg-[#fff7eb]">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        onClick={() =>
          setClosedAtCount((currentCount) =>
            currentCount === warnings.length ? null : warnings.length,
          )
        }
      >
        <span className="flex items-start gap-3">
          <span className="rounded-full bg-[#fce4bc] p-2 text-[#9a6419]">
            <ExclamationTriangleIcon className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-[#9a6419]">
              Validation
            </span>
            <span className="mt-1 block text-base font-semibold text-[#5d4121]">
              {warnings.length} issue{warnings.length === 1 ? '' : 's'} found
              {errors > 0 ? `, including ${errors} error${errors === 1 ? '' : 's'}` : ''}
            </span>
          </span>
        </span>

        <ChevronDownIcon
          className={`h-5 w-5 text-[#8d6332] transition ${isOpen ? 'rotate-0' : '-rotate-90'}`}
        />
      </button>

      {isOpen ? (
        <ul className="space-y-2 border-t border-[#ecd7b6] px-5 py-4">
          {warnings.map((warning) => (
            <li
              key={warning.id}
              className="flex items-start gap-3 rounded-2xl bg-white/80 px-4 py-3 text-sm text-[#5b4f3d]"
            >
              <WarningIcon warning={warning} className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{warning.message}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
