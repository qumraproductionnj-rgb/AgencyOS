'use client'

import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import type { OnlineUser } from '@/hooks/use-presence'

const AVATAR_COLORS = [
  'from-sky-500 to-blue-600',
  'from-purple-500 to-violet-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
]

function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0] ?? '')
    .join('')
    .toUpperCase()
}

interface Props {
  viewers: OnlineUser[]
  className?: string
}

export function PageViewers({ viewers, className }: Props) {
  const locale = useLocale()
  const isAr = locale === 'ar'

  if (viewers.length === 0) return null

  const names = viewers.map((v) => v.name)
  const label = isAr
    ? names.join(' و') + (viewers.length === 1 ? ' يشاهد هذه الصفحة' : ' يشاهدان هذه الصفحة')
    : names.join(', ') + (viewers.length === 1 ? ' is viewing this page' : ' are viewing this page')

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2',
        className,
      )}
    >
      <div className="flex -space-x-1.5 rtl:space-x-reverse">
        {viewers.map((v, i) => (
          <div
            key={v.socketId}
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[9px] font-bold text-white ring-2 ring-[#0d0d0d]',
              AVATAR_COLORS[i % AVATAR_COLORS.length],
            )}
            title={v.name}
          >
            {initials(v.name)}
          </div>
        ))}
      </div>
      <p className="text-[11px] text-white/40">{label}</p>
    </div>
  )
}
