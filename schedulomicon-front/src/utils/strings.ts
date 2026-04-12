import type { NumericInput } from '../types'

export function normalizeText(value: string) {
  return value.trim()
}

export function uniqueTrimmedStrings(values: string[]) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const value of values) {
    const normalized = normalizeText(value)

    if (!normalized || seen.has(normalized)) {
      continue
    }

    seen.add(normalized)
    result.push(normalized)
  }

  return result
}

export function parseNumericInput(value: string): NumericInput {
  const normalized = value.trim()

  if (!normalized) {
    return ''
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : ''
}

export function isCompleteRange(min: NumericInput, max: NumericInput) {
  return min !== '' && max !== ''
}

export function isPartialRange(min: NumericInput, max: NumericInput) {
  return (min === '' && max !== '') || (min !== '' && max === '')
}

export function isInvalidRange(min: NumericInput, max: NumericInput) {
  return isCompleteRange(min, max) && Number(min) > Number(max)
}

export function hasMeaningfulSelection(...values: string[]) {
  return values.some((value) => normalizeText(value).length > 0)
}
