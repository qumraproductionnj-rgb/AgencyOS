import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function SettingsLayout({ children }: Props) {
  return <div className="mx-auto max-w-4xl space-y-6 p-6">{children}</div>
}
