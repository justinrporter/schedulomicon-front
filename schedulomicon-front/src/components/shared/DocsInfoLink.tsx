import { InformationCircleIcon } from '@heroicons/react/24/outline'

interface DocsInfoLinkProps {
  href: string
  label: string
  className?: string
}

export function DocsInfoLink({
  href,
  label,
  className = '',
}: DocsInfoLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[#8f5620] transition hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#173442] focus-visible:ring-opacity-20 ${className}`}
      aria-label={label}
    >
      <InformationCircleIcon className="h-4 w-4" />
      <span className="sr-only">{label}</span>
    </a>
  )
}
