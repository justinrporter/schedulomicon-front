import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/solid'

import type { ValidationWarning } from '../../types'

interface WarningIconProps {
  warning: ValidationWarning
  className?: string
}

export function WarningIcon({ warning, className = 'h-5 w-5' }: WarningIconProps) {
  const Icon =
    warning.severity === 'error' ? ExclamationCircleIcon : ExclamationTriangleIcon
  const color =
    warning.severity === 'error' ? 'text-rust' : 'text-[#b87a1a]'

  return (
    <Icon
      className={`${className} ${color}`}
      title={warning.message}
      aria-label={warning.message}
    />
  )
}
