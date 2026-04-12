import type { BlockDef, ValidationWarning } from '../../types'
import { getItemWarnings, getSectionWarningCount } from '../../utils/warnings'
import { AddItemButton } from '../shared/AddItemButton'
import { SectionPanel } from '../shared/SectionPanel'
import { BlockRow } from './BlockRow'

interface BlocksSectionProps {
  blocks: BlockDef[]
  warnings: ValidationWarning[]
  onAdd: () => void
  onChange: (nextBlock: BlockDef) => void
  onDelete: (blockId: string) => void
}

export function BlocksSection({
  blocks,
  warnings,
  onAdd,
  onChange,
  onDelete,
}: BlocksSectionProps) {
  return (
    <SectionPanel
      title="Blocks"
      description="Define the time periods in your schedule. Groups are optional."
      warningCount={getSectionWarningCount(warnings, 'blocks')}
      actions={<AddItemButton onClick={onAdd}>Add Block</AddItemButton>}
    >
      {blocks.length === 0 ? (
        <div className="empty-state">
          Start with blocks like July, August, or Block 1 so the rest of the
          schedule has a timeline to target.
        </div>
      ) : (
        blocks.map((block) => (
          <BlockRow
            key={block.id}
            block={block}
            warnings={getItemWarnings(warnings, block.id)}
            onChange={onChange}
            onDelete={() => onDelete(block.id)}
          />
        ))
      )}
    </SectionPanel>
  )
}
