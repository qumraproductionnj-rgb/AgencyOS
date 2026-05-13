'use client'

import {
  LayoutDashboard,
  Users,
  Clock,
  Briefcase,
  FolderKanban,
  FileText,
  BarChart3,
  Settings,
  X,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
}

const ITEMS = [
  { href: '/', icon: LayoutDashboard, key: 'dashboard' },
  { href: '/employees', icon: Users, key: 'employees' },
  { href: '/attendance', icon: Clock, key: 'attendance' },
  { href: '/clients', icon: Briefcase, key: 'clients' },
  { href: '/projects', icon: FolderKanban, key: 'projects' },
  { href: '/invoices', icon: FileText, key: 'invoices' },
  { href: '/reports', icon: BarChart3, key: 'reports' },
  { href: '/settings', icon: Settings, key: 'settings' },
] as const

export function AppSidebar({ open, onClose }: Props) {
  const t = useTranslations('nav')
  const pathname = usePathname()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'bg-background fixed inset-y-0 z-50 flex w-64 flex-col border-e transition-transform duration-200 lg:sticky lg:top-14 lg:z-30 lg:h-[calc(100vh-3.5rem)] lg:translate-x-0',
          'start-0',
          open ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full',
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-14 items-center justify-between border-b px-4 lg:hidden">
          <span className="text-lg font-bold">AgencyOS</span>
          <button
            type="button"
            onClick={onClose}
            className="hover:bg-accent rounded-md p-2"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {ITEMS.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{t(item.key)}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
