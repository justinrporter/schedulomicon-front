import type { RotationDef, ValidationWarning } from '../../types'
import { getItemWarnings, getSectionWarningCount } from '../../utils/warnings'
import { BulkAddNamesButton } from '../shared/BulkAddNamesButton'
import { ListFooterAddButton } from '../shared/ListFooterAddButton'
import { SectionPanel } from '../shared/SectionPanel'
import { RotationRow } from './RotationRow'

interface RotationsSectionProps {
  rotations: RotationDef[]
  residentGroups: string[]
  warnings: ValidationWarning[]
  onAdd: () => void
  onBulkAdd: (names: string[]) => void
  onChange: (nextRotation: RotationDef) => void
  onDelete: (rotationId: string) => void
}

export function RotationsSection({
  rotations,
  residentGroups,
  warnings,
  onAdd,
  onBulkAdd,
  onChange,
  onDelete,
}: RotationsSectionProps) {
  return (
    <SectionPanel
      title="Rotations"
      description="Set baseline coverage, optional rotation groups, and any schedule-wide rotation count limits."
      warningCount={getSectionWarningCount(warnings, 'rotations')}
      actions={
        <BulkAddNamesButton
          dialogTitle="Bulk Add Rotations"
          description="Paste one rotation name per line. Blank lines are ignored and leading or trailing spaces are trimmed."
          textareaLabel="Rotations"
          placeholder={'ICU\nWards\nClinic'}
          itemLabelSingular="rotation"
          itemLabelPlural="rotations"
          submitLabel="Add Rotations"
          onAdd={onBulkAdd}
        />
      }
    >
      {rotations.length === 0 ? (
        <div className="space-y-4">
          <div className="empty-state">
            Add rotations one at a time or paste a list to generate rows in bulk.
          </div>
          <ListFooterAddButton tooltip="Add rotation" onClick={onAdd} />
        </div>
      ) : (
        <div className="space-y-4">
          {rotations.map((rotation) => (
            <RotationRow
              key={rotation.id}
              rotation={rotation}
              residentGroups={residentGroups}
              warnings={getItemWarnings(warnings, rotation.id)}
              onChange={onChange}
              onDelete={() => onDelete(rotation.id)}
            />
          ))}
          <ListFooterAddButton tooltip="Add rotation" onClick={onAdd} />
        </div>
      )}
    </SectionPanel>
  )
}
