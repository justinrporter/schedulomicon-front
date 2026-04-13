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
    <header className="sticky top-0 z-30 border-b border-[#e2d1b5] bg-[#f8f0e3]/95 text-ink shadow-[0_14px_32px_rgba(23,52,66,0.1)] backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-3 md:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#8f5620]">
            YAML Schedule Builder
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-ink md:text-3xl">
            Schedulomicon
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-[#51493c] md:text-[0.95rem]">
            Build blocks, rotations, and residents in a form, then download
            solver-ready YAML.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d7c4a6] bg-white/80 px-3.5 py-1.5 text-[0.8125rem] font-semibold text-ink transition hover:border-[#a6642a] hover:text-[#8f5620]"
            onClick={onReset}
          >
            <ArrowPathIcon className="h-5 w-5" />
            Reset
          </button>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#a6642a] px-3.5 py-1.5 text-[0.8125rem] font-semibold text-white transition hover:bg-[#8f5620]"
            onClick={onDownload}
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Download YAML
            {warningCount > 0 ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] ${
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
