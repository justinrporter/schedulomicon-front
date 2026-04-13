import type { GroupsParam, ScheduleState } from '../types'
import { findParam } from '../state/paramHelpers'
import { uniqueTrimmedStrings } from './strings'

export interface DerivedGroups {
  residentGroups: string[]
  blockGroups: string[]
  rotationGroups: string[]
}

export function deriveGroups(state: ScheduleState): DerivedGroups {
  return {
    residentGroups: uniqueTrimmedStrings(
      state.residents.flatMap((r) =>
        (findParam(r.parameters, 'groups') as GroupsParam | undefined)?.values ?? [],
      ),
    ),
    blockGroups: uniqueTrimmedStrings(
      state.blocks.flatMap((b) =>
        (findParam(b.parameters, 'groups') as GroupsParam | undefined)?.values ?? [],
      ),
    ),
    rotationGroups: uniqueTrimmedStrings(
      state.rotations.flatMap((rot) =>
        (findParam(rot.parameters, 'groups') as GroupsParam | undefined)?.values ?? [],
      ),
    ),
  }
}
