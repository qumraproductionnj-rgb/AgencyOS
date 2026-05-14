'use client'

import { useLocale } from 'next-intl'
import {
  Users,
  GitPullRequestArrow,
  ThumbsUp,
  Eye,
  Bell,
  Clock,
  MessageSquare,
  FileVideo,
  ImageIcon,
  Layers,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Approval {
  id: string
  projectAr: string
  projectEn: string
  clientAr: string
  clientEn: string
  fileType: 'video' | 'image' | 'design'
  waitingHours: number
  comments: number
}

const APPROVALS: Approval[] = [
  {
    id: 'a1',
    projectAr: 'حملة رمضان 2026',
    projectEn: 'Ramadan Campaign 2026',
    clientAr: 'مطعم بغداد',
    clientEn: 'Baghdad Restaurant',
    fileType: 'video',
    waitingHours: 48,
    comments: 3,
  },
  {
    id: 'a2',
    projectAr: 'هوية شركة الزلال',
    projectEn: 'Al-Zalal Brand Identity',
    clientAr: 'شركة الزلال',
    clientEn: 'Al-Zalal Company',
    fileType: 'design',
    waitingHours: 24,
    comments: 1,
  },
  {
    id: 'a3',
    projectAr: 'تصوير فندق النعيمي',
    projectEn: 'Al-Naaimi Hotel Photography',
    clientAr: 'فندق النعيمي',
    clientEn: 'Al-Naaimi Hotel',
    fileType: 'image',
    waitingHours: 6,
    comments: 0,
  },
]

const FILE_TYPE_CFG = {
  video: { icon: FileVideo, ar: 'فيديو', en: 'Video', color: 'bg-sky-400/10 text-sky-400' },
  image: { icon: ImageIcon, ar: 'صورة', en: 'Image', color: 'bg-emerald-400/10 text-emerald-400' },
  design: { icon: Layers, ar: 'تصميم', en: 'Design', color: 'bg-purple-400/10 text-purple-400' },
}

function fmtWaiting(hours: number, isAr: boolean) {
  if (hours < 24) return isAr ? `منذ ${hours} ساعة` : `${hours}h ago`
  const days = Math.floor(hours / 24)
  return isAr ? `منذ ${days} يوم` : `${days}d ago`
}

const KPIS = [
  {
    icon: Users,
    ar: 'عملاء في البوابة',
    en: 'Clients in Portal',
    value: '5',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10',
  },
  {
    icon: GitPullRequestArrow,
    ar: 'طلبات مراجعة',
    en: 'Pending Approvals',
    value: '3',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
  },
  {
    icon: ThumbsUp,
    ar: 'معدل الموافقة',
    en: 'Approval Rate',
    value: '87%',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
]

export function PortalClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">{isAr ? 'بوابة العملاء' : 'Client Portal'}</h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {isAr ? 'متابعة الموافقات وتسليم الملفات' : 'Track approvals & file delivery'}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {KPIS.map((k) => {
          const Icon = k.icon
          return (
            <div key={k.ar} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5">
              <div className="flex items-center justify-between">
                <div className={cn('rounded-xl p-2.5', k.bg)}>
                  <Icon className={cn('h-5 w-5', k.color)} />
                </div>
                <span className={cn('font-mono text-2xl font-bold', k.color)}>{k.value}</span>
              </div>
              <p className="text-muted-foreground mt-3 text-sm">{isAr ? k.ar : k.en}</p>
            </div>
          )
        })}
      </div>

      {/* Pending Approvals */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">
          {isAr ? 'بانتظار الموافقة' : 'Pending Approvals'}
        </h2>
        <div className="space-y-3">
          {APPROVALS.map((item) => {
            const ft = FILE_TYPE_CFG[item.fileType]
            const FtIcon = ft.icon
            const isUrgent = item.waitingHours >= 48
            return (
              <div
                key={item.id}
                className={cn(
                  'rounded-xl border bg-white/[0.02] p-4 transition-colors hover:bg-white/[0.04]',
                  isUrgent ? 'border-amber-400/30' : 'border-white/[0.06]',
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{isAr ? item.projectAr : item.projectEn}</span>
                      <span
                        className={cn('rounded-full px-2 py-0.5 text-[11px] font-medium', ft.color)}
                      >
                        <span className="flex items-center gap-1">
                          <FtIcon className="h-3 w-3" />
                          {isAr ? ft.ar : ft.en}
                        </span>
                      </span>
                      {isUrgent && (
                        <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-[11px] font-medium text-amber-400">
                          {isAr ? 'عاجل' : 'Urgent'}
                        </span>
                      )}
                    </div>
                    <div className="text-muted-foreground mt-1 text-xs">
                      {isAr ? item.clientAr : item.clientEn}
                    </div>
                    <div className="text-muted-foreground mt-2 flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {fmtWaiting(item.waitingHours, isAr)}
                      </span>
                      {item.comments > 0 && (
                        <span className="flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" />
                          {item.comments} {isAr ? 'تعليق' : 'comments'}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/[0.08]">
                      <Eye className="h-3 w-3" />
                      {isAr ? 'عرض' : 'View'}
                    </button>
                    <button className="flex items-center gap-1.5 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-500/20">
                      <Bell className="h-3 w-3" />
                      {isAr ? 'إرسال تذكير' : 'Remind'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
