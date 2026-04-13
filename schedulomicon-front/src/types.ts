export type NumericInput = number | ''
export type ValidationField =
  | 'name'
  | 'groups'
  | 'selector'
  | 'count'
  | 'group'
  | 'range'

export type SectionName =
  | 'blocks'
  | 'rotations'
  | 'residents'
  | 'global'

export interface RotCountEntry {
  id: string
  group: string
  min: NumericInput
  max: NumericInput
}

// ---------------------------------------------------------------------------
// Parameter types
// ---------------------------------------------------------------------------

// Shared (all entity types)
export interface GroupsParam       { id: string; kind: 'groups';               values: string[] }

// Resident-only (repeatable)
export interface SumGtZeroParam    { id: string; kind: 'sum_gt_zero';          selector: string }
export interface SumEqZeroParam    { id: string; kind: 'sum_eq_zero';          selector: string }
export interface SumEqCountParam   { id: string; kind: 'sum_eq_count';         selector: string; count: NumericInput }

// Rotation-only (singletons)
export interface CoverageParam        { id: string; kind: 'coverage';          min: NumericInput; max: NumericInput }
export interface RotCountFlatParam    { id: string; kind: 'rot_count_flat';    min: NumericInput; max: NumericInput }
export interface RotCountPerGroupParam { id: string; kind: 'rot_count_per_group'; entries: RotCountEntry[] }

export type ResidentParam = GroupsParam | SumGtZeroParam | SumEqZeroParam | SumEqCountParam
export type RotationParam = GroupsParam | CoverageParam | RotCountFlatParam | RotCountPerGroupParam
export type BlockParam    = GroupsParam

// ---------------------------------------------------------------------------
// Entity types
// ---------------------------------------------------------------------------

export interface ResidentDef { id: string; name: string; parameters: ResidentParam[] }
export interface RotationDef { id: string; name: string; parameters: RotationParam[] }
export interface BlockDef    { id: string; name: string; parameters: BlockParam[]    }

export interface ScheduleState {
  blocks: BlockDef[]
  rotations: RotationDef[]
  residents: ResidentDef[]
}

export interface ValidationWarning {
  id: string
  section: SectionName
  itemId?: string
  paramId?: string
  entryId?: string
  field?: ValidationField
  message: string
  severity: 'warning' | 'error'
}
