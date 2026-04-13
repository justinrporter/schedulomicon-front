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
  ValidationField,
  ValidationWarning,
} from '../types'
import { findParam } from '../state/paramHelpers'
import { deriveGroups } from '../utils/deriveGroups'
import {
  isInvalidRange,
  isPartialRange,
  normalizeText,
  uniqueTrimmedStrings,
} from '../utils/strings'

interface WarningTarget {
  itemId?: string
  paramId?: string
  entryId?: string
  field?: ValidationField
}

function makeWarning(
  section: SectionName,
  severity: ValidationWarning['severity'],
  message: string,
  target: WarningTarget = {},
) {
  return {
    id: [
      section,
      target.itemId ?? 'global',
      target.paramId ?? 'param',
      target.entryId ?? 'entry',
      target.field ?? 'field',
      severity,
      message,
    ].join(':'),
    section,
    ...target,
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

function hasMeaningfulBlockParam(param: BlockParam) {
  return param.kind === 'groups' && uniqueTrimmedStrings(param.values).length > 0
}

function hasMeaningfulResidentParam(param: ResidentParam) {
  switch (param.kind) {
    case 'groups':
      return uniqueTrimmedStrings(param.values).length > 0
    case 'sum_gt_zero':
    case 'sum_eq_zero':
      return normalizeText(param.selector).length > 0
    case 'sum_eq_count':
      return normalizeText(param.selector).length > 0 || param.count !== ''
  }
}

function hasMeaningfulRotationParam(param: RotationParam) {
  switch (param.kind) {
    case 'groups':
      return uniqueTrimmedStrings(param.values).length > 0
    case 'coverage':
    case 'rot_count_flat':
      return param.min !== '' || param.max !== ''
    case 'rot_count_per_group':
      return param.entries.some(
        (entry) =>
          normalizeText(entry.group).length > 0 ||
          entry.min !== '' ||
          entry.max !== '',
      )
  }
}

function isUntouchedEntity(entity: BlockDef | RotationDef | ResidentDef) {
  if (normalizeText(entity.name)) {
    return false
  }

  if ('parameters' in entity === false) {
    return true
  }

  if ('kind' in (entity.parameters[0] ?? {})) {
    return entity.parameters.every((param) => {
      if ('values' in param && !('selector' in param) && !('min' in param)) {
        return !hasMeaningfulBlockParam(param as BlockParam)
      }

      if ('selector' in param || param.kind === 'groups') {
        return !hasMeaningfulResidentParam(param as ResidentParam)
      }

      return !hasMeaningfulRotationParam(param as RotationParam)
    })
  }

  return true
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
      if (isUntouchedEntity(item)) {
        continue
      }

      warnings.push(
        makeWarning(section, 'error', 'Name is required.', {
          itemId: item.id,
          field: 'name',
        }),
      )
      continue
    }

    if ((buckets.get(name)?.length ?? 0) > 1) {
      warnings.push(
        makeWarning(section, 'error', `Duplicate name "${name}" in ${section}.`, {
          itemId: item.id,
          field: 'name',
        }),
      )
    }
  }
}

const ROTATION_SINGLETONS: RotationParam['kind'][] = [
  'groups',
  'coverage',
  'rot_count_flat',
  'rot_count_per_group',
]

const BLOCK_SINGLETONS: BlockParam['kind'][] = ['groups']
const RESIDENT_SINGLETONS: ResidentParam['kind'][] = ['groups']

function validateSingletonParams(
  entity: ResidentDef | RotationDef | BlockDef,
  section: Extract<SectionName, 'residents' | 'rotations' | 'blocks'>,
  singletons: string[],
  entityLabel: string,
  warnings: ValidationWarning[],
) {
  const kindToParamIds = new Map<string, string[]>()

  for (const param of entity.parameters as Array<{ kind: string; id: string }>) {
    const ids = kindToParamIds.get(param.kind) ?? []
    ids.push(param.id)
    kindToParamIds.set(param.kind, ids)
  }

  for (const kind of singletons) {
    const paramIds = kindToParamIds.get(kind) ?? []

    if (paramIds.length <= 1) {
      continue
    }

    for (const paramId of paramIds) {
      warnings.push(
        makeWarning(
          section,
          'error',
          `Duplicate parameter "${kind}" on this ${entityLabel}.`,
          {
            itemId: entity.id,
            paramId,
          },
        ),
      )
    }
  }
}

function validateEntityParameters(
  entity: ResidentDef | RotationDef | BlockDef,
  section: Extract<SectionName, 'residents' | 'rotations' | 'blocks'>,
  warnings: ValidationWarning[],
) {
  if (isUntouchedEntity(entity)) {
    return
  }

  if (section === 'rotations') {
    validateSingletonParams(entity, section, ROTATION_SINGLETONS, 'rotation', warnings)
    return
  }

  if (section === 'blocks') {
    validateSingletonParams(entity, section, BLOCK_SINGLETONS, 'block', warnings)
    return
  }

  validateSingletonParams(entity, section, RESIDENT_SINGLETONS, 'resident', warnings)

  for (const param of entity.parameters as ResidentParam[]) {
    if (param.kind === 'sum_gt_zero') {
      const p = param as SumGtZeroParam
      if (!normalizeText(p.selector)) {
        warnings.push(
          makeWarning(
            section,
            'warning',
            'Selector is blank and will be omitted from YAML.',
            {
              itemId: entity.id,
              paramId: p.id,
              field: 'selector',
            },
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
            {
              itemId: entity.id,
              paramId: p.id,
              field: 'selector',
            },
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
            {
              itemId: entity.id,
              paramId: p.id,
              field: normalizeText(p.selector) ? 'count' : 'selector',
            },
          ),
        )
      }
    }
  }
}

function validateRotations(state: ScheduleState, warnings: ValidationWarning[]) {
  const { residentGroups } = deriveGroups(state)

  for (const rotation of state.rotations) {
    if (isUntouchedEntity(rotation)) {
      continue
    }

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
            {
              itemId: rotation.id,
              paramId: coverage.id,
              field: 'range',
            },
          ),
        )
      }

      if (isInvalidRange(coverage.min, coverage.max)) {
        warnings.push(
          makeWarning(
            'rotations',
            'error',
            'Coverage minimum cannot be greater than coverage maximum.',
            {
              itemId: rotation.id,
              paramId: coverage.id,
              field: 'range',
            },
          ),
        )
      }
    }

    if (rotCountFlat && isInvalidRange(rotCountFlat.min, rotCountFlat.max)) {
      warnings.push(
        makeWarning(
          'rotations',
          'error',
          'Rotation count minimum cannot be greater than maximum.',
          {
            itemId: rotation.id,
            paramId: rotCountFlat.id,
            field: 'range',
          },
        ),
      )
    }

    if (!rotCountPerGroup) {
      continue
    }

    const groupToEntryIds = new Map<string, string[]>()

    for (const entry of rotCountPerGroup.entries) {
      const group = normalizeText(entry.group)

      if (group) {
        const ids = groupToEntryIds.get(group) ?? []
        ids.push(entry.id)
        groupToEntryIds.set(group, ids)
      }

      if (isInvalidRange(entry.min, entry.max)) {
        warnings.push(
          makeWarning(
            'rotations',
            'error',
            `Rotation count for "${group || 'unnamed group'}" has min greater than max.`,
            {
              itemId: rotation.id,
              paramId: rotCountPerGroup.id,
              entryId: entry.id,
              field: 'range',
            },
          ),
        )
      }

      if (group && !residentGroups.includes(group)) {
        warnings.push(
          makeWarning(
            'rotations',
            'warning',
            `Rotation count references resident group "${group}" that is not currently defined.`,
            {
              itemId: rotation.id,
              paramId: rotCountPerGroup.id,
              entryId: entry.id,
              field: 'group',
            },
          ),
        )
      }
    }

    for (const [group, entryIds] of groupToEntryIds.entries()) {
      if (entryIds.length <= 1) {
        continue
      }

      for (const entryId of entryIds) {
        warnings.push(
          makeWarning(
            'rotations',
            'error',
            `Rotation count repeats resident group "${group}".`,
            {
              itemId: rotation.id,
              paramId: rotCountPerGroup.id,
              entryId,
              field: 'group',
            },
          ),
        )
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
