'use client'

import { useTranslations } from 'next-intl'
import { useLeaveBalance, type LeaveType } from '@/hooks/use-leaves'

const LEAVE_TYPES: LeaveType[] = [
  'ANNUAL',
  'SICK',
  'PERSONAL',
  'MATERNITY',
  'PATERNITY',
  'UNPAID',
  'OTHER',
]

export function LeaveBalance() {
  const t = useTranslations('leaves')
  const { data: balances, isLoading } = useLeaveBalance()

  if (isLoading) return null

  const getLabel = (type: LeaveType): string => {
    const keyMap: Record<LeaveType, string> = {
      ANNUAL: 'annual',
      SICK: 'sick',
      PERSONAL: 'personal',
      MATERNITY: 'maternity',
      PATERNITY: 'paternity',
      UNPAID: 'unpaid',
      OTHER: 'other',
    }
    return t(keyMap[type])
  }

  const allTypesBalances = LEAVE_TYPES.map((type) => {
    const bal = Array.isArray(balances) ? balances.find((b) => b.leaveType === type) : null
    return { type, total: bal?.totalDays ?? 0, used: bal?.usedDays ?? 0 }
  })

  return (
    <div className="rounded-lg border p-4">
      <h2 className="text-muted-foreground mb-3 text-sm font-semibold">{t('balance')}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {allTypesBalances
          .filter((b) => b.total > 0)
          .map((b) => (
            <div key={b.type} className="bg-card rounded-md border p-3 text-sm">
              <div className="mb-1 font-medium">{getLabel(b.type)}</div>
              <div className="text-muted-foreground flex items-center justify-between text-xs">
                <span>
                  {t('remaining')}: {b.total - b.used} {t('days')}
                </span>
                <span>
                  {b.used}/{b.total}
                </span>
              </div>
              <div className="bg-muted mt-1 h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${b.total > 0 ? Math.min((b.used / b.total) * 100, 100) : 0}%` }}
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
