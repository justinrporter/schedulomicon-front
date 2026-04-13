import type {
  GroupsParam,
  ResidentParam,
  SumEqCountParam,
  SumEqZeroParam,
  SumGtZeroParam,
} from '../../types'
import { DeleteRowButton } from '../shared/DeleteRowButton'
import { GroupTagsInput } from '../shared/GroupTagsInput'

const DOCS_URL =
  'https://github.com/justinrporter/schedulomicon/blob/main/docs/source/constraints.rst'

interface ResidentParameterRowProps {
  param: ResidentParam
  onChange: (next: ResidentParam) => void
  onDelete: () => void
}

export function ResidentParameterRow({
  param,
  onChange,
  onDelete,
}: ResidentParameterRowProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#e1d4be] bg-white/80 p-3">
      <div className="min-w-0 flex-1">
        {param.kind === 'groups' && (
          <div>
            <span className="field-label">Resident Groups</span>
            <GroupTagsInput
              tags={(param as GroupsParam).values}
              placeholder="sr, jr, night-float"
              onChange={(values) =>
                onChange({ ...(param as GroupsParam), values })
              }
            />
          </div>
        )}

        {(param.kind === 'sum_gt_zero' || param.kind === 'sum_eq_zero') && (
          <label className="block">
            <span className="field-label">
              {param.kind === 'sum_gt_zero' ? 'True somewhere' : 'Never true'} — Selector
              {' '}
              <a
                href={DOCS_URL}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-brass underline hover:text-ink"
              >
                docs
              </a>
            </span>
            <input
              type="text"
              className="input-field"
              value={(param as SumGtZeroParam | SumEqZeroParam).selector}
              placeholder="rotation_name or group"
              onChange={(event) =>
                onChange({ ...param, selector: event.target.value } as ResidentParam)
              }
            />
          </label>
        )}

        {param.kind === 'sum_eq_count' && (
          <div className="space-y-2">
            <label className="block">
              <span className="field-label">
                Count — Selector
                {' '}
                <a
                  href={DOCS_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brass underline hover:text-ink"
                >
                  docs
                </a>
              </span>
              <input
                type="text"
                className="input-field"
                value={(param as SumEqCountParam).selector}
                placeholder="rotation_name or group"
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
                className="input-field"
                value={(param as SumEqCountParam).count}
                min={0}
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
