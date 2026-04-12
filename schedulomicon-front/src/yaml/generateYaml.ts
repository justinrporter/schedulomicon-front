import yaml from 'js-yaml'

import type { NumericInput, ScheduleState } from '../types'
import { deriveGroups } from '../utils/deriveGroups'
import {
  isCompleteRange,
  isInvalidRange,
  normalizeText,
  uniqueTrimmedStrings,
} from '../utils/strings'

const EMPTY_STATE_COMMENT = '# Fill in the form to generate YAML\n'

interface YamlEntity {
  groups?: string[]
  coverage?: [number, number]
  rot_count?: [number, number] | Record<string, [number, number]>
  prohibit?: string[]
}

function createNameCountMap(items: Array<{ name: string }>) {
  const counts = new Map<string, number>()

  for (const item of items) {
    const name = normalizeText(item.name)

    if (!name) {
      continue
    }

    counts.set(name, (counts.get(name) ?? 0) + 1)
  }

  return counts
}

function withGroups(groups: string[]) {
  const normalizedGroups = uniqueTrimmedStrings(groups)
  return normalizedGroups.length > 0 ? { groups: normalizedGroups } : null
}

function toNumericRange(min: NumericInput, max: NumericInput) {
  if (!isCompleteRange(min, max) || isInvalidRange(min, max)) {
    return null
  }

  return [Number(min), Number(max)] as [number, number]
}

export function generateYaml(state: ScheduleState) {
  if (
    state.blocks.length === 0 &&
    state.rotations.length === 0 &&
    state.residents.length === 0 &&
    state.prohibitions.length === 0
  ) {
    return EMPTY_STATE_COMMENT
  }

  const derivedGroups = deriveGroups(state)
  const residentNameCounts = createNameCountMap(state.residents)
  const rotationNameCounts = createNameCountMap(state.rotations)

  const blocks: Record<string, YamlEntity | null> = {}
  const rotations: Record<string, YamlEntity | null> = {}
  const residents: Record<string, YamlEntity | null> = {}

  for (const block of state.blocks) {
    const name = normalizeText(block.name)

    if (!name) {
      continue
    }

    blocks[name] = withGroups(block.groups)
  }

  for (const rotation of state.rotations) {
    const name = normalizeText(rotation.name)

    if (!name) {
      continue
    }

    const payload: YamlEntity = {}
    const groups = uniqueTrimmedStrings(rotation.groups)
    const coverage = toNumericRange(rotation.coverageMin, rotation.coverageMax)

    if (groups.length > 0) {
      payload.groups = groups
    }

    if (coverage) {
      payload.coverage = coverage
    }

    if (rotation.rotCountMode === 'flat') {
      const range = toNumericRange(rotation.rotCountFlat.min, rotation.rotCountFlat.max)

      if (range) {
        payload.rot_count = range
      }
    }

    if (rotation.rotCountMode === 'per-group') {
      const seenGroups = new Set<string>()
      const perGroup: Record<string, [number, number]> = {}

      for (const entry of rotation.rotCountPerGroup) {
        const group = normalizeText(entry.group)
        const range = toNumericRange(entry.min, entry.max)

        if (
          !group ||
          !range ||
          seenGroups.has(group) ||
          !derivedGroups.residentGroups.includes(group)
        ) {
          continue
        }

        seenGroups.add(group)
        perGroup[group] = range
      }

      if (Object.keys(perGroup).length > 0) {
        payload.rot_count = perGroup
      }
    }

    rotations[name] = Object.keys(payload).length > 0 ? payload : null
  }

  for (const resident of state.residents) {
    const name = normalizeText(resident.name)

    if (!name) {
      continue
    }

    residents[name] = withGroups(resident.groups)
  }

  const prohibitMap = new Map<string, string[]>()

  for (const prohibition of state.prohibitions) {
    const residentName = normalizeText(prohibition.residentName)
    const rotationName = normalizeText(prohibition.rotationName)

    if (!residentName || !rotationName) {
      continue
    }

    if (residentNameCounts.get(residentName) !== 1) {
      continue
    }

    if (rotationNameCounts.get(rotationName) !== 1) {
      continue
    }

    const entries = prohibitMap.get(residentName) ?? []

    if (!entries.includes(rotationName)) {
      entries.push(rotationName)
      prohibitMap.set(residentName, entries)
    }
  }

  for (const [residentName, prohibitionList] of prohibitMap.entries()) {
    const base = residents[residentName] ?? null

    residents[residentName] = {
      ...(base ?? {}),
      prohibit: prohibitionList,
    }
  }

  return yaml.dump(
    {
      blocks,
      rotations,
      residents,
    },
    {
      lineWidth: -1,
      quotingType: "'",
      forceQuotes: false,
      indent: 2,
      styles: { '!!null': 'empty' },
    },
  )
}
