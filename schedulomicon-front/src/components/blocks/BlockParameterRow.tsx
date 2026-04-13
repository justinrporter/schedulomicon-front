import type { BlockParam, GroupsParam } from '../../types'
import { DeleteRowButton } from '../shared/DeleteRowButton'
import { GroupTagsInput } from '../shared/GroupTagsInput'

interface BlockParameterRowProps {
  param: BlockParam
  onChange: (next: BlockParam) => void
  onDelete: () => void
}

export function BlockParameterRow({ param, onChange, onDelete }: BlockParameterRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#e1d4be] bg-white/80 p-3">
      <div className="min-w-0 flex-1">
        {param.kind === 'groups' && (
          <div>
            <span className="field-label">Block Groups</span>
            <GroupTagsInput
              tags={(param as GroupsParam).values}
              placeholder="Early Block, Senior Call"
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
