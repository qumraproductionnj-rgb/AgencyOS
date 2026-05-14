'use client'

import { useState, type ReactNode } from 'react'
import { AppHeader } from './layout/app-header'
import { AppSidebar } from './layout/app-sidebar'
import { SubscriptionStatusBanner } from './subscription/subscription-status-banner'

interface Props {
  children: ReactNode
}

export function AppShell({ children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      <AppSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader onMenuClick={() => setMobileOpen(true)} />
        <div className="px-4 pt-3">
          <SubscriptionStatusBanner />
        </div>
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  )
}
