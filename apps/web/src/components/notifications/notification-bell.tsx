'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, X, CheckCheck, AlertCircle, Info, Sparkles, ExternalLink } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { useNotificationsLocal, type NotifType } from '@/hooks/use-notifications-local'
import { cn } from '@/lib/utils'

const TYPE_CFG: Record<NotifType, { icon: React.ElementType; color: string; dot: string }> = {
  urgent: { icon: AlertCircle, color: 'text-red-400', dot: 'bg-red-400' },
  important: { icon: Sparkles, color: 'text-amber-400', dot: 'bg-amber-400' },
  info: { icon: Info, color: 'text-sky-400', dot: 'bg-sky-400' },
}

function fmtTime(ts: number, isAr: boolean): string {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60_000)
  const h = Math.floor(diff / 3_600_000)
  if (m < 1) return isAr ? 'الآن' : 'now'
  if (m < 60) return isAr ? `منذ ${m} د` : `${m}m ago`
  if (h < 24) return isAr ? `منذ ${h} س` : `${h}h ago`
  return isAr ? `منذ ${Math.floor(h / 24)} ي` : `${Math.floor(h / 24)}d ago`
}

const TAB_FILTERS: { id: '' | NotifType; ar: string; en: string }[] = [
  { id: '', ar: 'الكل', en: 'All' },
  { id: 'urgent', ar: 'عاجل', en: 'Urgent' },
  { id: 'important', ar: 'مهم', en: 'Important' },
  { id: 'info', ar: 'للعلم', en: 'Info' },
]

export function NotificationBell() {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'' | NotifType>('')
  const ref = useRef<HTMLDivElement>(null)

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationsLocal()

  const filtered = tab ? notifications.filter((n) => n.type === tab) : notifications

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={cn(
            'absolute top-full z-50 mt-2 flex flex-col overflow-hidden',
            'w-[min(360px,calc(100vw-2rem))]',
            'bg-[#0d0d0d]/98 rounded-2xl border border-white/[0.08] shadow-2xl shadow-black/60 backdrop-blur-xl',
            isAr ? 'left-0' : 'right-0',
          )}
          style={{ maxHeight: '520px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{isAr ? 'الإشعارات' : 'Notifications'}</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-red-400">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
                  title={isAr ? 'قراءة الكل' : 'Mark all read'}
                >
                  <CheckCheck className="h-3 w-3" />
                  <span className="hidden sm:inline">{isAr ? 'قراءة الكل' : 'All read'}</span>
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5 border-b border-white/[0.06] px-3 py-2">
            {TAB_FILTERS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-[11px] transition-colors',
                  tab === t.id
                    ? 'bg-white/[0.08] font-semibold text-white'
                    : 'text-white/40 hover:text-white/70',
                )}
              >
                {isAr ? t.ar : t.en}
              </button>
            ))}
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-white/25">
                <Bell className="h-8 w-8" />
                <p className="text-xs">{isAr ? 'لا توجد إشعارات' : 'No notifications'}</p>
              </div>
            ) : (
              filtered.map((n) => {
                const cfg = TYPE_CFG[n.type]
                const Icon = cfg.icon
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      markAsRead(n.id)
                      if (n.href) {
                        setOpen(false)
                        router.push(n.href as Parameters<typeof router.push>[0])
                      }
                    }}
                    className={cn(
                      'flex w-full items-start gap-3 border-b border-white/[0.04] px-4 py-3 text-start transition-colors hover:bg-white/[0.03]',
                      !n.read && 'bg-white/[0.015]',
                    )}
                  >
                    <div className={cn('mt-0.5 shrink-0', cfg.color)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            'text-xs font-semibold',
                            !n.read ? 'text-white' : 'text-white/70',
                          )}
                        >
                          {isAr ? n.titleAr : n.titleEn}
                        </span>
                        <span className="shrink-0 text-[10px] text-white/25">
                          {fmtTime(n.time, isAr)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-white/40">
                        {isAr ? n.bodyAr : n.bodyEn}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      {!n.read && <span className={cn('h-1.5 w-1.5 rounded-full', cfg.dot)} />}
                      {n.href && <ExternalLink className="h-3 w-3 text-white/20" />}
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
