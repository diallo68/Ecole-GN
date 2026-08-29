import type { ReactNode } from 'react'

export function Modal({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">{children}</div>
    </div>
  )
}
