import type { BlockDef, BlockParam, ValidationWarning } from '../../types'
import { createGroupsParam } from '../../state/factories'
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
import { BlockParameterRow } from './BlockParameterRow'

interface BlockRowProps {
  block: BlockDef
  warnings: ValidationWarning[]
  onChange: (nextBlock: BlockDef) => void
  onDelete: () => void
}

export function BlockRow({ block, warnings, onChange, onDelete }: BlockRowProps) {
  const params = block.parameters
  const groupsPresent = hasParam(params, 'groups')
  const nameState = getWarningState(getTargetWarnings(warnings, { field: 'name' }))
  const cardState = getWarningState(warnings)

  function addParam(kind: string) {
    let newParam: BlockParam
    switch (kind) {
      case 'groups':
        newParam = createGroupsParam()
        break
      default:
        return
    }
    onChange({ ...block, parameters: [...params, newParam] })
  }

  function updateParam(id: string, next: BlockParam) {
    onChange({
      ...block,
      parameters: params.map((p) => (p.id === id ? next : p)),
    })
  }

  function deleteParam(id: string) {
    onChange({
      ...block,
      parameters: params.filter((p) => p.id !== id),
    })
  }

  return (
    <CollapsibleEntryCard
      title={normalizeText(block.name) || 'Untitled Block'}
      validationState={cardState}
      onDelete={onDelete}
    >
      <label className="inline-field-row">
        <span className="inline-field-label md:w-24">Block Name</span>
        <input
          type="text"
          className={`input-field ${getInputValidationClass(nameState)}`}
          value={block.name}
          placeholder="July"
          aria-invalid={getAriaInvalid(nameState)}
          onChange={(event) =>
            onChange({
              ...block,
              name: event.target.value,
            })
          }
        />
      </label>

      {params.length > 0 && (
        <div className="space-y-2">
          {params.map((param) => (
            <BlockParameterRow
              key={param.id}
              param={param}
              warnings={warnings}
              onChange={(next) => updateParam(param.id, next)}
              onDelete={() => deleteParam(param.id)}
            />
          ))}
        </div>
      )}

      <ParameterAddSelect
        options={[
          { kind: 'groups', label: 'Groups', disabled: groupsPresent },
        ]}
        onAdd={addParam}
      />
    </CollapsibleEntryCard>
  )
}
