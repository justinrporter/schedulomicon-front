import type { ValidationWarning } from '../types'

export type ValidationState = ValidationWarning['severity'] | undefined

export function getInputValidationClass(validationState?: ValidationState) {
  if (validationState === 'error') {
    return 'validation-input-error'
  }

  if (validationState === 'warning') {
    return 'validation-input-warning'
  }

  return ''
}

export function getCardValidationClass(validationState?: ValidationState) {
  if (validationState === 'error') {
    return 'validation-card-error'
  }

  if (validationState === 'warning') {
    return 'validation-card-warning'
  }

  return ''
}

export function getAriaInvalid(validationState?: ValidationState) {
  return validationState === 'error' ? true : undefined
}
