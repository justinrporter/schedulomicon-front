import type { RotCountEntry, ValidationWarning } from '../../types'
import {
  getTargetWarnings,
  getWarningState,
} from '../../utils/warnings'
import {
  getAriaInvalid,
  getCardValidationClass,
  getInputValidationClass,
} from '../../utils/validationUi'
import { DeleteRowButton } from '../shared/DeleteRowButton'
import { MinMaxInput } from '../shared/MinMaxInput'

interface GroupRotCountRowProps {
  entry: RotCountEntry
  residentGroups: string[]
  warnings: ValidationWarning[]
  onChange: (nextEntry: RotCountEntry) => void
  onDelete: () => void
}

export function GroupRotCountRow({
  entry,
  residentGroups,
  warnings,
  onChange,
  onDelete,
}: GroupRotCountRowProps) {
  const hasCurrentValue = entry.group.length > 0
  const isDeletedGroup = hasCurrentValue && !residentGroups.includes(entry.group)
  const entryWarnings = getTargetWarnings(warnings, { entryId: entry.id })
  const rowState = getWarningState(entryWarnings)
  const groupState = getWarningState(
    getTargetWarnings(entryWarnings, { field: 'group' }),
  )
  const rangeState = getWarningState(
    getTargetWarnings(entryWarnings, { field: 'range' }),
  )

  return (
    <div className={`rounded-xl border border-[#e1d4be] bg-white/80 p-3 ${getCardValidationClass(rowState)}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-3">
          <label className="inline-field-row">
            <span className="inline-field-label">Resident Group</span>
            <select
              className={`input-field ${getInputValidationClass(groupState)}`}
              value={entry.group}
              aria-invalid={getAriaInvalid(groupState)}
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
            validationState={rangeState}
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
