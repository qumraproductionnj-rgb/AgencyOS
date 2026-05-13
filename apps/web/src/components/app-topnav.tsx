'use client'

import { Menu } from 'lucide-react'
import { LanguageSwitcher } from './language-switcher'
import { ThemeToggle } from './theme-toggle'
import { NotificationBell } from './notifications/notification-bell'
import { SearchTrigger } from './search/search-modal'

interface Props {
  onMenuClick?: () => void
}

export function AppTopNav({ onMenuClick }: Props) {
  return (
    <header className="bg-background sticky top-0 z-40 border-b">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="hover:bg-accent rounded-md p-2 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
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
