import type { BlockParam, GroupsParam, ValidationWarning } from '../../types'
import {
  getTargetWarnings,
  getWarningState,
} from '../../utils/warnings'
import { getCardValidationClass } from '../../utils/validationUi'
import { DeleteRowButton } from '../shared/DeleteRowButton'
import { GroupTagsInput } from '../shared/GroupTagsInput'

interface BlockParameterRowProps {
  param: BlockParam
  warnings: ValidationWarning[]
  onChange: (next: BlockParam) => void
  onDelete: () => void
}

export function BlockParameterRow({
  param,
  warnings,
  onChange,
  onDelete,
}: BlockParameterRowProps) {
  const paramWarnings = getTargetWarnings(warnings, { paramId: param.id })
  const validationState = getWarningState(paramWarnings)

  return (
    <div className={`flex items-start gap-3 rounded-xl border border-[#e1d4be] bg-white/80 p-3 ${getCardValidationClass(validationState)}`}>
      <div className="min-w-0 flex-1">
        {param.kind === 'groups' && (
          <div>
            <span className="field-label">Block Groups</span>
            <GroupTagsInput
              tags={(param as GroupsParam).values}
              placeholder="Early Block, Senior Call"
              validationState={getWarningState(
                getTargetWarnings(paramWarnings, { field: 'groups' }),
              )}
              onChange={(values) =>
                onChange({ ...(param as GroupsParam), values })
              }
            />
          </div>
        )}
      </div>

      <DeleteRowButton size="compact" onClick={onDelete} />
    </div>
  )
}
