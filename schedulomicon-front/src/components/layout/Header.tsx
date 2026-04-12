import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

interface HeaderProps {
  warningCount: number
  hasErrors: boolean
  onDownload: () => void
  onReset: () => void
}

export function Header({
  warningCount,
  hasErrors,
  onDownload,
  onReset,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/50 bg-[#173442]/94 text-white shadow-lg backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-4 md:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#d9c7ab]">
            YAML Schedule Builder
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">
            Schedulomicon
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#e7ddd0] md:text-base">
            Build blocks, rotations, residents, and prohibitions in a form, then
            download solver-ready YAML.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="ghost-button border-white/25 bg-white/10 text-white hover:border-[#d9c7ab] hover:text-[#f5e8d3]" onClick={onReset}>
            <ArrowPathIcon className="h-5 w-5" />
            Reset
          </button>

          <button type="button" className="primary-button bg-[#d2a16d] text-[#173442] hover:bg-[#e0b181]" onClick={onDownload}>
            <ArrowDownTrayIcon className="h-5 w-5" />
            Download YAML
            {warningCount > 0 ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
                  hasErrors
                    ? 'bg-[#f7d4ca] text-rust'
                    : 'bg-[#fff0d6] text-[#9a6419]'
                }`}
              >
                <ExclamationTriangleIcon className="h-4 w-4" />
                {warningCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  )
}
