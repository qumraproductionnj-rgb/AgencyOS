'use client'

import { Menu, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import { LanguageSwitcher } from '../language-switcher'
import { ThemeToggle } from '../theme-toggle'
import { NotificationBell } from '../notifications/notification-bell'
import { SearchTrigger } from '../search/search-modal'
import { OnlineAvatars } from '../realtime/online-avatars'
import { usePresenceContext } from '../realtime/presence-provider'
import { VoiceButton } from '../voice-button'

interface Props {
  onMenuClick: () => void
}

export function AppHeader({ onMenuClick }: Props) {
  const t = useTranslations('nav')
  const locale = useLocale()
  const pathname = usePathname()
  const Chevron = locale === 'ar' ? ChevronLeft : ChevronRight
  const { onlineList } = usePresenceContext()

  const currentKey = deriveCurrentKey(pathname)

  return (
    <header
      className="border-glass-border sticky top-0 z-30 border-b bg-black/70 backdrop-blur-xl"
      style={{ padding: '14px 24px' }}
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="hover:bg-glass-hover -ms-2 rounded-md p-2 lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-sm">
          <span className="text-muted-foreground font-semibold tracking-widest">
            {t('breadcrumbRoot')}
          </span>
          {currentKey && (
            <>
              <Chevron className="text-muted-foreground/60 h-3.5 w-3.5 shrink-0" />
              <span className="text-foreground truncate">{t(currentKey)}</span>
            </>
          )}
        </nav>

        <div className="ms-auto flex items-center gap-3">
          <LiveIndicator label={t('live')} />
          <OnlineAvatars users={onlineList} maxVisible={4} />
          <SearchTrigger />
          <VoiceButton />
          <NotificationBell />
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

function LiveIndicator({ label }: { label: string }) {
  return (
    <div className="hidden items-center gap-2 sm:flex">
      <span className="relative flex h-2 w-2">
        <span className="vision-pulse absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">
        {label}
      </span>
    </div>
  )
}

const ROUTE_KEY_MAP: Record<string, string> = {
  '/': 'dashboard',
  '/employees': 'employees',
  '/attendance': 'attendance',
  '/payroll': 'payroll',
  '/leads': 'leads',
  '/clients': 'clients',
  '/campaigns': 'deals',
  '/projects': 'projects',
  '/tasks': 'tasks',
  '/equipment': 'equipment',
  '/exhibitions': 'exhibitions',
  '/quotations': 'quotations',
  '/invoices': 'invoices',
  '/expenses': 'payments',
  '/content-plans': 'contentStudio',
  '/content-pieces': 'contentStudio',
  '/files': 'clientPortal',
  '/reports': 'reports',
  '/settings': 'settings',
  '/settings/billing': 'subscription',
}

function deriveCurrentKey(pathname: string): string | null {
  if (ROUTE_KEY_MAP[pathname]) return ROUTE_KEY_MAP[pathname] ?? null
  const segments = pathname.split('/').filter(Boolean)
  while (segments.length > 0) {
    const candidate = '/' + segments.join('/')
    if (ROUTE_KEY_MAP[candidate]) return ROUTE_KEY_MAP[candidate] ?? null
    segments.pop()
  }
  return null
}
