import type { SectionName, ValidationWarning } from '../types'

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

export function hasErrorWarnings(warnings: ValidationWarning[]) {
  return warnings.some((warning) => warning.severity === 'error')
}
