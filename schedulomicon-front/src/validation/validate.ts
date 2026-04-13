import type {
  BlockDef,
  BlockParam,
  CoverageParam,
  ResidentDef,
  ResidentParam,
  RotationDef,
  RotationParam,
  RotCountFlatParam,
  RotCountPerGroupParam,
  ScheduleState,
  SectionName,
  SumEqCountParam,
  SumEqZeroParam,
  SumGtZeroParam,
  ValidationWarning,
} from '../types'
import { findParam } from '../state/paramHelpers'
import { deriveGroups } from '../utils/deriveGroups'
import {
  isInvalidRange,
  isPartialRange,
  normalizeText,
} from '../utils/strings'

function makeWarning(
  section: SectionName,
  severity: ValidationWarning['severity'],
  message: string,
  itemId?: string,
) {
  return {
    id: `${section}:${itemId ?? 'global'}:${severity}:${message}`,
    section,
    itemId,
    message,
    severity,
  } satisfies ValidationWarning
}

function createNameBuckets(items: Array<{ id: string; name: string }>) {
  const buckets = new Map<string, string[]>()

  for (const item of items) {
    const name = normalizeText(item.name)

    if (!name) {
      continue
    }

    const ids = buckets.get(name) ?? []
    ids.push(item.id)
    buckets.set(name, ids)
  }

  return buckets
}

function validateNamedSection<T extends BlockDef | RotationDef | ResidentDef>(
  items: T[],
  section: Extract<SectionName, 'blocks' | 'rotations' | 'residents'>,
  warnings: ValidationWarning[],
) {
  const buckets = createNameBuckets(items)

  for (const item of items) {
    const name = normalizeText(item.name)

    if (!name) {
      warnings.push(
        makeWarning(section, 'error', 'Name is required.', item.id),
      )
      continue
    }

    if ((buckets.get(name)?.length ?? 0) > 1) {
      warnings.push(
        makeWarning(section, 'error', `Duplicate name "${name}" in ${section}.`, item.id),
      )
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton kind check: each of these may appear at most once per entity
// ---------------------------------------------------------------------------

const ROTATION_SINGLETONS: RotationParam['kind'][] = [
  'groups',
  'coverage',
  'rot_count_flat',
  'rot_count_per_group',
]

const BLOCK_SINGLETONS: BlockParam['kind'][] = ['groups']

function validateEntityParameters(
  entity: ResidentDef | RotationDef | BlockDef,
  section: Extract<SectionName, 'residents' | 'rotations' | 'blocks'>,
  warnings: ValidationWarning[],
) {
  const params = entity.parameters as Array<{ kind: string; id?: string }>
  const kindCounts = new Map<string, number>()

  for (const param of params) {
    kindCounts.set(param.kind, (kindCounts.get(param.kind) ?? 0) + 1)
  }

  if (section === 'rotations') {
    for (const kind of ROTATION_SINGLETONS) {
      if ((kindCounts.get(kind) ?? 0) > 1) {
        warnings.push(
          makeWarning(
            section,
            'error',
            `Duplicate parameter "${kind}" on this rotation.`,
            entity.id,
          ),
        )
      }
    }
  }

  if (section === 'blocks') {
    for (const kind of BLOCK_SINGLETONS) {
      if ((kindCounts.get(kind) ?? 0) > 1) {
        warnings.push(
          makeWarning(
            section,
            'error',
            `Duplicate parameter "${kind}" on this block.`,
            entity.id,
          ),
        )
      }
    }
  }

  if (section === 'residents') {
    // groups is a singleton for residents too
    if ((kindCounts.get('groups') ?? 0) > 1) {
      warnings.push(
        makeWarning(
          section,
          'error',
          'Duplicate parameter "groups" on this resident.',
          entity.id,
        ),
      )
    }

    const residentParams = entity.parameters as ResidentParam[]

    for (const param of residentParams) {
      if (param.kind === 'sum_gt_zero') {
        const p = param as SumGtZeroParam
        if (!normalizeText(p.selector)) {
          warnings.push(
            makeWarning(
              section,
              'warning',
              'Selector is blank and will be omitted from YAML.',
              entity.id,
            ),
          )
        }
      }

      if (param.kind === 'sum_eq_zero') {
        const p = param as SumEqZeroParam
        if (!normalizeText(p.selector)) {
          warnings.push(
            makeWarning(
              section,
              'warning',
              'Selector is blank and will be omitted from YAML.',
              entity.id,
            ),
          )
        }
      }

      if (param.kind === 'sum_eq_count') {
        const p = param as SumEqCountParam
        if (!normalizeText(p.selector) || p.count === '' || p.count === undefined) {
          warnings.push(
            makeWarning(
              section,
              'warning',
              'Count row is incomplete and will be omitted from YAML.',
              entity.id,
            ),
          )
        }
      }
    }
  }
}

function validateRotations(state: ScheduleState, warnings: ValidationWarning[]) {
  const { residentGroups } = deriveGroups(state)

  for (const rotation of state.rotations) {
    const coverage = findParam(rotation.parameters, 'coverage') as CoverageParam | undefined
    const rotCountFlat = findParam(rotation.parameters, 'rot_count_flat') as RotCountFlatParam | undefined
    const rotCountPerGroup = findParam(rotation.parameters, 'rot_count_per_group') as RotCountPerGroupParam | undefined

    if (coverage) {
      if (isPartialRange(coverage.min, coverage.max)) {
        warnings.push(
          makeWarning(
            'rotations',
            'warning',
            'Coverage is partially filled and will be omitted from YAML.',
            rotation.id,
          ),
        )
      }

      if (isInvalidRange(coverage.min, coverage.max)) {
        warnings.push(
          makeWarning(
            'rotations',
            'error',
            'Coverage minimum cannot be greater than coverage maximum.',
            rotation.id,
          ),
        )
      }
    }

    if (rotCountFlat) {
      if (isInvalidRange(rotCountFlat.min, rotCountFlat.max)) {
        warnings.push(
          makeWarning(
            'rotations',
            'error',
            'Rotation count minimum cannot be greater than maximum.',
            rotation.id,
          ),
        )
      }
    }

    if (rotCountPerGroup) {
      const groupCounts = new Map<string, number>()

      for (const entry of rotCountPerGroup.entries) {
        const group = normalizeText(entry.group)

        if (group) {
          groupCounts.set(group, (groupCounts.get(group) ?? 0) + 1)
        }

        if (isInvalidRange(entry.min, entry.max)) {
          warnings.push(
            makeWarning(
              'rotations',
              'error',
              `Rotation count for "${group || 'unnamed group'}" has min greater than max.`,
              rotation.id,
            ),
          )
        }

        if (group && !residentGroups.includes(group)) {
          warnings.push(
            makeWarning(
              'rotations',
              'warning',
              `Rotation count references resident group "${group}" that is not currently defined.`,
              rotation.id,
            ),
          )
        }
      }

      for (const [group, count] of groupCounts.entries()) {
        if (count > 1) {
          warnings.push(
            makeWarning(
              'rotations',
              'error',
              `Rotation count repeats resident group "${group}".`,
              rotation.id,
            ),
          )
        }
      }
    }
  }
}

export function validate(state: ScheduleState) {
  const warnings: ValidationWarning[] = []

  validateNamedSection(state.blocks, 'blocks', warnings)
  validateNamedSection(state.rotations, 'rotations', warnings)
  validateNamedSection(state.residents, 'residents', warnings)

  for (const block of state.blocks) {
    validateEntityParameters(block, 'blocks', warnings)
  }
  for (const rotation of state.rotations) {
    validateEntityParameters(rotation, 'rotations', warnings)
  }
  for (const resident of state.residents) {
    validateEntityParameters(resident, 'residents', warnings)
  }

  validateRotations(state, warnings)

  return warnings.sort((left, right) => {
    if (left.severity !== right.severity) {
      return left.severity === 'error' ? -1 : 1
    }

    return left.message.localeCompare(right.message)
  })
}
