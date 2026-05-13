'use client'

import { useTranslations } from 'next-intl'
import { useUsage } from '@/hooks/use-billing-data'

const METRIC_LABEL_KEY: Record<string, string> = {
  users: 'users',
  clients: 'clients',
  projects: 'projects',
  aiGenerations: 'aiGenerations',
  storageMb: 'storage',
}

function tone(pct: number): string {
  if (pct >= 90) return 'bg-red-500'
  if (pct >= 75) return 'bg-amber-500'
  return 'bg-green-500'
}

function formatValue(key: string, current: number, limit: number): string {
  if (key === 'storageMb') {
    const fmt = (mb: number) => (mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${mb} MB`)
    return `${fmt(current)} / ${fmt(limit)}`
  }
  const unlimited = limit >= 9999
  return `${current} / ${unlimited ? '∞' : limit}`
}

export function UsageMeters() {
  const t = useTranslations('subscription')
  const { data, isLoading } = useUsage()

  if (isLoading || !data) {
    return <div className="h-32 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
        {t('usage') /* fallback key, AR/EN provided below */}
      </h2>
      <div className="mt-4 space-y-3">
        {Object.entries(data.metrics).map(([key, m]) => {
          const labelKey = METRIC_LABEL_KEY[key] ?? key
          return (
            <div key={key}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 dark:text-gray-300">{t(labelKey)}</span>
                <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                  {formatValue(key, m.current, m.limit)}
                </span>
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div className={`h-full ${tone(m.percent)}`} style={{ width: `${m.percent}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
