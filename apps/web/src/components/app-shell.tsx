'use client'

import type { ReactNode } from 'react'
import { AppTopNav } from './app-topnav'
import { SubscriptionStatusBanner } from './subscription/subscription-status-banner'

interface Props {
  children: ReactNode
}

export function AppShell({ children }: Props) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppTopNav />
      <div className="px-4 pt-3">
        <SubscriptionStatusBanner />
      </div>
      <main className="flex-1">{children}</main>
    </div>
  )
}
