'use client'

import { X, Trash2, Send, Archive, CheckCircle, Download } from 'lucide-react'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

type Context = 'invoices' | 'projects' | 'employees' | 'leads'

interface Props {
  count: number
  context: Context
  onClear: () => void
}

const ACTIONS: Record<
  Context,
  { icon: React.ElementType; ar: string; en: string; style: string }[]
> = {
  invoices: [
    {
      icon: Send,
      ar: 'إرسال تذكير',
      en: 'Send Reminder',
      style: 'text-amber-400 hover:bg-amber-400/10',
    },
    {
      icon: Download,
      ar: 'تصدير PDF',
      en: 'Export PDF',
      style: 'text-sky-400 hover:bg-sky-400/10',
    },
    { icon: Archive, ar: 'أرشفة', en: 'Archive', style: 'text-white/50 hover:bg-white/[0.06]' },
    { icon: Trash2, ar: 'حذف', en: 'Delete', style: 'text-red-400 hover:bg-red-400/10' },
  ],
  projects: [
    {
      icon: CheckCircle,
      ar: 'تحديد مكتمل',
      en: 'Mark Done',
      style: 'text-emerald-400 hover:bg-emerald-400/10',
    },
    { icon: Archive, ar: 'أرشفة', en: 'Archive', style: 'text-white/50 hover:bg-white/[0.06]' },
    { icon: Trash2, ar: 'حذف', en: 'Delete', style: 'text-red-400 hover:bg-red-400/10' },
  ],
  employees: [
    { icon: Send, ar: 'إرسال دعوة', en: 'Send Invite', style: 'text-sky-400 hover:bg-sky-400/10' },
    { icon: Archive, ar: 'تعطيل', en: 'Deactivate', style: 'text-amber-400 hover:bg-amber-400/10' },
    { icon: Trash2, ar: 'حذف', en: 'Delete', style: 'text-red-400 hover:bg-red-400/10' },
  ],
  leads: [
    {
      icon: CheckCircle,
      ar: 'تحويل لعميل',
      en: 'Convert',
      style: 'text-emerald-400 hover:bg-emerald-400/10',
    },
    { icon: Send, ar: 'إرسال عرض', en: 'Send Offer', style: 'text-sky-400 hover:bg-sky-400/10' },
    { icon: Trash2, ar: 'حذف', en: 'Delete', style: 'text-red-400 hover:bg-red-400/10' },
  ],
}

export function BulkActionBar({ count, context, onClear }: Props) {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const actions = ACTIONS[context]

  if (count === 0) return null

  return (
    <div
      className={cn(
        'fixed bottom-6 z-40 flex items-center gap-3 rounded-2xl border border-white/[0.1]',
        'bg-[#111]/95 px-4 py-3 shadow-2xl shadow-black/60 backdrop-blur-xl',
        'transition-all duration-300',
        isAr ? 'left-1/2 -translate-x-1/2' : 'left-1/2 -translate-x-1/2',
      )}
      style={{ animation: 'bulkSlideUp 0.25s ease-out' }}
    >
      <span className="shrink-0 rounded-lg bg-white/[0.08] px-2.5 py-1 text-xs font-semibold text-white">
        {count} {isAr ? 'محدد' : 'selected'}
      </span>

      <div className="h-4 w-px bg-white/[0.1]" />

      <div className="flex items-center gap-1">
        {actions.map((a) => (
          <button
            key={a.en}
            onClick={() => {
              toast.success(isAr ? a.ar : a.en)
              onClear()
            }}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
              a.style,
            )}
          >
            <a.icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{isAr ? a.ar : a.en}</span>
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-white/[0.1]" />

      <button
        onClick={onClear}
        className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/[0.06] hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <style>{`
        @keyframes bulkSlideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}
