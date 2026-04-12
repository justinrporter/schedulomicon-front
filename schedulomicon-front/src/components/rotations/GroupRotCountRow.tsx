import type { RotCountEntry } from '../../types'
import { DeleteRowButton } from '../shared/DeleteRowButton'
import { MinMaxInput } from '../shared/MinMaxInput'

interface GroupRotCountRowProps {
  entry: RotCountEntry
  residentGroups: string[]
  onChange: (nextEntry: RotCountEntry) => void
  onDelete: () => void
}

export function GroupRotCountRow({
  entry,
  residentGroups,
  onChange,
  onDelete,
}: GroupRotCountRowProps) {
  const hasCurrentValue = entry.group.length > 0
  const isDeletedGroup = hasCurrentValue && !residentGroups.includes(entry.group)

  return (
    <div className="rounded-xl border border-[#e1d4be] bg-white/80 p-3">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <label className="inline-field-row">
            <span className="inline-field-label">Resident Group</span>
            <select
              className="input-field"
              value={entry.group}
              onChange={(event) =>
                onChange({
                  ...entry,
                  group: event.target.value,
                })
              }
              disabled={residentGroups.length === 0 && !hasCurrentValue}
            >
              <option value="">
                {residentGroups.length === 0
                  ? 'No resident groups available'
                  : 'Select resident group'}
              </option>
              {isDeletedGroup ? (
                <option value={entry.group}>{`[Deleted: ${entry.group}]`}</option>
              ) : null}
              {residentGroups.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </label>

          <MinMaxInput
            variant="addon"
            minValue={entry.min}
            maxValue={entry.max}
            onMinChange={(min) =>
              onChange({
                ...entry,
                min,
              })
            }
            onMaxChange={(max) =>
              onChange({
                ...entry,
                max,
              })
            }
          />
        </div>

        <div className="shrink-0 pt-0.5">
          <DeleteRowButton size="compact" onClick={onDelete} />
        </div>
      </div>
    </div>
  )
}
