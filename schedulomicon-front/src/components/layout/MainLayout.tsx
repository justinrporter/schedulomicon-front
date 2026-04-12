import type { ReactNode } from 'react'

interface MainLayoutProps {
  formColumn: ReactNode
  previewPanel: ReactNode
}

export function MainLayout({ formColumn, previewPanel }: MainLayoutProps) {
  return (
    <main className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 md:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)] lg:px-8">
      {formColumn}
      {previewPanel}
    </main>
  )
}
