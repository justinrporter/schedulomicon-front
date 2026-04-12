import {
  ChevronDownIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'

import type { RotationDef, ValidationWarning } from '../../types'
import { isCompleteRange, normalizeText } from '../../utils/strings'
import { DeleteRowButton } from '../shared/DeleteRowButton'
import { WarningIcon } from '../shared/WarningIcon'
import { RotationFields } from './RotationFields'

interface RotationRowProps {
  rotation: RotationDef
  residentGroups: string[]
  warnings: ValidationWarning[]
  onChange: (nextRotation: RotationDef) => void
  onDelete: () => void
}

function formatSummary(rotation: RotationDef) {
  const parts: string[] = []

  if (isCompleteRange(rotation.coverageMin, rotation.coverageMax)) {
    parts.push(`coverage [${rotation.coverageMin}, ${rotation.coverageMax}]`)
  }

  if (
    rotation.rotCountMode === 'flat' &&
    isCompleteRange(rotation.rotCountFlat.min, rotation.rotCountFlat.max)
  ) {
    parts.push(`rot_count [${rotation.rotCountFlat.min}, ${rotation.rotCountFlat.max}]`)
  }

  if (rotation.rotCountMode === 'per-group') {
    const summary = rotation.rotCountPerGroup
      .filter((entry) => normalizeText(entry.group))
      .map(
        (entry) =>
          `${entry.group} [${entry.min === '' ? '?' : entry.min}, ${
            entry.max === '' ? '?' : entry.max
          }]`,
      )
      .join(' · ')

    if (summary) {
      parts.push(summary)
    }
  }

  if (parts.length === 0) {
    return 'Coverage and rotation count rules are still blank.'
  }

  return parts.join(' · ')
}

export function RotationRow({
  rotation,
  residentGroups,
  warnings,
  onChange,
  onDelete,
}: RotationRowProps) {
  return (
    <Disclosure defaultOpen={warnings.length > 0 || !normalizeText(rotation.name)}>
      {({ open }) => (
        <div className="section-card overflow-hidden p-0">
          <div className="flex items-start justify-between gap-3 border-b border-[#e6d9c1] px-4 py-4">
            <DisclosureButton className="flex min-w-0 flex-1 items-start gap-3 text-left">
              <span className="rounded-full bg-[#ede2ca] p-2 text-[#7c653d]">
                <DocumentTextIcon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2 text-base font-semibold text-ink">
                  {normalizeText(rotation.name) || 'Untitled Rotation'}
                  {warnings[0] ? <WarningIcon warning={warnings[0]} /> : null}
                </span>
                <span className="mt-1 block text-sm text-[#75674d]">
                  {formatSummary(rotation)}
                </span>
              </span>
              <ChevronDownIcon
                className={`mt-1 h-5 w-5 shrink-0 text-[#7c653d] transition ${
                  open ? 'rotate-0' : '-rotate-90'
                }`}
              />
            </DisclosureButton>

            <DeleteRowButton className="mt-1" onClick={onDelete} />
          </div>

          <DisclosurePanel className="space-y-4 px-4 py-5">
            <RotationFields
              rotation={rotation}
              residentGroups={residentGroups}
              onChange={onChange}
            />

            {warnings.length > 0 ? (
              <ul className="space-y-2">
                {warnings.map((warning) => (
                  <li
                    key={warning.id}
                    className="flex items-start gap-2 rounded-2xl bg-white px-3 py-2 text-sm text-[#6f5634]"
                  >
                    <WarningIcon
                      warning={warning}
                      className="mt-0.5 h-4 w-4 shrink-0"
                    />
                    <span>{warning.message}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </DisclosurePanel>
        </div>
      )}
    </Disclosure>
  )
}
