import type { RotationDef } from '../../types'
import { createRotCountEntry } from '../../state/factories'
import { AddItemButton } from '../shared/AddItemButton'
import { MinMaxInput } from '../shared/MinMaxInput'
import { GroupRotCountRow } from './GroupRotCountRow'

interface RotCountEditorProps {
  rotation: RotationDef
  residentGroups: string[]
  onChange: (nextRotation: RotationDef) => void
}

const MODES: Array<{ value: RotationDef['rotCountMode']; label: string }> = [
  { value: 'none', label: 'None' },
  { value: 'flat', label: 'Same for all' },
  { value: 'per-group', label: 'Per group' },
]

export function RotCountEditor({
  rotation,
  residentGroups,
  onChange,
}: RotCountEditorProps) {
  return (
    <div className="space-y-4">
      <div>
        <span className="field-label">Rotation Count</span>
        <div className="flex flex-wrap gap-2">
          {MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                rotation.rotCountMode === mode.value
                  ? 'bg-ink text-white'
                  : 'border border-[#d3c3a7] bg-white/70 text-ink hover:border-brass hover:text-brass'
              }`}
              onClick={() =>
                onChange({
                  ...rotation,
                  rotCountMode: mode.value,
                })
              }
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {rotation.rotCountMode === 'flat' ? (
        <div className="rounded-2xl border border-[#e1d4be] bg-white/80 p-4">
          <MinMaxInput
            minValue={rotation.rotCountFlat.min}
            maxValue={rotation.rotCountFlat.max}
            onMinChange={(min) =>
              onChange({
                ...rotation,
                rotCountFlat: {
                  ...rotation.rotCountFlat,
                  min,
                },
              })
            }
            onMaxChange={(max) =>
              onChange({
                ...rotation,
                rotCountFlat: {
                  ...rotation.rotCountFlat,
                  max,
                },
              })
            }
          />
        </div>
      ) : null}

      {rotation.rotCountMode === 'per-group' ? (
        <div className="space-y-4">
          {residentGroups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#cfbf9f] bg-[#fff8eb] px-4 py-4 text-sm text-[#6f6046]">
              Define at least one resident group before adding per-group rotation
              counts.
            </div>
          ) : null}

          {rotation.rotCountPerGroup.map((entry) => (
            <GroupRotCountRow
              key={entry.id}
              entry={entry}
              residentGroups={residentGroups}
              onChange={(nextEntry) =>
                onChange({
                  ...rotation,
                  rotCountPerGroup: rotation.rotCountPerGroup.map((currentEntry) =>
                    currentEntry.id === nextEntry.id ? nextEntry : currentEntry,
                  ),
                })
              }
              onDelete={() =>
                onChange({
                  ...rotation,
                  rotCountPerGroup: rotation.rotCountPerGroup.filter(
                    (currentEntry) => currentEntry.id !== entry.id,
                  ),
                })
              }
            />
          ))}

          <AddItemButton
            onClick={() =>
              onChange({
                ...rotation,
                rotCountPerGroup: [...rotation.rotCountPerGroup, createRotCountEntry()],
              })
            }
            disabled={residentGroups.length === 0}
          >
            Add Group Rule
          </AddItemButton>
        </div>
      ) : null}
    </div>
  )
}
