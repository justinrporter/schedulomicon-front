import type { ScheduleState } from '../types'
import { uniqueTrimmedStrings } from './strings'

export interface DerivedGroups {
  residentGroups: string[]
  blockGroups: string[]
  rotationGroups: string[]
}

export function deriveGroups(state: ScheduleState): DerivedGroups {
  return {
    residentGroups: uniqueTrimmedStrings(
      state.residents.flatMap((resident) => resident.groups),
    ),
    blockGroups: uniqueTrimmedStrings(state.blocks.flatMap((block) => block.groups)),
    rotationGroups: uniqueTrimmedStrings(
      state.rotations.flatMap((rotation) => rotation.groups),
    ),
  }
}
