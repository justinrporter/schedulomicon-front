import yaml from 'js-yaml'

import type {
  CoverageParam,
  GroupsParam,
  NumericInput,
  RotationParam,
  RotCountFlatParam,
  RotCountPerGroupParam,
  ResidentParam,
  ScheduleState,
  SumEqCountParam,
  SumEqZeroParam,
  SumGtZeroParam,
} from '../types'
import { findParam } from '../state/paramHelpers'
import { deriveGroups } from '../utils/deriveGroups'
import {
  isCompleteRange,
  isInvalidRange,
  normalizeText,
  uniqueTrimmedStrings,
} from '../utils/strings'

const EMPTY_STATE_COMMENT = '# Fill in the form to generate YAML\n'

// We use Record<string, unknown> so js-yaml can handle keys like "sum > 0"
type YamlEntity = Record<string, unknown>

function withGroups(groupsParam: GroupsParam | undefined): { groups: string[] } | null {
  if (!groupsParam) return null
  const normalizedGroups = uniqueTrimmedStrings(groupsParam.values)
  return normalizedGroups.length > 0 ? { groups: normalizedGroups } : null
}

function toNumericRange(min: NumericInput, max: NumericInput) {
  if (!isCompleteRange(min, max) || isInvalidRange(min, max)) {
    return null
  }

  return [Number(min), Number(max)] as [number, number]
}

function buildRotationPayload(
  params: RotationParam[],
  derivedResidentGroups: string[],
): YamlEntity {
  const payload: YamlEntity = {}

  const groupsParam = findParam(params, 'groups') as GroupsParam | undefined
  const g = withGroups(groupsParam)
  if (g) payload.groups = g.groups

  const coverage = findParam(params, 'coverage') as CoverageParam | undefined
  if (coverage) {
    const range = toNumericRange(coverage.min, coverage.max)
    if (range) payload.coverage = range
  }

  const rotFlat = findParam(params, 'rot_count_flat') as RotCountFlatParam | undefined
  if (rotFlat) {
    const range = toNumericRange(rotFlat.min, rotFlat.max)
    if (range) payload.rot_count = range
  }

  const rotPerGroup = findParam(params, 'rot_count_per_group') as RotCountPerGroupParam | undefined
  if (rotPerGroup) {
    const seenGroups = new Set<string>()
    const perGroup: Record<string, [number, number]> = {}

    for (const entry of rotPerGroup.entries) {
      const group = normalizeText(entry.group)
      const range = toNumericRange(entry.min, entry.max)

      if (
        !group ||
        !range ||
        seenGroups.has(group) ||
        !derivedResidentGroups.includes(group)
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

  return payload
}

function buildResidentPayload(params: ResidentParam[]): YamlEntity {
  const payload: YamlEntity = {}

  const groupsParam = findParam(params, 'groups') as GroupsParam | undefined
  const g = withGroups(groupsParam)
  if (g) payload.groups = g.groups

  // Collect sum > 0 selectors
  const sumGtZeroSelectors = (params.filter((p) => p.kind === 'sum_gt_zero') as SumGtZeroParam[])
    .map((p) => normalizeText(p.selector))
    .filter(Boolean) as string[]
  if (sumGtZeroSelectors.length > 0) {
    payload['sum > 0'] = sumGtZeroSelectors
  }

  // Collect sum == 0 selectors
  const sumEqZeroSelectors = (params.filter((p) => p.kind === 'sum_eq_zero') as SumEqZeroParam[])
    .map((p) => normalizeText(p.selector))
    .filter(Boolean) as string[]
  if (sumEqZeroSelectors.length > 0) {
    payload['sum == 0'] = sumEqZeroSelectors
  }

  // Collect sum == N: group by count value
  const sumEqCountRows = params.filter((p) => p.kind === 'sum_eq_count') as SumEqCountParam[]
  const countBuckets = new Map<number, string[]>()

  for (const row of sumEqCountRows) {
    const selector = normalizeText(row.selector)
    if (!selector) continue
    if (row.count === '' || row.count === undefined) continue
    const n = Number(row.count)
    const bucket = countBuckets.get(n) ?? []
    bucket.push(selector)
    countBuckets.set(n, bucket)
  }

  for (const [n, selectors] of countBuckets.entries()) {
    payload[`sum == ${n}`] = selectors
  }

  return payload
}

export function generateYaml(state: ScheduleState) {
  if (
    state.blocks.length === 0 &&
    state.rotations.length === 0 &&
    state.residents.length === 0
  ) {
    return EMPTY_STATE_COMMENT
  }

  const derivedGroups = deriveGroups(state)

  const blocks: Record<string, YamlEntity | null> = {}
  const rotations: Record<string, YamlEntity | null> = {}
  const residents: Record<string, YamlEntity | null> = {}

  for (const block of state.blocks) {
    const name = normalizeText(block.name)
    if (!name) continue

    const groupsParam = findParam(block.parameters, 'groups') as GroupsParam | undefined
    const g = withGroups(groupsParam)
    blocks[name] = g ?? null
  }

  for (const rotation of state.rotations) {
    const name = normalizeText(rotation.name)
    if (!name) continue

    const payload = buildRotationPayload(rotation.parameters, derivedGroups.residentGroups)
    rotations[name] = Object.keys(payload).length > 0 ? payload : null
  }

  for (const resident of state.residents) {
    const name = normalizeText(resident.name)
    if (!name) continue

    const payload = buildResidentPayload(resident.parameters)
    residents[name] = Object.keys(payload).length > 0 ? payload : null
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
      flowLevel: 3,
      styles: { '!!null': 'empty' },
    },
  )
}
