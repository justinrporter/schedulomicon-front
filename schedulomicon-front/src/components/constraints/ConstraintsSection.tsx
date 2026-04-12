import type { ProhibitDef, ValidationWarning } from '../../types'
import { getItemWarnings, getSectionWarningCount } from '../../utils/warnings'
import { AddItemButton } from '../shared/AddItemButton'
import { SectionPanel } from '../shared/SectionPanel'
import type { ConstraintOption } from './ProhibitRow'
import { ProhibitRow } from './ProhibitRow'

interface ConstraintsSectionProps {
  prohibitions: ProhibitDef[]
  residentOptions: ConstraintOption[]
  rotationOptions: ConstraintOption[]
  warnings: ValidationWarning[]
  onAdd: () => void
  onChange: (nextProhibition: ProhibitDef) => void
  onDelete: (prohibitionId: string) => void
}

export function ConstraintsSection({
  prohibitions,
  residentOptions,
  rotationOptions,
  warnings,
  onAdd,
  onChange,
  onDelete,
}: ConstraintsSectionProps) {
  return (
    <SectionPanel
      title="Constraints"
      description="Each row says a resident cannot be assigned to a specific rotation."
      warningCount={getSectionWarningCount(warnings, 'constraints')}
      actions={<AddItemButton onClick={onAdd}>Add Prohibition</AddItemButton>}
    >
      {prohibitions.length === 0 ? (
        <div className="empty-state">
          Add a prohibition when a resident should never be assigned to a
          particular rotation.
        </div>
      ) : (
        prohibitions.map((prohibition) => (
          <ProhibitRow
            key={prohibition.id}
            prohibition={prohibition}
            residentOptions={residentOptions}
            rotationOptions={rotationOptions}
            warnings={getItemWarnings(warnings, prohibition.id)}
            onChange={onChange}
            onDelete={() => onDelete(prohibition.id)}
          />
        ))
      )}
    </SectionPanel>
  )
}
