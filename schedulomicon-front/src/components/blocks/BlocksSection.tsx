import type { BlockDef, ValidationWarning } from '../../types'
import { getItemWarnings, getSectionWarningCount } from '../../utils/warnings'
import { BulkAddNamesButton } from '../shared/BulkAddNamesButton'
import { ListFooterAddButton } from '../shared/ListFooterAddButton'
import { SectionPanel } from '../shared/SectionPanel'
import { BlockRow } from './BlockRow'

interface BlocksSectionProps {
  blocks: BlockDef[]
  warnings: ValidationWarning[]
  onAdd: () => void
  onBulkAdd: (names: string[]) => void
  onChange: (nextBlock: BlockDef) => void
  onDelete: (blockId: string) => void
}

export function BlocksSection({
  blocks,
  warnings,
  onAdd,
  onBulkAdd,
  onChange,
  onDelete,
}: BlocksSectionProps) {
  return (
    <SectionPanel
      title="Blocks"
      warningCount={getSectionWarningCount(warnings, 'blocks')}
      actions={
        <BulkAddNamesButton
          dialogTitle="Bulk Add Blocks"
          description="Paste one block name per line. Blank lines are ignored and leading or trailing spaces are trimmed."
          textareaLabel="Blocks"
          placeholder={'July\nAugust\nBlock 1'}
          itemLabelSingular="block"
          itemLabelPlural="blocks"
          submitLabel="Add Blocks"
          onAdd={onBulkAdd}
        />
      }
    >
      {blocks.length === 0 ? (
        <div className="space-y-4">
          <div className="empty-state">
            Add blocks one at a time or paste a list to generate rows in bulk.
          </div>
          <ListFooterAddButton tooltip="Add block" onClick={onAdd} />
        </div>
      ) : (
        <div className="space-y-4">
          {blocks.map((block) => (
            <BlockRow
              key={block.id}
              block={block}
              warnings={getItemWarnings(warnings, block.id)}
              onChange={onChange}
              onDelete={() => onDelete(block.id)}
            />
          ))}
          <ListFooterAddButton tooltip="Add block" onClick={onAdd} />
        </div>
      )}
    </SectionPanel>
  )
}
