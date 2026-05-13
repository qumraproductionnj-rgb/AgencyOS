'use client'

import { useState, type ReactNode } from 'react'
import { AppTopNav } from './app-topnav'
import { AppSidebar } from './layout/app-sidebar'
import { SubscriptionStatusBanner } from './subscription/subscription-status-banner'

interface Props {
  children: ReactNode
}

export function AppShell({ children }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <AppTopNav onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="px-4 pt-3">
            <SubscriptionStatusBanner />
          </div>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
