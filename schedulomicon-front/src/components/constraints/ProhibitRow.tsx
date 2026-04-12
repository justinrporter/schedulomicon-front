import type { ProhibitDef, ValidationWarning } from '../../types'
import { DeleteRowButton } from '../shared/DeleteRowButton'
import { WarningIcon } from '../shared/WarningIcon'

export interface ConstraintOption {
  value: string
  label: string
  tone?: 'default' | 'warning' | 'danger'
}

interface ProhibitRowProps {
  prohibition: ProhibitDef
  residentOptions: ConstraintOption[]
  rotationOptions: ConstraintOption[]
  warnings: ValidationWarning[]
  onChange: (nextProhibition: ProhibitDef) => void
  onDelete: () => void
}

export function ProhibitRow({
  prohibition,
  residentOptions,
  rotationOptions,
  warnings,
  onChange,
  onDelete,
}: ProhibitRowProps) {
  return (
    <div className="section-card space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="grid min-w-0 flex-1 gap-4 md:grid-cols-2">
          <label>
            <span className="field-label">Resident</span>
            <select
              className="input-field"
              value={prohibition.residentName}
              onChange={(event) =>
                onChange({
                  ...prohibition,
                  residentName: event.target.value,
                })
              }
            >
              <option value="">Select resident</option>
              {residentOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="field-label">Rotation</span>
            <select
              className="input-field"
              value={prohibition.rotationName}
              onChange={(event) =>
                onChange({
                  ...prohibition,
                  rotationName: event.target.value,
                })
              }
            >
              <option value="">Select rotation</option>
              {rotationOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-3 pt-7">
          {warnings[0] ? <WarningIcon warning={warnings[0]} /> : null}
          <DeleteRowButton onClick={onDelete} />
        </div>
      </div>

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
