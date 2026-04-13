import type { BlockDef, BlockParam, ValidationWarning } from '../../types'
import { createGroupsParam } from '../../state/factories'
import { hasParam } from '../../state/paramHelpers'
import { DeleteRowButton } from '../shared/DeleteRowButton'
import { ParameterAddSelect } from '../shared/ParameterAddSelect'
import { WarningIcon } from '../shared/WarningIcon'
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

      {params.length > 0 && (
        <div className="space-y-2">
          {params.map((param) => (
            <BlockParameterRow
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
          { kind: 'groups', label: 'Groups', disabled: groupsPresent },
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
