import {
  ClipboardDocumentIcon,
  CodeBracketIcon,
  EyeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useState } from 'react'

interface YamlPreviewPanelProps {
  displayValue: string
  copyValue: string
  issueCount: number
}

export function YamlPreviewPanel({
  displayValue,
  copyValue,
  issueCount,
}: YamlPreviewPanelProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(copyValue)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  const previewBody = (
    <div className="panel-shell overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-[#e6d9c1] px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-[#ede2ca] p-2 text-[#7c653d]">
            <CodeBracketIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-semibold">YAML Preview</h2>
            <p className="mt-1 text-sm text-[#75674d]">
              {issueCount > 0
                ? `${issueCount} issue${issueCount === 1 ? '' : 's'} currently flagged`
                : 'Live output updates as you edit the form'}
            </p>
          </div>
        </div>

        <button type="button" className="ghost-button" onClick={handleCopy}>
          <ClipboardDocumentIcon className="h-5 w-5" />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="max-h-[calc(100vh-14rem)] overflow-auto bg-[#142a36] px-5 py-5 text-[#ecf2ef] lg:max-h-[calc(100vh-10rem)]">
        <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-7">
          {displayValue}
        </pre>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:block">
        <div className="sticky top-28">{previewBody}</div>
      </aside>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/60 bg-[#173442]/95 px-4 py-3 text-white shadow-[0_-18px_32px_rgba(23,52,66,0.28)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-[#eedcbf]"
            onClick={() => setMobileOpen((open) => !open)}
          >
            <EyeIcon className="h-5 w-5" />
            YAML Preview
          </button>

          <button type="button" className="ghost-button border-white/25 bg-white/10 text-white" onClick={handleCopy}>
            <ClipboardDocumentIcon className="h-5 w-5" />
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        {mobileOpen ? (
          <div className="mx-auto mt-3 max-w-[1440px]">
            <div className="panel-shell overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#e6d9c1] px-4 py-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink">Live YAML</h2>
                  <p className="mt-1 text-sm text-[#75674d]">
                    Scroll inside this panel to inspect the output.
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-full border border-[#d6c7ab] p-2 text-[#7c653d]"
                  onClick={() => setMobileOpen(false)}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="max-h-[50vh] overflow-auto bg-[#142a36] px-4 py-4 text-[#ecf2ef]">
                <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-7">
                  {displayValue}
                </pre>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  )
}
