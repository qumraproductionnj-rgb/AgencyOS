'use client'

import { useEffect, useCallback, useState } from 'react'
import { Command } from 'cmdk'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
  Search,
  FolderKanban,
  Receipt,
  Users,
  FileSignature,
  Sparkles,
  LayoutDashboard,
  ListTodo,
  BarChart3,
  Plus,
  UserPlus,
  ArrowRight,
  Briefcase,
} from 'lucide-react'
import { useCommandPaletteStore } from '@/stores/command-palette-store'
import { cn } from '@/lib/utils'

interface CommandItem {
  id: string
  labelAr: string
  labelEn: string
  descAr?: string
  descEn?: string
  icon: React.ElementType
  iconColor: string
  href: string
  shortcut?: string[]
}

const ACTIONS: CommandItem[] = [
  {
    id: 'new-project',
    labelAr: 'إنشاء مشروع جديد',
    labelEn: 'New Project',
    descAr: 'افتح صفحة المشاريع',
    descEn: 'Open projects page',
    icon: Plus,
    iconColor: 'text-purple-400',
    href: '/projects',
    shortcut: ['⌘', 'N'],
  },
  {
    id: 'new-invoice',
    labelAr: 'إنشاء فاتورة',
    labelEn: 'New Invoice',
    descAr: 'افتح صفحة الفواتير',
    descEn: 'Open invoices page',
    icon: Receipt,
    iconColor: 'text-emerald-400',
    href: '/invoices',
  },
  {
    id: 'invite-employee',
    labelAr: 'دعوة موظف',
    labelEn: 'Invite Employee',
    descAr: 'افتح صفحة الموظفين',
    descEn: 'Open employees page',
    icon: UserPlus,
    iconColor: 'text-sky-400',
    href: '/employees',
  },
  {
    id: 'new-quotation',
    labelAr: 'عرض سعر جديد',
    labelEn: 'New Quotation',
    descAr: 'افتح صفحة عروض الأسعار',
    descEn: 'Open quotations page',
    icon: FileSignature,
    iconColor: 'text-amber-400',
    href: '/quotations',
  },
  {
    id: 'content-studio',
    labelAr: 'فتح Content Studio',
    labelEn: 'Open Content Studio',
    descAr: '20 أداة ذكاء اصطناعي',
    descEn: '20 AI tools',
    icon: Sparkles,
    iconColor: 'text-pink-400',
    href: '/content-studio',
  },
]

const NAV_ITEMS: CommandItem[] = [
  {
    id: 'nav-dashboard',
    labelAr: 'لوحة التحكم',
    labelEn: 'Dashboard',
    icon: LayoutDashboard,
    iconColor: 'text-white/60',
    href: '/dashboard',
    shortcut: ['⌘G', 'D'],
  },
  {
    id: 'nav-employees',
    labelAr: 'الموظفون',
    labelEn: 'Employees',
    icon: Users,
    iconColor: 'text-white/60',
    href: '/employees',
    shortcut: ['⌘G', 'E'],
  },
  {
    id: 'nav-projects',
    labelAr: 'المشاريع',
    labelEn: 'Projects',
    icon: FolderKanban,
    iconColor: 'text-white/60',
    href: '/projects',
    shortcut: ['⌘G', 'P'],
  },
  {
    id: 'nav-invoices',
    labelAr: 'الفواتير',
    labelEn: 'Invoices',
    icon: Receipt,
    iconColor: 'text-white/60',
    href: '/invoices',
    shortcut: ['⌘G', 'I'],
  },
  {
    id: 'nav-tasks',
    labelAr: 'المهام',
    labelEn: 'Tasks',
    icon: ListTodo,
    iconColor: 'text-white/60',
    href: '/tasks',
    shortcut: ['⌘G', 'T'],
  },
  {
    id: 'nav-clients',
    labelAr: 'العملاء',
    labelEn: 'Clients',
    icon: Briefcase,
    iconColor: 'text-white/60',
    href: '/clients',
  },
  {
    id: 'nav-studio',
    labelAr: 'Content Studio',
    labelEn: 'Content Studio',
    icon: Sparkles,
    iconColor: 'text-white/60',
    href: '/content-studio',
    shortcut: ['⌘G', 'S'],
  },
  {
    id: 'nav-reports',
    labelAr: 'التقارير',
    labelEn: 'Reports',
    icon: BarChart3,
    iconColor: 'text-white/60',
    href: '/reports',
    shortcut: ['⌘G', 'R'],
  },
]

const SEARCH_ITEMS: CommandItem[] = [
  {
    id: 'search-employees',
    labelAr: 'بحث في الموظفين',
    labelEn: 'Search Employees',
    icon: Users,
    iconColor: 'text-sky-400',
    href: '/employees',
  },
  {
    id: 'search-clients',
    labelAr: 'بحث في العملاء',
    labelEn: 'Search Clients',
    icon: Briefcase,
    iconColor: 'text-emerald-400',
    href: '/clients',
  },
  {
    id: 'search-projects',
    labelAr: 'بحث في المشاريع',
    labelEn: 'Search Projects',
    icon: FolderKanban,
    iconColor: 'text-purple-400',
    href: '/projects',
  },
  {
    id: 'search-invoices',
    labelAr: 'بحث في الفواتير',
    labelEn: 'Search Invoices',
    icon: Receipt,
    iconColor: 'text-amber-400',
    href: '/invoices',
  },
]

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded-sm bg-sky-400/20 px-0.5 text-sky-300">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}

function CommandRow({
  item,
  isAr,
  query,
  onSelect,
}: {
  item: CommandItem
  isAr: boolean
  query: string
  onSelect: (href: string) => void
}) {
  const Icon = item.icon
  const label = isAr ? item.labelAr : item.labelEn
  const desc = isAr ? item.descAr : item.descEn

  return (
    <Command.Item
      value={`${item.labelAr} ${item.labelEn} ${item.id}`}
      onSelect={() => onSelect(item.href)}
      className={cn(
        'group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
        'outline-none transition-colors hover:bg-white/[0.06] aria-selected:bg-white/[0.08]',
      )}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
        <Icon className={cn('h-4 w-4', item.iconColor)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-white/90">
          <Highlight text={label} query={query} />
        </div>
        {desc && <div className="text-muted-foreground truncate text-xs">{desc}</div>}
      </div>
      {item.shortcut && (
        <div className="hidden shrink-0 items-center gap-1 sm:flex">
          {item.shortcut.map((k) => (
            <kbd
              key={k}
              className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[10px] text-white/40"
            >
              {k}
            </kbd>
          ))}
        </div>
      )}
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-white/20 opacity-0 transition-opacity group-aria-selected:opacity-100" />
    </Command.Item>
  )
}

export function CommandPalette() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const router = useRouter()
  const { isOpen, close } = useCommandPaletteStore()

  const [query, setQuery] = useState('')

  const navigate = useCallback(
    (href: string) => {
      close()
      setQuery('')
      router.push(`/${locale}${href}`)
    },
    [close, router, locale],
  )

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      return
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, close])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[10vh]"
      onClick={close}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0d0d0d]/95 shadow-2xl shadow-black/80 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'cmdFadeIn 0.15s ease' }}
      >
        <Command className="flex flex-col" dir={isAr ? 'rtl' : 'ltr'} loop>
          {/* Search */}
          <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3.5">
            <Search className="h-4 w-4 shrink-0 text-white/40" />
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder={isAr ? 'ابحث أو نفّذ أمراً...' : 'Search or run a command...'}
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            />
            <kbd className="shrink-0 rounded border border-white/[0.1] px-1.5 py-0.5 font-mono text-[10px] text-white/30">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <Command.List className="max-h-[min(420px,60vh)] overflow-y-auto p-2">
            <Command.Empty className="py-10 text-center text-sm text-white/30">
              {isAr ? 'لا نتائج' : 'No results found'}
            </Command.Empty>

            {/* Actions */}
            <Command.Group
              heading={
                <span className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                  {isAr ? 'الأوامر' : 'Commands'}
                </span>
              }
            >
              {ACTIONS.map((item) => (
                <CommandRow
                  key={item.id}
                  item={item}
                  isAr={isAr}
                  query={query}
                  onSelect={navigate}
                />
              ))}
            </Command.Group>

            {/* Navigation */}
            <Command.Group
              heading={
                <span className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                  {isAr ? 'انتقال سريع' : 'Quick Navigation'}
                </span>
              }
            >
              {NAV_ITEMS.map((item) => (
                <CommandRow
                  key={item.id}
                  item={item}
                  isAr={isAr}
                  query={query}
                  onSelect={navigate}
                />
              ))}
            </Command.Group>

            {/* Search */}
            <Command.Group
              heading={
                <span className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                  {isAr ? 'البحث في البيانات' : 'Search Data'}
                </span>
              }
            >
              {SEARCH_ITEMS.map((item) => (
                <CommandRow
                  key={item.id}
                  item={item}
                  isAr={isAr}
                  query={query}
                  onSelect={navigate}
                />
              ))}
            </Command.Group>
          </Command.List>

          {/* Footer */}
          <div className="flex items-center gap-4 border-t border-white/[0.06] px-4 py-2.5 text-[11px] text-white/25">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white/[0.06] px-1 font-mono">↑↓</kbd>
              {isAr ? 'تنقل' : 'navigate'}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white/[0.06] px-1 font-mono">↵</kbd>
              {isAr ? 'اختيار' : 'select'}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-white/[0.06] px-1 font-mono">ESC</kbd>
              {isAr ? 'إغلاق' : 'close'}
            </span>
          </div>
        </Command>
      </div>

      <style>{`
        @keyframes cmdFadeIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </div>
  )
}
