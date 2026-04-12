export type NumericInput = number | ''

export type SectionName =
  | 'blocks'
  | 'rotations'
  | 'residents'
  | 'constraints'
  | 'global'

export interface BlockDef {
  id: string
  name: string
  groups: string[]
}

export interface RotCountEntry {
  id: string
  group: string
  min: NumericInput
  max: NumericInput
}

export interface RotationDef {
  id: string
  name: string
  coverageMin: NumericInput
  coverageMax: NumericInput
  groups: string[]
  rotCountMode: 'none' | 'flat' | 'per-group'
  rotCountFlat: { min: NumericInput; max: NumericInput }
  rotCountPerGroup: RotCountEntry[]
}

export interface ResidentDef {
  id: string
  name: string
  groups: string[]
}

export interface ProhibitDef {
  id: string
  residentName: string
  rotationName: string
}

export interface ScheduleState {
  blocks: BlockDef[]
  rotations: RotationDef[]
  residents: ResidentDef[]
  prohibitions: ProhibitDef[]
}

export interface ValidationWarning {
  id: string
  section: SectionName
  itemId?: string
  message: string
  severity: 'warning' | 'error'
}
