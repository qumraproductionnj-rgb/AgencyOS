'use client'

import { LanguageSwitcher } from './language-switcher'
import { ThemeToggle } from './theme-toggle'
import { NotificationBell } from './notifications/notification-bell'
import { SearchTrigger } from './search/search-modal'

export function AppTopNav() {
  return (
    <header className="bg-background sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">AgencyOS</span>
        </div>

        <div className="flex items-center gap-3">
          <SearchTrigger />
          <NotificationBell />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
