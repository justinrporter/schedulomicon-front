import type {
  BlockDef,
  ProhibitDef,
  ResidentDef,
  RotationDef,
  ScheduleState,
  SectionName,
  ValidationWarning,
} from '../types'
import { deriveGroups } from '../utils/deriveGroups'
import {
  hasMeaningfulSelection,
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

function validateRotations(state: ScheduleState, warnings: ValidationWarning[]) {
  const { residentGroups } = deriveGroups(state)

  for (const rotation of state.rotations) {
    if (isPartialRange(rotation.coverageMin, rotation.coverageMax)) {
      warnings.push(
        makeWarning(
          'rotations',
          'warning',
          'Coverage is partially filled and will be omitted from YAML.',
          rotation.id,
        ),
      )
    }

    if (isInvalidRange(rotation.coverageMin, rotation.coverageMax)) {
      warnings.push(
        makeWarning(
          'rotations',
          'error',
          'Coverage minimum cannot be greater than coverage maximum.',
          rotation.id,
        ),
      )
    }

    if (
      rotation.rotCountMode === 'flat' &&
      isInvalidRange(rotation.rotCountFlat.min, rotation.rotCountFlat.max)
    ) {
      warnings.push(
        makeWarning(
          'rotations',
          'error',
          'Rotation count minimum cannot be greater than maximum.',
          rotation.id,
        ),
      )
    }

    if (rotation.rotCountMode !== 'per-group') {
      continue
    }

    const groupCounts = new Map<string, number>()

    for (const entry of rotation.rotCountPerGroup) {
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

function validateProhibitions(
  residents: ResidentDef[],
  rotations: RotationDef[],
  prohibitions: ProhibitDef[],
  warnings: ValidationWarning[],
) {
  const residentBuckets = createNameBuckets(residents)
  const rotationBuckets = createNameBuckets(rotations)
  const seenPairs = new Set<string>()

  for (const prohibition of prohibitions) {
    const residentName = normalizeText(prohibition.residentName)
    const rotationName = normalizeText(prohibition.rotationName)

    if (!hasMeaningfulSelection(residentName, rotationName)) {
      continue
    }

    if (residentName) {
      const matches = residentBuckets.get(residentName)?.length ?? 0

      if (matches === 0) {
        warnings.push(
          makeWarning(
            'constraints',
            'error',
            `Prohibition references deleted resident "${residentName}".`,
            prohibition.id,
          ),
        )
      } else if (matches > 1) {
        warnings.push(
          makeWarning(
            'constraints',
            'error',
            `Prohibition references duplicate resident name "${residentName}".`,
            prohibition.id,
          ),
        )
      }
    }

    if (rotationName) {
      const matches = rotationBuckets.get(rotationName)?.length ?? 0

      if (matches === 0) {
        warnings.push(
          makeWarning(
            'constraints',
            'error',
            `Prohibition references deleted rotation "${rotationName}".`,
            prohibition.id,
          ),
        )
      } else if (matches > 1) {
        warnings.push(
          makeWarning(
            'constraints',
            'error',
            `Prohibition references duplicate rotation name "${rotationName}".`,
            prohibition.id,
          ),
        )
      }
    }

    if (!residentName || !rotationName) {
      continue
    }

    const pairKey = `${residentName}::${rotationName}`

    if (seenPairs.has(pairKey)) {
      warnings.push(
        makeWarning(
          'constraints',
          'warning',
          `Duplicate prohibition for "${residentName}" and "${rotationName}".`,
          prohibition.id,
        ),
      )
      continue
    }

    seenPairs.add(pairKey)
  }
}

export function validate(state: ScheduleState) {
  const warnings: ValidationWarning[] = []

  validateNamedSection(state.blocks, 'blocks', warnings)
  validateNamedSection(state.rotations, 'rotations', warnings)
  validateNamedSection(state.residents, 'residents', warnings)
  validateRotations(state, warnings)
  validateProhibitions(state.residents, state.rotations, state.prohibitions, warnings)

  return warnings.sort((left, right) => {
    if (left.severity !== right.severity) {
      return left.severity === 'error' ? -1 : 1
    }

    return left.message.localeCompare(right.message)
  })
}
