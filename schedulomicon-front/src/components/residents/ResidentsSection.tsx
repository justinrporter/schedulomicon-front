import type { ResidentDef, ValidationWarning } from '../../types'
import { getItemWarnings, getSectionWarningCount } from '../../utils/warnings'
import { AddItemButton } from '../shared/AddItemButton'
import { SectionPanel } from '../shared/SectionPanel'
import { BulkAddResidents } from './BulkAddResidents'
import { ResidentRow } from './ResidentRow'

interface ResidentsSectionProps {
  residents: ResidentDef[]
  warnings: ValidationWarning[]
  onAdd: () => void
  onBulkAdd: (names: string[]) => void
  onChange: (nextResident: ResidentDef) => void
  onDelete: (residentId: string) => void
}

export function ResidentsSection({
  residents,
  warnings,
  onAdd,
  onBulkAdd,
  onChange,
  onDelete,
}: ResidentsSectionProps) {
  return (
    <SectionPanel
      title="Residents"
      description="Capture the roster, then optionally assign each resident to one or more groups."
      warningCount={getSectionWarningCount(warnings, 'residents')}
      actions={
        <div className="flex flex-wrap gap-2">
          <BulkAddResidents onAdd={onBulkAdd} />
          <AddItemButton onClick={onAdd}>Add Resident</AddItemButton>
        </div>
      }
    >
      {residents.length === 0 ? (
        <div className="empty-state">
          Add residents one at a time or paste a roster to generate rows in bulk.
        </div>
      ) : (
        residents.map((resident) => (
          <ResidentRow
            key={resident.id}
            resident={resident}
            warnings={getItemWarnings(warnings, resident.id)}
            onChange={onChange}
            onDelete={() => onDelete(resident.id)}
          />
        ))
      )}
    </SectionPanel>
  )
}
