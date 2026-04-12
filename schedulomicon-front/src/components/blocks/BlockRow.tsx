import { useState } from 'react'

import type { BlockDef, ValidationWarning } from '../../types'
import { GroupTagsInput } from '../shared/GroupTagsInput'
import { DeleteRowButton } from '../shared/DeleteRowButton'
import { WarningIcon } from '../shared/WarningIcon'

interface BlockRowProps {
  block: BlockDef
  warnings: ValidationWarning[]
  onChange: (nextBlock: BlockDef) => void
  onDelete: () => void
}

export function BlockRow({ block, warnings, onChange, onDelete }: BlockRowProps) {
  const [showGroups, setShowGroups] = useState(block.groups.length > 0)

  return (
    <div className="entry-card space-y-3">
      <div className="flex items-start gap-3">
        <label className="inline-field-row flex-1">
          <span className="inline-field-label md:w-24">Block Name</span>
          <input
            type="text"
            className="input-field"
            value={block.name}
            placeholder="July"
            onChange={(event) =>
              onChange({
                ...block,
                name: event.target.value,
              })
            }
          />
        </label>

        <div className="flex shrink-0 items-center gap-2 pt-0.5">
          {warnings[0] ? <WarningIcon warning={warnings[0]} className="h-4 w-4" /> : null}
          <DeleteRowButton size="compact" onClick={onDelete} />
        </div>
      </div>

      <button
        type="button"
        className="compact-toggle"
        onClick={() => setShowGroups((current) => !current)}
      >
        {showGroups ? 'Hide groups' : 'Add groups (optional)'}
      </button>

      {showGroups ? (
        <div>
          <span className="field-label">Block Groups</span>
          <GroupTagsInput
            tags={block.groups}
            placeholder="Early Block, Senior Call"
            onChange={(groups) =>
              onChange({
                ...block,
                groups,
              })
            }
          />
        </div>
      ) : null}

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
    </div>
  )
}
