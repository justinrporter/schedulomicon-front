import type {
  BlockDef,
  BlockParam,
  CoverageParam,
  GroupsParam,
  ResidentDef,
  ResidentParam,
  RotationDef,
  RotationParam,
  RotCountEntry,
  RotCountFlatParam,
  RotCountPerGroupParam,
  SumEqCountParam,
  SumEqZeroParam,
  SumGtZeroParam,
} from '../types'
import { createId } from '../utils/nanoid'

// ---------------------------------------------------------------------------
// Entity factories
// ---------------------------------------------------------------------------

export function createBlock(): BlockDef {
  return {
    id: createId(),
    name: '',
    parameters: [],
  }
}

export function createRotation(): RotationDef {
  return {
    id: createId(),
    name: '',
    parameters: [],
  }
}

export function createResident(): ResidentDef {
  return {
    id: createId(),
    name: '',
    parameters: [],
  }
}

// ---------------------------------------------------------------------------
// Shared parameter factories
// ---------------------------------------------------------------------------

export function createGroupsParam(): GroupsParam {
  return { id: createId(), kind: 'groups', values: [] }
}

// ---------------------------------------------------------------------------
// Resident parameter factories
// ---------------------------------------------------------------------------

export function createSumGtZeroParam(): SumGtZeroParam {
  return { id: createId(), kind: 'sum_gt_zero', selector: '' }
}

export function createSumEqZeroParam(): SumEqZeroParam {
  return { id: createId(), kind: 'sum_eq_zero', selector: '' }
}

export function createSumEqCountParam(): SumEqCountParam {
  return { id: createId(), kind: 'sum_eq_count', selector: '', count: '' }
}

// ---------------------------------------------------------------------------
// Rotation parameter factories
// ---------------------------------------------------------------------------

export function createCoverageParam(): CoverageParam {
  return { id: createId(), kind: 'coverage', min: '', max: '' }
}

export function createRotCountFlatParam(): RotCountFlatParam {
  return { id: createId(), kind: 'rot_count_flat', min: '', max: '' }
}

export function createRotCountPerGroupParam(): RotCountPerGroupParam {
  return { id: createId(), kind: 'rot_count_per_group', entries: [] }
}

// ---------------------------------------------------------------------------
// Helper used inside RotCountPerGroupParam
// ---------------------------------------------------------------------------

export function createRotCountEntry(): RotCountEntry {
  return {
    id: createId(),
    group: '',
    min: '',
    max: '',
  }
}

// ---------------------------------------------------------------------------
// Re-export convenience typed add-param helpers
// ---------------------------------------------------------------------------

export function addResidentParam(
  parameters: ResidentParam[],
  param: ResidentParam,
): ResidentParam[] {
  return [...parameters, param]
}

export function addRotationParam(
  parameters: RotationParam[],
  param: RotationParam,
): RotationParam[] {
  return [...parameters, param]
}

export function addBlockParam(
  parameters: BlockParam[],
  param: BlockParam,
): BlockParam[] {
  return [...parameters, param]
}
