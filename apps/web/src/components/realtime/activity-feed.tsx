'use client'

import { useEffect, useRef } from 'react'
import { useLocale } from 'next-intl'
import { FileCheck, MapPin, CheckCircle, MessageSquare, AtSign, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ActivityItem } from '@/hooks/use-activity-feed'

const TYPE_CFG: Record<
  string,
  { icon: React.ElementType; color: string; labelAr: string; labelEn: string }
> = {
  invoice_paid: {
    icon: FileCheck,
    color: 'text-emerald-400',
    labelAr: 'فاتورة مدفوعة',
    labelEn: 'Invoice Paid',
  },
  attendance_checkin: {
    icon: MapPin,
    color: 'text-sky-400',
    labelAr: 'تسجيل حضور',
    labelEn: 'Checked In',
  },
  project_completed: {
    icon: CheckCircle,
    color: 'text-purple-400',
    labelAr: 'مشروع مكتمل',
    labelEn: 'Project Done',
  },
  comment_added: {
    icon: MessageSquare,
    color: 'text-amber-400',
    labelAr: 'تعليق جديد',
    labelEn: 'New Comment',
  },
  mention: { icon: AtSign, color: 'text-pink-400', labelAr: 'ذكر جديد', labelEn: 'Mentioned' },
  default: { icon: Zap, color: 'text-white/40', labelAr: 'نشاط', labelEn: 'Activity' },
}

function fmtTime(ts: number, isAr: boolean): string {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60_000)
  const h = Math.floor(diff / 3_600_000)
  if (m < 1) return isAr ? 'الآن' : 'now'
  if (m < 60) return isAr ? `${m} د` : `${m}m`
  if (h < 24) return isAr ? `${h} س` : `${h}h`
  return isAr ? `${Math.floor(h / 24)} ي` : `${Math.floor(h / 24)}d`
}

interface Props {
  activities: ActivityItem[]
  className?: string
}

export function ActivityFeed({ activities, className }: Props) {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const listRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to newest item
  useEffect(() => {
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activities.length])

  if (activities.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center gap-2 py-10 text-white/25',
          className,
        )}
      >
        <Zap className="h-8 w-8" />
        <p className="text-xs">{isAr ? 'لا يوجد نشاط بعد' : 'No activity yet'}</p>
      </div>
    )
  }

  return (
    <div ref={listRef} className={cn('space-y-0 overflow-y-auto', className)}>
      {activities.map((a, idx) => {
        const cfg = TYPE_CFG[a.type] ?? TYPE_CFG['default']!
        const Icon = cfg.icon
        const actor = (a.payload['actorName'] as string | undefined) ?? '—'
        const detail = (a.payload['detail'] as string | undefined) ?? ''

        return (
          <div
            key={a.id}
            className={cn(
              'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]',
              idx < activities.length - 1 && 'border-b border-white/[0.04]',
            )}
            style={{ animation: idx === 0 ? 'feedSlideIn 0.25s ease-out' : undefined }}
          >
            <div className={cn('mt-0.5 shrink-0', cfg.color)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xs font-medium text-white/80">{actor}</span>
                <span className="shrink-0 text-[10px] text-white/25">{fmtTime(a.ts, isAr)}</span>
              </div>
              <p className="mt-0.5 text-[11px] text-white/40">
                {isAr ? cfg.labelAr : cfg.labelEn}
                {detail && ` — ${detail}`}
              </p>
            </div>
          </div>
        )
      })}

      <style>{`
        @keyframes feedSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
