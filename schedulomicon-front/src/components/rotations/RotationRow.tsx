import type { RotationDef, RotationParam, ValidationWarning } from '../../types'
import {
  createCoverageParam,
  createGroupsParam,
  createRotCountFlatParam,
  createRotCountPerGroupParam,
} from '../../state/factories'
import { hasParam } from '../../state/paramHelpers'
import { normalizeText } from '../../utils/strings'
import {
  getTargetWarnings,
  getWarningState,
} from '../../utils/warnings'
import {
  getAriaInvalid,
  getInputValidationClass,
} from '../../utils/validationUi'
import { CollapsibleEntryCard } from '../shared/CollapsibleEntryCard'
import { ParameterAddSelect } from '../shared/ParameterAddSelect'
import { RotationParameterRow } from './RotationParameterRow'

interface RotationRowProps {
  rotation: RotationDef
  residentGroups: string[]
  warnings: ValidationWarning[]
  onChange: (nextRotation: RotationDef) => void
  onDelete: () => void
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
  const nameState = getWarningState(getTargetWarnings(warnings, { field: 'name' }))
  const cardState = getWarningState(warnings)

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
    <CollapsibleEntryCard
      title={normalizeText(rotation.name) || 'Untitled Rotation'}
      validationState={cardState}
      onDelete={onDelete}
      panelClassName="space-y-3.5"
    >
      <label className="inline-field-row">
        <span className="inline-field-label">Rotation Name</span>
        <input
          type="text"
          className={`input-field ${getInputValidationClass(nameState)}`}
          value={rotation.name}
          placeholder="Wards"
          aria-invalid={getAriaInvalid(nameState)}
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
              warnings={warnings}
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
    </CollapsibleEntryCard>
  )
}
