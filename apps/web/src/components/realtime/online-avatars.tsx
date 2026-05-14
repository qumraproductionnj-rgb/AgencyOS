'use client'

import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import type { OnlineUser } from '@/hooks/use-presence'

const AVATAR_COLORS = [
  'from-sky-500 to-blue-600',
  'from-purple-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-pink-500 to-rose-600',
]

const PAGE_NAMES: Record<string, string> = {
  '/dashboard': 'لوحة التحكم',
  '/projects': 'المشاريع',
  '/invoices': 'الفواتير',
  '/employees': 'الموظفون',
  '/leads': 'العملاء المحتملون',
  '/tasks': 'المهام',
  '/settings': 'الإعدادات',
  '/billing': 'الاشتراك',
}

function pageName(path: string): string {
  for (const [key, val] of Object.entries(PAGE_NAMES)) {
    if (path.includes(key)) return val
  }
  return path.split('/').filter(Boolean).pop() ?? path
}

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
}

const DOT_COLOR = {
  online: 'bg-emerald-400',
  away: 'bg-amber-400',
  offline: 'bg-white/30',
}

interface Props {
  users: OnlineUser[]
  maxVisible?: number
}

export function OnlineAvatars({ users, maxVisible = 5 }: Props) {
  const locale = useLocale()
  const isAr = locale === 'ar'

  if (users.length === 0) return null

  const visible = users.slice(0, maxVisible)
  const overflow = users.length - maxVisible

  return (
    <div className="flex items-center gap-1">
      <div className="flex -space-x-1.5 rtl:space-x-reverse">
        {visible.map((u, i) => {
          const color = AVATAR_COLORS[i % AVATAR_COLORS.length]!
          const tooltip = isAr
            ? `${u.name} — ${pageName(u.page)}`
            : `${u.name} on ${pageName(u.page)}`
          return (
            <div key={u.socketId} className="group relative" title={tooltip}>
              <div
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[9px] font-bold text-white ring-2 ring-[#0a0a0a]',
                  color,
                )}
              >
                {initials(u.name)}
              </div>
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-1 ring-[#0a0a0a]',
                  DOT_COLOR[u.status],
                )}
              />
              {/* Tooltip */}
              <div
                className={cn(
                  'pointer-events-none absolute top-8 z-50 whitespace-nowrap rounded-lg border border-white/[0.08] bg-[#111]/95 px-2.5 py-1.5 text-[11px] text-white/80 opacity-0 shadow-lg transition-opacity group-hover:opacity-100',
                  isAr ? 'right-0' : 'left-0',
                )}
              >
                <div className="font-medium">{u.name}</div>
                <div className="text-white/40">{pageName(u.page)}</div>
              </div>
            </div>
          )
        })}

        {overflow > 0 && (
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-[9px] font-bold text-white/60 ring-2 ring-[#0a0a0a]"
            title={`+${overflow} ${isAr ? 'آخرون' : 'more'}`}
          >
            +{overflow}
          </div>
        )}
      </div>
    </div>
  )
}
