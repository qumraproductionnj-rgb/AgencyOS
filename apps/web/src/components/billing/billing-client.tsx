'use client'

import { useLocale } from 'next-intl'
import { Zap, HardDrive, Sparkles, Users, Check, Download, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const USAGE = [
  {
    icon: Users,
    labelAr: 'الموظفون',
    labelEn: 'Employees',
    current: 8,
    max: null,
    color: 'bg-sky-400',
    track: 'bg-sky-400/10',
  },
  {
    icon: HardDrive,
    labelAr: 'المساحة',
    labelEn: 'Storage',
    current: 87,
    max: 200,
    unit: 'GB',
    color: 'bg-purple-400',
    track: 'bg-purple-400/10',
  },
  {
    icon: Sparkles,
    labelAr: 'AI Generations',
    labelEn: 'AI Generations',
    current: 428,
    max: 1000,
    color: 'bg-amber-400',
    track: 'bg-amber-400/10',
  },
  {
    icon: Zap,
    labelAr: 'العملاء',
    labelEn: 'Clients',
    current: 5,
    max: null,
    color: 'bg-emerald-400',
    track: 'bg-emerald-400/10',
  },
]

const INVOICES = [
  { id: 'bi1', dateAr: '١ مايو ٢٠٢٦', dateEn: 'May 1, 2026', amount: '195,000', status: 'paid' },
  { id: 'bi2', dateAr: '١ أبريل ٢٠٢٦', dateEn: 'Apr 1, 2026', amount: '195,000', status: 'paid' },
  { id: 'bi3', dateAr: '١ مارس ٢٠٢٦', dateEn: 'Mar 1, 2026', amount: '195,000', status: 'paid' },
  { id: 'bi4', dateAr: '١ فبراير ٢٠٢٦', dateEn: 'Feb 1, 2026', amount: '195,000', status: 'paid' },
]

const PLANS = [
  {
    nameAr: 'Starter',
    nameEn: 'Starter',
    price: '75,000',
    current: false,
    featuresAr: ['3 موظفين', '20 GB', '100 AI', '2 عميل'],
    featuresEn: ['3 Employees', '20 GB', '100 AI', '2 Clients'],
    color: 'border-white/[0.06]',
    badge: '',
  },
  {
    nameAr: 'Pro',
    nameEn: 'Pro',
    price: '125,000',
    current: false,
    featuresAr: ['10 موظفين', '100 GB', '500 AI', '10 عملاء'],
    featuresEn: ['10 Employees', '100 GB', '500 AI', '10 Clients'],
    color: 'border-sky-500/30',
    badge: 'Popular',
  },
  {
    nameAr: 'Agency',
    nameEn: 'Agency',
    price: '195,000',
    current: true,
    featuresAr: ['غير محدود', '200 GB', '1000 AI', 'غير محدود'],
    featuresEn: ['Unlimited', '200 GB', '1000 AI', 'Unlimited'],
    color: 'border-purple-500/30',
    badge: '',
  },
]

export function BillingClient() {
  const locale = useLocale()
  const isAr = locale === 'ar'

  return (
    <div className="space-y-5 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">
          {isAr ? 'الاشتراك والفواتير' : 'Billing & Subscription'}
        </h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          {isAr ? 'إدارة خطة الاشتراك والدفعات' : 'Manage your plan & payments'}
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-500/[0.07] to-sky-500/[0.04] p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">{isAr ? 'خطة Agency' : 'Agency Plan'}</h2>
              <span className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                {isAr ? 'نشط' : 'Active'}
              </span>
            </div>
            <p className="text-muted-foreground mt-0.5 text-sm">
              <span className="font-mono text-xl font-bold text-white">د.ع 195,000</span>
              <span className="ms-1 text-xs">{isAr ? '/شهر' : '/month'}</span>
            </p>
          </div>
          <button
            onClick={() =>
              toast.success(isAr ? 'جار فتح بوابة الاشتراك...' : 'Opening subscription portal...')
            }
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.06] px-3 py-2 text-sm font-medium transition-colors hover:bg-white/[0.1]"
          >
            <ExternalLink className="h-4 w-4" />
            {isAr ? 'إدارة الاشتراك' : 'Manage'}
          </button>
        </div>

        {/* Usage Meters */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {USAGE.map((u) => {
            const Icon = u.icon
            const pct = u.max ? Math.round((u.current / u.max) * 100) : null
            const warn = pct !== null && pct >= 80
            return (
              <div
                key={u.labelEn}
                className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5"
              >
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-white/70">
                    <Icon className="h-3.5 w-3.5" />
                    {isAr ? u.labelAr : u.labelEn}
                  </span>
                  <span
                    className={cn(
                      'font-mono font-semibold',
                      warn ? 'text-amber-400' : 'text-white/80',
                    )}
                  >
                    {u.current}
                    {u.unit ? ` ${u.unit}` : ''}
                    {u.max ? ` / ${u.max}${u.unit ? ` ${u.unit}` : ''}` : ' / ∞'}
                  </span>
                </div>
                <div className={cn('h-1.5 rounded-full', u.track)}>
                  <div
                    className={cn(
                      'h-full rounded-full transition-all',
                      u.color,
                      warn && 'bg-amber-400',
                    )}
                    style={{ width: `${pct ?? 30}%` }}
                  />
                </div>
                {pct !== null && (
                  <div className="text-muted-foreground mt-1 text-[10px]">
                    {pct}% {isAr ? 'مُستخدَم' : 'used'}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Plan Comparison */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">{isAr ? 'مقارنة الخطط' : 'Plan Comparison'}</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.nameEn}
              className={cn(
                'rounded-xl border p-5 transition-all',
                plan.color,
                plan.current && 'bg-purple-500/[0.05]',
              )}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="font-bold">{isAr ? plan.nameAr : plan.nameEn}</span>
                {plan.badge && (
                  <span className="rounded-full bg-sky-400/10 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
                    {plan.badge}
                  </span>
                )}
                {plan.current && (
                  <span className="rounded-full bg-purple-400/10 px-2 py-0.5 text-[10px] font-semibold text-purple-400">
                    {isAr ? 'حالي' : 'Current'}
                  </span>
                )}
              </div>
              <div className="mb-4 font-mono text-lg font-bold">
                د.ع {plan.price}
                <span className="text-muted-foreground text-xs font-normal">
                  {isAr ? '/شهر' : '/mo'}
                </span>
              </div>
              <ul className="mb-4 space-y-1.5">
                {(isAr ? plan.featuresAr : plan.featuresEn).map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-white/70">
                    <Check className="h-3 w-3 shrink-0 text-emerald-400" />
                    {f}
                  </li>
                ))}
              </ul>
              {!plan.current && (
                <button
                  onClick={() => toast.success(isAr ? 'جار التحويل...' : 'Switching plan...')}
                  className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] py-2 text-xs font-medium transition-colors hover:bg-white/[0.08]"
                >
                  {isAr ? 'الترقية' : 'Upgrade'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invoice History */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">{isAr ? 'سجل الفواتير' : 'Invoice History'}</h2>
        <div className="overflow-hidden rounded-xl border border-white/[0.06]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.04]">
                <th className="text-muted-foreground px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider">
                  {isAr ? 'التاريخ' : 'Date'}
                </th>
                <th className="text-muted-foreground px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider">
                  {isAr ? 'المبلغ' : 'Amount'}
                </th>
                <th className="text-muted-foreground px-4 py-3 text-start text-[11px] font-semibold uppercase tracking-wider">
                  {isAr ? 'الحالة' : 'Status'}
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {INVOICES.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.02]">
                  <td className="text-muted-foreground px-4 py-3.5 text-xs">
                    {isAr ? inv.dateAr : inv.dateEn}
                  </td>
                  <td className="px-4 py-3.5 font-mono text-sm font-semibold">د.ع {inv.amount}</td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full bg-emerald-400/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                      {isAr ? 'مدفوع' : 'Paid'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-end">
                    <button
                      onClick={() =>
                        toast.success(isAr ? 'جار تحميل الفاتورة...' : 'Downloading invoice...')
                      }
                      className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/60 transition-colors hover:bg-white/[0.08]"
                    >
                      <Download className="h-3 w-3" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
