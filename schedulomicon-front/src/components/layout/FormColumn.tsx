import type { ReactNode } from 'react'

export function FormColumn({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 flex-col gap-6 pb-28 md:pb-10">{children}</div>
}
