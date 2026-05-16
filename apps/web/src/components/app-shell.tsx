'use client'

import { useState, type ReactNode } from 'react'
import { AppHeader } from './layout/app-header'
import { AppSidebar } from './layout/app-sidebar'
import { SubscriptionStatusBanner } from './subscription/subscription-status-banner'
import { CommandPalette } from './command-palette'
import { useCommandPalette } from '@/hooks/use-command-palette'
import { AIAssistant } from './ai-assistant'
import { PresenceProvider } from './realtime/presence-provider'
import { ConnectionStatus } from './realtime/connection-status'
import { ShortcutsHelp } from './shortcuts-help'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { OfflineBanner } from './OfflineBanner'

interface Props {
  children: ReactNode
}

function CommandPaletteMount() {
  useCommandPalette()
  return <CommandPalette />
}

function GlobalShortcuts() {
  useKeyboardShortcuts()
  return null
}

export function AppShell({ children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <PresenceProvider>
      <div className="flex min-h-screen">
        <CommandPaletteMount />
        <GlobalShortcuts />
        <ShortcutsHelp />
        <OfflineBanner />
        <AppSidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader onMenuClick={() => setMobileOpen(true)} />
          <div className="px-4 pt-3">
            <SubscriptionStatusBanner />
          </div>
          <main className="flex-1 overflow-x-hidden">{children}</main>
        </div>
        <AIAssistant />
        <ConnectionStatus />
      </div>
    </PresenceProvider>
  )
}
