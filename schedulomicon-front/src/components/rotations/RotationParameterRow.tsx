import type {
  CoverageParam,
  GroupsParam,
  RotationParam,
  RotCountFlatParam,
  RotCountPerGroupParam,
  ValidationWarning,
} from '../../types'
import { createRotCountEntry } from '../../state/factories'
import {
  getTargetWarnings,
  getWarningState,
} from '../../utils/warnings'
import { getCardValidationClass } from '../../utils/validationUi'
import { AddItemButton } from '../shared/AddItemButton'
import { DeleteRowButton } from '../shared/DeleteRowButton'
import { GroupTagsInput } from '../shared/GroupTagsInput'
import { MinMaxInput } from '../shared/MinMaxInput'
import { GroupRotCountRow } from './GroupRotCountRow'

interface RotationParameterRowProps {
  param: RotationParam
  residentGroups: string[]
  warnings: ValidationWarning[]
  onChange: (next: RotationParam) => void
  onDelete: () => void
}

export function RotationParameterRow({
  param,
  residentGroups,
  warnings,
  onChange,
  onDelete,
}: RotationParameterRowProps) {
  const paramWarnings = getTargetWarnings(warnings, { paramId: param.id })
  const paramState = getWarningState(paramWarnings)
  const groupsState = getWarningState(
    getTargetWarnings(paramWarnings, { field: 'groups' }),
  )
  const rangeState = getWarningState(
    getTargetWarnings(paramWarnings, { field: 'range' }),
  )

  return (
    <div className={`rounded-xl border border-[#e1d4be] bg-white/80 p-3 space-y-3 ${getCardValidationClass(paramState)}`}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          {param.kind === 'groups' && (
            <div>
              <span className="field-label">Rotation Groups</span>
              <GroupTagsInput
                tags={(param as GroupsParam).values}
                placeholder="critical, inpatient"
                validationState={groupsState}
                onChange={(values) =>
                  onChange({ ...(param as GroupsParam), values })
                }
              />
            </div>
          )}

          {param.kind === 'coverage' && (
            <MinMaxInput
              variant="addon"
              label="Coverage"
              minValue={(param as CoverageParam).min}
              maxValue={(param as CoverageParam).max}
              validationState={rangeState}
              onMinChange={(min) =>
                onChange({ ...(param as CoverageParam), min })
              }
              onMaxChange={(max) =>
                onChange({ ...(param as CoverageParam), max })
              }
            />
          )}

          {param.kind === 'rot_count_flat' && (
            <MinMaxInput
              variant="addon"
              label="Rotation Count (same for all)"
              minValue={(param as RotCountFlatParam).min}
              maxValue={(param as RotCountFlatParam).max}
              validationState={rangeState}
              onMinChange={(min) =>
                onChange({ ...(param as RotCountFlatParam), min })
              }
              onMaxChange={(max) =>
                onChange({ ...(param as RotCountFlatParam), max })
              }
            />
          )}

          {param.kind === 'rot_count_per_group' && (
            <div className="space-y-3">
              <span className="field-label">Rotation Count (per group)</span>

              {residentGroups.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#cfbf9f] bg-[#fff8eb] px-4 py-4 text-sm text-[#6f6046]">
                  Define at least one resident group before adding per-group rotation counts.
                </div>
              ) : null}

              {(param as RotCountPerGroupParam).entries.map((entry) => (
                <GroupRotCountRow
                  key={entry.id}
                  entry={entry}
                  residentGroups={residentGroups}
                  warnings={paramWarnings}
                  onChange={(nextEntry) =>
                    onChange({
                      ...(param as RotCountPerGroupParam),
                      entries: (param as RotCountPerGroupParam).entries.map((e) =>
                        e.id === nextEntry.id ? nextEntry : e,
                      ),
                    })
                  }
                  onDelete={() =>
                    onChange({
                      ...(param as RotCountPerGroupParam),
                      entries: (param as RotCountPerGroupParam).entries.filter(
                        (e) => e.id !== entry.id,
                      ),
                    })
                  }
                />
              ))}

              <AddItemButton
                onClick={() =>
                  onChange({
                    ...(param as RotCountPerGroupParam),
                    entries: [
                      ...(param as RotCountPerGroupParam).entries,
                      createRotCountEntry(),
                    ],
                  })
                }
                disabled={residentGroups.length === 0}
              >
                Add Group Rule
              </AddItemButton>
            </div>
          )}
        </div>

        <DeleteRowButton size="compact" onClick={onDelete} />
      </div>
    </div>
  )
}
