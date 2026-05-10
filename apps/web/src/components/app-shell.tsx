'use client'

import type { ReactNode } from 'react'
import { AppTopNav } from './app-topnav'

interface Props {
  children: ReactNode
}

export function AppShell({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppTopNav />
      <main className="flex-1">{children}</main>
    </div>
  )
}
