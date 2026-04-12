import type { BlockDef, ProhibitDef, ResidentDef, RotCountEntry, RotationDef } from '../types'
import { createId } from '../utils/nanoid'

export function createBlock(): BlockDef {
  return {
    id: createId(),
    name: '',
    groups: [],
  }
}

export function createRotCountEntry(): RotCountEntry {
  return {
    id: createId(),
    group: '',
    min: '',
    max: '',
  }
}

export function createRotation(): RotationDef {
  return {
    id: createId(),
    name: '',
    coverageMin: '',
    coverageMax: '',
    groups: [],
    rotCountMode: 'none',
    rotCountFlat: { min: '', max: '' },
    rotCountPerGroup: [],
  }
}

export function createResident(): ResidentDef {
  return {
    id: createId(),
    name: '',
    groups: [],
  }
}

export function createProhibition(): ProhibitDef {
  return {
    id: createId(),
    residentName: '',
    rotationName: '',
  }
}
