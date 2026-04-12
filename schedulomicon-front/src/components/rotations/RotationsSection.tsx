import type { RotationDef, ValidationWarning } from '../../types'
import { getItemWarnings, getSectionWarningCount } from '../../utils/warnings'
import { AddItemButton } from '../shared/AddItemButton'
import { SectionPanel } from '../shared/SectionPanel'
import { RotationRow } from './RotationRow'

interface RotationsSectionProps {
  rotations: RotationDef[]
  residentGroups: string[]
  warnings: ValidationWarning[]
  onAdd: () => void
  onChange: (nextRotation: RotationDef) => void
  onDelete: (rotationId: string) => void
}

export function RotationsSection({
  rotations,
  residentGroups,
  warnings,
  onAdd,
  onChange,
  onDelete,
}: RotationsSectionProps) {
  return (
    <SectionPanel
      title="Rotations"
      description="Set baseline coverage, optional rotation groups, and any schedule-wide rotation count limits."
      warningCount={getSectionWarningCount(warnings, 'rotations')}
      actions={<AddItemButton onClick={onAdd}>Add Rotation</AddItemButton>}
    >
      {rotations.length === 0 ? (
        <div className="empty-state">
          Add rotations like ICU, Wards, or Clinic. Coverage and rotation count
          rules can be filled in later.
        </div>
      ) : (
        rotations.map((rotation) => (
          <RotationRow
            key={rotation.id}
            rotation={rotation}
            residentGroups={residentGroups}
            warnings={getItemWarnings(warnings, rotation.id)}
            onChange={onChange}
            onDelete={() => onDelete(rotation.id)}
          />
        ))
      )}
    </SectionPanel>
  )
}
