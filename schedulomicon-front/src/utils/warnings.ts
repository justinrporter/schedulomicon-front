import type {
  BlockDef,
  ResidentDef,
  RotationDef,
  ScheduleState,
  SectionName,
  ValidationField,
  ValidationWarning,
} from '../types'
import { normalizeText } from './strings'

export function getSectionWarningCount(
  warnings: ValidationWarning[],
  section: SectionName,
) {
  return warnings.filter((warning) => warning.section === section).length
}

export function getItemWarnings(
  warnings: ValidationWarning[],
  itemId: string | undefined,
) {
  if (!itemId) {
    return []
  }

  return warnings.filter((warning) => warning.itemId === itemId)
}

interface WarningFilter {
  field?: ValidationField
  paramId?: string
  entryId?: string
}

export function getTargetWarnings(
  warnings: ValidationWarning[],
  filter: WarningFilter = {},
) {
  return warnings.filter((warning) => {
    if (filter.field !== undefined && warning.field !== filter.field) {
      return false
    }

    if (filter.paramId !== undefined && warning.paramId !== filter.paramId) {
      return false
    }

    if (filter.entryId !== undefined && warning.entryId !== filter.entryId) {
      return false
    }

    return true
  })
}

export function getWarningState(warnings: ValidationWarning[]) {
  if (warnings.some((warning) => warning.severity === 'error')) {
    return 'error' as const
  }

  if (warnings.some((warning) => warning.severity === 'warning')) {
    return 'warning' as const
  }

  return undefined
}

export function hasErrorWarnings(warnings: ValidationWarning[]) {
  return warnings.some((warning) => warning.severity === 'error')
}

function getEntityForWarning(
  state: ScheduleState,
  warning: ValidationWarning,
): BlockDef | RotationDef | ResidentDef | undefined {
  if (!warning.itemId) {
    return undefined
  }

  switch (warning.section) {
    case 'blocks':
      return state.blocks.find((block) => block.id === warning.itemId)
    case 'rotations':
      return state.rotations.find((rotation) => rotation.id === warning.itemId)
    case 'residents':
      return state.residents.find((resident) => resident.id === warning.itemId)
    default:
      return undefined
  }
}

export function formatWarningContext(
  state: ScheduleState,
  warning: ValidationWarning,
) {
  const sectionLabel = {
    blocks: 'Blocks',
    rotations: 'Rotations',
    residents: 'Residents',
    global: 'Validation',
  }[warning.section]

  const entity = getEntityForWarning(state, warning)

  if (!entity) {
    return sectionLabel
  }

  const entityName = normalizeText(entity.name)

  if (entityName) {
    return `${sectionLabel} · ${entityName}`
  }

  const untitledLabel = {
    blocks: 'Untitled block',
    rotations: 'Untitled rotation',
    residents: 'Untitled resident',
    global: 'Validation',
  }[warning.section]

  return `${sectionLabel} · ${untitledLabel}`
}
