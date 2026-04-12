import type { RotationDef } from '../../types'
import { GroupTagsInput } from '../shared/GroupTagsInput'
import { MinMaxInput } from '../shared/MinMaxInput'
import { RotCountEditor } from './RotCountEditor'

interface RotationFieldsProps {
  rotation: RotationDef
  residentGroups: string[]
  onChange: (nextRotation: RotationDef) => void
}

export function RotationFields({
  rotation,
  residentGroups,
  onChange,
}: RotationFieldsProps) {
  return (
    <div className="space-y-4">
      <label className="inline-field-row">
        <span className="inline-field-label">Rotation Name</span>
        <input
          type="text"
          className="input-field"
          value={rotation.name}
          placeholder="Wards"
          onChange={(event) =>
            onChange({
              ...rotation,
              name: event.target.value,
            })
          }
        />
      </label>

      <MinMaxInput
        variant="addon"
        label="Coverage"
        minValue={rotation.coverageMin}
        maxValue={rotation.coverageMax}
        onMinChange={(coverageMin) =>
          onChange({
            ...rotation,
            coverageMin,
          })
        }
        onMaxChange={(coverageMax) =>
          onChange({
            ...rotation,
            coverageMax,
          })
        }
      />

      <div className="space-y-2 md:flex md:items-start md:gap-3 md:space-y-0">
        <span className="inline-field-label pt-3">Rotation Groups</span>
        <div className="min-w-0 flex-1">
          <GroupTagsInput
            tags={rotation.groups}
            placeholder="critical, inpatient"
            onChange={(groups) =>
              onChange({
                ...rotation,
                groups,
              })
            }
          />
        </div>
      </div>

      <RotCountEditor
        rotation={rotation}
        residentGroups={residentGroups}
        onChange={onChange}
      />
    </div>
  )
}
