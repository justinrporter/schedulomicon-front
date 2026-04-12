import { PlusIcon } from '@heroicons/react/24/solid'
import type { ButtonHTMLAttributes } from 'react'

export function AddItemButton(
  props: ButtonHTMLAttributes<HTMLButtonElement> & { children: string },
) {
  const { children, className = '', type = 'button', ...rest } = props

  return (
    <button type={type} className={`ghost-button ${className}`} {...rest}>
      <PlusIcon className="h-4 w-4" />
      {children}
    </button>
  )
}
