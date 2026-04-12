import { TrashIcon } from '@heroicons/react/24/outline'
import type { ButtonHTMLAttributes } from 'react'

export function DeleteRowButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { className = '', type = 'button', ...rest } = props

  return (
    <button
      type={type}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d8c9af] bg-white text-[#8a5537] transition hover:border-rust hover:text-rust ${className}`}
      {...rest}
    >
      <TrashIcon className="h-5 w-5" />
      <span className="sr-only">Delete row</span>
    </button>
  )
}
