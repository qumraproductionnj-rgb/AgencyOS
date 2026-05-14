'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  LayoutDashboard,
  Users,
  Clock,
  Banknote,
  UserPlus,
  Briefcase,
  Handshake,
  FolderKanban,
  ListTodo,
  Camera,
  Tent,
  FileSignature,
  Receipt,
  CreditCard,
  Sparkles,
  Share2,
  BarChart3,
  Settings,
  CircleDollarSign,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

interface Props {
  mobileOpen: boolean
  onMobileClose: () => void
}

interface NavItem {
  href: string
  icon: LucideIcon
  key: string
  badge?: string
}

interface NavSection {
  key: string
  items: NavItem[]
}

const SECTIONS: NavSection[] = [
  { key: 'home', items: [{ href: '/dashboard', icon: LayoutDashboard, key: 'dashboard' }] },
  {
    key: 'hr',
    items: [
      { href: '/employees', icon: Users, key: 'employees' },
      { href: '/attendance', icon: Clock, key: 'attendance' },
      { href: '/payroll', icon: Banknote, key: 'payroll' },
    ],
  },
  {
    key: 'sales',
    items: [
      { href: '/leads', icon: UserPlus, key: 'leads' },
      { href: '/clients', icon: Briefcase, key: 'clients' },
      { href: '/campaigns', icon: Handshake, key: 'deals' },
    ],
  },
  {
    key: 'ops',
    items: [
      { href: '/projects', icon: FolderKanban, key: 'projects' },
      { href: '/tasks', icon: ListTodo, key: 'tasks' },
      { href: '/equipment', icon: Camera, key: 'equipment' },
      { href: '/exhibitions', icon: Tent, key: 'exhibitions' },
    ],
  },
  {
    key: 'finance',
    items: [
      { href: '/quotations', icon: FileSignature, key: 'quotations' },
      { href: '/invoices', icon: Receipt, key: 'invoices' },
      { href: '/expenses', icon: CreditCard, key: 'payments' },
    ],
  },
  {
    key: 'creative',
    items: [
      { href: '/content-studio', icon: Sparkles, key: 'contentStudio', badge: 'AI' },
      { href: '/portal', icon: Share2, key: 'clientPortal' },
    ],
  },
  { key: 'analytics', items: [{ href: '/reports', icon: BarChart3, key: 'reports' }] },
  {
    key: 'system',
    items: [
      { href: '/settings', icon: Settings, key: 'settings' },
      { href: '/billing', icon: CircleDollarSign, key: 'subscription' },
    ],
  },
]

export function AppSidebar({ mobileOpen, onMobileClose }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const t = useTranslations('nav')
  const pathname = usePathname()

  const widthClass = collapsed ? 'lg:w-[72px]' : 'lg:w-[240px]'

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'ease-smooth fixed inset-y-0 z-50 flex w-[240px] flex-col transition-all duration-300',
          'bg-black/40 backdrop-blur-xl',
          'border-glass-border border-e',
          'lg:sticky lg:top-0 lg:z-30 lg:h-screen lg:translate-x-0',
          widthClass,
          mobileOpen ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full',
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-14 items-center gap-3 px-4">
          <VisionLogo />
          {!collapsed && (
            <span className="truncate text-sm font-bold tracking-widest">VISION OS</span>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="hover:bg-glass-hover text-muted-foreground hover:text-foreground ms-auto hidden rounded-md p-1.5 lg:inline-flex"
            aria-label={collapsed ? t('expand') : t('collapse')}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>

        {!collapsed && (
          <div className="px-3 pb-3">
            <div className="bg-glass border-glass-border focus-within:border-glass-hover flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs">
              <Search className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
              <input
                type="text"
                placeholder={t('search')}
                className="placeholder:text-muted-foreground text-foreground w-full bg-transparent outline-none"
              />
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-2 pb-4">
          {SECTIONS.map((section) => (
            <div key={section.key} className="mb-4">
              {!collapsed && (
                <div className="text-muted-foreground/70 px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider">
                  {t(`sections.${section.key}`)}
                </div>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const active =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname === item.href || pathname.startsWith(item.href + '/')
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onMobileClose}
                        title={collapsed ? t(item.key) : undefined}
                        className={cn(
                          'ease-smooth group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all duration-200',
                          collapsed && 'justify-center px-0',
                          active
                            ? 'text-foreground bg-gradient-to-r from-white/[0.08] to-transparent'
                            : 'text-muted-foreground hover:bg-glass-hover hover:text-foreground hover:ltr:translate-x-0.5 hover:rtl:-translate-x-0.5',
                        )}
                      >
                        {active && (
                          <span className="absolute inset-y-1.5 start-0 w-0.5 rounded-e bg-white" />
                        )}
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        {!collapsed && (
                          <>
                            <span className="truncate">{t(item.key)}</span>
                            {item.badge && (
                              <span className="ms-auto rounded-sm bg-gradient-to-r from-sky-400/20 to-purple-400/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-sky-200">
                                {item.badge}
                              </span>
                            )}
                          </>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="border-glass-border border-t p-3">
          <UserProfile collapsed={collapsed} />
        </div>
      </aside>
    </>
  )
}

function VisionLogo() {
  return (
    <div
      className="h-7 w-7 shrink-0 bg-gradient-to-br from-sky-400 to-purple-500"
      style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
      aria-hidden="true"
    />
  )
}

function UserProfile({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
      <div className="bg-glass border-glass-border flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
        U
      </div>
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium">User</div>
          <div className="text-muted-foreground truncate text-[11px]">Owner</div>
        </div>
      )}
    </div>
  )
}
