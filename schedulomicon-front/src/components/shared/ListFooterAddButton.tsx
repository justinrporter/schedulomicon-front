import { PlusIcon } from '@heroicons/react/24/solid'
import type { ButtonHTMLAttributes } from 'react'

interface ListFooterAddButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tooltip: string
}

export function ListFooterAddButton(props: ListFooterAddButtonProps) {
  const { className = '', tooltip, type = 'button', ...rest } = props

  return (
    <div className="group relative mx-auto w-fit">
      <span aria-hidden="true" className="footer-add-tooltip">
        {tooltip}
      </span>

      <button
        type={type}
        title={tooltip}
        aria-label={tooltip}
        className={`footer-add-button ${className}`}
        {...rest}
      >
        <PlusIcon className="h-4 w-4" />
        <span className="sr-only">{tooltip}</span>
      </button>
    </div>
  )
}
