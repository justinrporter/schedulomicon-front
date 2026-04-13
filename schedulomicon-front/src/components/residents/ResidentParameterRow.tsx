import type {
  GroupsParam,
  ResidentParam,
  SumEqCountParam,
  SumEqZeroParam,
  SumGtZeroParam,
  ValidationWarning,
} from '../../types'
import {
  getTargetWarnings,
  getWarningState,
} from '../../utils/warnings'
import {
  getAriaInvalid,
  getCardValidationClass,
  getInputValidationClass,
} from '../../utils/validationUi'
import { DeleteRowButton } from '../shared/DeleteRowButton'
import { DocsInfoLink } from '../shared/DocsInfoLink'
import { GroupTagsInput } from '../shared/GroupTagsInput'

const DOCS_URL =
  'https://schedulomicon.readthedocs.io/en/latest/constraints.html'

interface ResidentParameterRowProps {
  param: ResidentParam
  warnings: ValidationWarning[]
  onChange: (next: ResidentParam) => void
  onDelete: () => void
}

export function ResidentParameterRow({
  param,
  warnings,
  onChange,
  onDelete,
}: ResidentParameterRowProps) {
  const paramWarnings = getTargetWarnings(warnings, { paramId: param.id })
  const paramState = getWarningState(paramWarnings)
  const selectorState = getWarningState(
    getTargetWarnings(paramWarnings, { field: 'selector' }),
  )
  const countState = getWarningState(
    getTargetWarnings(paramWarnings, { field: 'count' }),
  )
  const groupsState = getWarningState(
    getTargetWarnings(paramWarnings, { field: 'groups' }),
  )

  return (
    <div className={`flex items-start gap-3 rounded-xl border border-[#e1d4be] bg-white/80 p-3 ${getCardValidationClass(paramState)}`}>
      <div className="min-w-0 flex-1">
        {param.kind === 'groups' && (
          <div>
            <span className="field-label">Resident Groups</span>
            <GroupTagsInput
              tags={(param as GroupsParam).values}
              placeholder="sr, jr, night-float"
              validationState={groupsState}
              onChange={(values) =>
                onChange({ ...(param as GroupsParam), values })
              }
            />
          </div>
        )}

        {(param.kind === 'sum_gt_zero' || param.kind === 'sum_eq_zero') && (
          <label className="block">
            <span className="field-label inline-flex items-center gap-1.5">
              {param.kind === 'sum_gt_zero' ? 'True somewhere' : 'Never true'} — Selector
              <DocsInfoLink
                href={DOCS_URL}
                label={`Open ${param.kind === 'sum_gt_zero' ? 'true somewhere' : 'never true'} constraint documentation`}
              />
            </span>
            <input
              type="text"
              className={`input-field ${getInputValidationClass(selectorState)}`}
              value={(param as SumGtZeroParam | SumEqZeroParam).selector}
              placeholder="rotation_name or group"
              aria-invalid={getAriaInvalid(selectorState)}
              onChange={(event) =>
                onChange({ ...param, selector: event.target.value } as ResidentParam)
              }
            />
          </label>
        )}

        {param.kind === 'sum_eq_count' && (
          <div className="space-y-2">
            <label className="block">
              <span className="field-label inline-flex items-center gap-1.5">
                Count — Selector
                <DocsInfoLink
                  href={DOCS_URL}
                  label="Open count constraint documentation"
                />
              </span>
              <input
                type="text"
                className={`input-field ${getInputValidationClass(selectorState)}`}
                value={(param as SumEqCountParam).selector}
                placeholder="rotation_name or group"
                aria-invalid={getAriaInvalid(selectorState)}
                onChange={(event) =>
                  onChange({
                    ...(param as SumEqCountParam),
                    selector: event.target.value,
                  })
                }
              />
            </label>
            <label className="block">
              <span className="field-label">Count (N)</span>
              <input
                type="number"
                className={`input-field ${getInputValidationClass(countState)}`}
                value={(param as SumEqCountParam).count}
                min={0}
                aria-invalid={getAriaInvalid(countState)}
                onChange={(event) =>
                  onChange({
                    ...(param as SumEqCountParam),
                    count:
                      event.target.value === ''
                        ? ''
                        : Number(event.target.value),
                  })
                }
              />
            </label>
          </div>
        )}
      </div>

      <DeleteRowButton size="compact" onClick={onDelete} />
    </div>
  )
}
