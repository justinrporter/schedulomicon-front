import { useState } from 'react'

import type { ResidentDef, ValidationWarning } from '../../types'
import { DeleteRowButton } from '../shared/DeleteRowButton'
import { GroupTagsInput } from '../shared/GroupTagsInput'
import { WarningIcon } from '../shared/WarningIcon'

interface ResidentRowProps {
  resident: ResidentDef
  warnings: ValidationWarning[]
  onChange: (nextResident: ResidentDef) => void
  onDelete: () => void
}

export function ResidentRow({
  resident,
  warnings,
  onChange,
  onDelete,
}: ResidentRowProps) {
  const [showGroups, setShowGroups] = useState(resident.groups.length > 0)

  return (
    <div className="section-card space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <label>
            <span className="field-label">Resident Name</span>
            <input
              type="text"
              className="input-field"
              value={resident.name}
              placeholder="Dr. Avery Taylor"
              onChange={(event) =>
                onChange({
                  ...resident,
                  name: event.target.value,
                })
              }
            />
          </label>
        </div>

        <div className="flex items-center gap-3 pt-7">
          {warnings[0] ? <WarningIcon warning={warnings[0]} /> : null}
          <DeleteRowButton onClick={onDelete} />
        </div>
      </div>

      <button
        type="button"
        className="text-sm font-semibold text-[#7f5c2f] transition hover:text-brass"
        onClick={() => setShowGroups((current) => !current)}
      >
        {showGroups ? 'Hide groups' : 'Add groups (optional)'}
      </button>

      {showGroups ? (
        <div>
          <span className="field-label">Resident Groups</span>
          <GroupTagsInput
            tags={resident.groups}
            placeholder="sr, jr, night-float"
            onChange={(groups) =>
              onChange({
                ...resident,
                groups,
              })
            }
          />
        </div>
      ) : null}

      {warnings.length > 0 ? (
        <ul className="space-y-2">
          {warnings.map((warning) => (
            <li
              key={warning.id}
              className="flex items-start gap-2 rounded-2xl bg-white px-3 py-2 text-sm text-[#6f5634]"
            >
              <WarningIcon warning={warning} className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{warning.message}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
