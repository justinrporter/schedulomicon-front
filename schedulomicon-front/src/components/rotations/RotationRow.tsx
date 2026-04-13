import {
  ChevronDownIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from '@headlessui/react'

import type { RotationDef, RotationParam, ValidationWarning } from '../../types'
import {
  createCoverageParam,
  createGroupsParam,
  createRotCountFlatParam,
  createRotCountPerGroupParam,
} from '../../state/factories'
import { hasParam } from '../../state/paramHelpers'
import { normalizeText } from '../../utils/strings'
import { DeleteRowButton } from '../shared/DeleteRowButton'
import { ParameterAddSelect } from '../shared/ParameterAddSelect'
import { WarningIcon } from '../shared/WarningIcon'
import { RotationParameterRow } from './RotationParameterRow'

interface RotationRowProps {
  rotation: RotationDef
  residentGroups: string[]
  warnings: ValidationWarning[]
  onChange: (nextRotation: RotationDef) => void
  onDelete: () => void
}

function formatSummary(rotation: RotationDef): string {
  const parts: string[] = []

  for (const param of rotation.parameters) {
    if (param.kind === 'coverage') {
      const { min, max } = param
      if (min !== '' && max !== '') {
        parts.push(`coverage [${min}, ${max}]`)
      }
    }
    if (param.kind === 'rot_count_flat') {
      const { min, max } = param
      if (min !== '' && max !== '') {
        parts.push(`rot_count [${min}, ${max}]`)
      }
    }
    if (param.kind === 'rot_count_per_group') {
      const summary = param.entries
        .filter((e) => normalizeText(e.group))
        .map(
          (e) =>
            `${e.group} [${e.min === '' ? '?' : e.min}, ${e.max === '' ? '?' : e.max}]`,
        )
        .join(' · ')
      if (summary) parts.push(summary)
    }
  }

  return parts.length > 0 ? parts.join(' · ') : 'Coverage and rotation count rules are still blank.'
}

export function RotationRow({
  rotation,
  residentGroups,
  warnings,
  onChange,
  onDelete,
}: RotationRowProps) {
  const params = rotation.parameters
  const groupsPresent     = hasParam(params, 'groups')
  const coveragePresent   = hasParam(params, 'coverage')
  const rotFlatPresent    = hasParam(params, 'rot_count_flat')
  const rotPerGrpPresent  = hasParam(params, 'rot_count_per_group')

  function addParam(kind: string) {
    let newParam: RotationParam
    switch (kind) {
      case 'groups':              newParam = createGroupsParam();           break
      case 'coverage':            newParam = createCoverageParam();         break
      case 'rot_count_flat':      newParam = createRotCountFlatParam();     break
      case 'rot_count_per_group': newParam = createRotCountPerGroupParam(); break
      default: return
    }
    onChange({ ...rotation, parameters: [...params, newParam] })
  }

  function updateParam(id: string, next: RotationParam) {
    onChange({
      ...rotation,
      parameters: params.map((p) => (p.id === id ? next : p)),
    })
  }

  function deleteParam(id: string) {
    onChange({
      ...rotation,
      parameters: params.filter((p) => p.id !== id),
    })
  }

  return (
    <Disclosure defaultOpen={warnings.length > 0 || !normalizeText(rotation.name)}>
      {({ open }) => (
        <div className="section-card overflow-hidden p-0">
          <div className="flex items-start justify-between gap-3 border-b border-[#e6d9c1] px-4 py-3.5">
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

          <DisclosurePanel className="space-y-3.5 px-4 py-4">
            <label className="inline-field-row">
              <span className="inline-field-label">Rotation Name</span>
              <input
                type="text"
                className="input-field"
                value={rotation.name}
                placeholder="Wards"
                onChange={(event) =>
                  onChange({ ...rotation, name: event.target.value })
                }
              />
            </label>

            {params.length > 0 && (
              <div className="space-y-2">
                {params.map((param) => (
                  <RotationParameterRow
                    key={param.id}
                    param={param}
                    residentGroups={residentGroups}
                    onChange={(next) => updateParam(param.id, next)}
                    onDelete={() => deleteParam(param.id)}
                  />
                ))}
              </div>
            )}

            <ParameterAddSelect
              options={[
                { kind: 'groups',              label: 'Groups',                     disabled: groupsPresent },
                { kind: 'coverage',            label: 'Coverage',                   disabled: coveragePresent },
                { kind: 'rot_count_flat',      label: 'Rotation count (same for all)', disabled: rotFlatPresent },
                { kind: 'rot_count_per_group', label: 'Rotation count (per group)', disabled: rotPerGrpPresent },
              ]}
              onAdd={addParam}
            />

            {warnings.length > 0 ? (
              <ul className="space-y-1.5">
                {warnings.map((warning) => (
                  <li key={warning.id} className="entry-warning">
                    <WarningIcon warning={warning} className="mt-0.5 h-4 w-4 shrink-0" />
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
