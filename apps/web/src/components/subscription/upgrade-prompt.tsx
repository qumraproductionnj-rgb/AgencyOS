'use client'

import { AlertTriangle, ArrowUp } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

interface UpgradePromptProps {
  feature: string
  requiredPlan: string
  current: number
  max: number
  type?: 'feature' | 'limit'
}

export function UpgradePrompt({
  feature,
  requiredPlan,
  current,
  max,
  type = 'feature',
}: UpgradePromptProps) {
  const t = useTranslations('subscription')

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 rounded-full bg-amber-100 p-2 dark:bg-amber-900">
          {type === 'feature' ? (
            <ArrowUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200">
            {type === 'feature' ? t('upgradeRequired') : t('limitReached')}
          </h3>
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
            {type === 'feature'
              ? t('upgradeDescription', { plan: requiredPlan })
              : t('limitDescription', { limit: feature, current, max })}
          </p>
          <div className="mt-3 flex gap-2">
            <Link
              href="/settings/billing"
              className="inline-flex items-center gap-1 rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
            >
              <ArrowUp className="h-3.5 w-3.5" />
              {t('upgrade')}
            </Link>
            <Link
              href="/settings/billing"
              className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
            >
              {t('comparePlans')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
