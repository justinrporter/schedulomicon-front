import { TrashIcon } from '@heroicons/react/24/outline'
import type { ButtonHTMLAttributes } from 'react'

interface DeleteRowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'default' | 'compact'
}

export function DeleteRowButton(props: DeleteRowButtonProps) {
  const { className = '', size = 'default', type = 'button', ...rest } = props
  const buttonSize = size === 'compact' ? 'h-9 w-9' : 'h-10 w-10'
  const iconSize = size === 'compact' ? 'h-4 w-4' : 'h-5 w-5'

  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center rounded-full border border-[#d8c9af] bg-white text-[#8a5537] transition hover:border-rust hover:text-rust ${buttonSize} ${className}`}
      {...rest}
    >
      <TrashIcon className={iconSize} />
      <span className="sr-only">Delete row</span>
    </button>
  )
}
