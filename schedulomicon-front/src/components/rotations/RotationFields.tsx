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
    <div className="space-y-5">
      <label className="block">
        <span className="field-label">Rotation Name</span>
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

      <div>
        <span className="field-label">Coverage Per Block</span>
        <MinMaxInput
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
      </div>

      <div>
        <span className="field-label">Rotation Groups</span>
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

      <RotCountEditor
        rotation={rotation}
        residentGroups={residentGroups}
        onChange={onChange}
      />
    </div>
  )
}
