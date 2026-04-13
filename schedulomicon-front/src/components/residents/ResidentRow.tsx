import type { ResidentDef, ResidentParam, ValidationWarning } from '../../types'
import {
  createGroupsParam,
  createSumEqCountParam,
  createSumEqZeroParam,
  createSumGtZeroParam,
} from '../../state/factories'
import { hasParam } from '../../state/paramHelpers'
import { DeleteRowButton } from '../shared/DeleteRowButton'
import { ParameterAddSelect } from '../shared/ParameterAddSelect'
import { WarningIcon } from '../shared/WarningIcon'
import { ResidentParameterRow } from './ResidentParameterRow'

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
  const params = resident.parameters
  const groupsPresent = hasParam(params, 'groups')

  function addParam(kind: string) {
    let newParam: ResidentParam
    switch (kind) {
      case 'groups':
        newParam = createGroupsParam()
        break
      case 'sum_gt_zero':
        newParam = createSumGtZeroParam()
        break
      case 'sum_eq_zero':
        newParam = createSumEqZeroParam()
        break
      case 'sum_eq_count':
        newParam = createSumEqCountParam()
        break
      default:
        return
    }
    onChange({ ...resident, parameters: [...params, newParam] })
  }

  function updateParam(id: string, next: ResidentParam) {
    onChange({
      ...resident,
      parameters: params.map((p) => (p.id === id ? next : p)),
    })
  }

  function deleteParam(id: string) {
    onChange({
      ...resident,
      parameters: params.filter((p) => p.id !== id),
    })
  }

  return (
    <div className="entry-card space-y-3">
      <div className="flex items-start gap-3">
        <label className="inline-field-row flex-1">
          <span className="inline-field-label">Resident Name</span>
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

        <div className="flex shrink-0 items-center gap-2 pt-0.5">
          {warnings[0] ? <WarningIcon warning={warnings[0]} className="h-4 w-4" /> : null}
          <DeleteRowButton size="compact" onClick={onDelete} />
        </div>
      </div>

      {params.length > 0 && (
        <div className="space-y-2">
          {params.map((param) => (
            <ResidentParameterRow
              key={param.id}
              param={param}
              onChange={(next) => updateParam(param.id, next)}
              onDelete={() => deleteParam(param.id)}
            />
          ))}
        </div>
      )}

      <ParameterAddSelect
        options={[
          { kind: 'groups',       label: 'Groups',         disabled: groupsPresent },
          { kind: 'sum_gt_zero',  label: 'True somewhere', disabled: false },
          { kind: 'sum_eq_zero',  label: 'Never true',     disabled: false },
          { kind: 'sum_eq_count', label: 'Count',          disabled: false },
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
    </div>
  )
}
