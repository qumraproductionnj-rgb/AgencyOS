'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  useFinancialReport,
  useOperationsReport,
  useHrReport,
  useSalesReport,
} from '@/hooks/use-reports'

type Tab = 'financial' | 'operations' | 'hr' | 'sales'

export default function ReportsPage() {
  const t = useTranslations('reports')
  const [tab, setTab] = useState<Tab>('financial')
  const today = new Date().toISOString().slice(0, 10)
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  const [from, setFrom] = useState(monthAgo)
  const [to, setTo] = useState(today)
  const range = { from, to }

  const financial = useFinancialReport(range)
  const operations = useOperationsReport(range)
  const hr = useHrReport(range)
  const sales = useSalesReport(range)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'financial', label: t('financial') },
    { key: 'operations', label: t('operations') },
    { key: 'hr', label: t('hr') },
    { key: 'sales', label: t('sales') },
  ]

  const current =
    tab === 'financial' ? financial : tab === 'operations' ? operations : tab === 'hr' ? hr : sales

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="h-9 rounded-md border border-gray-300 px-2 text-sm dark:border-gray-600 dark:bg-gray-700"
        />
        <span className="text-sm text-gray-500">→</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="h-9 rounded-md border border-gray-300 px-2 text-sm dark:border-gray-600 dark:bg-gray-700"
        />
        <a
          href={`/api/v1/reports/${tab}?from=${from}&to=${to}`}
          target="_blank"
          rel="noreferrer"
          className="ml-auto rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600"
        >
          {t('exportJson')}
        </a>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tb) => (
          <button
            key={tb.key}
            type="button"
            onClick={() => setTab(tb.key)}
            className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
              tab === tb.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        {current.isLoading ? (
          <div className="h-32 animate-pulse rounded bg-gray-100 dark:bg-gray-700" />
        ) : (
          <pre className="overflow-auto text-xs text-gray-700 dark:text-gray-300">
            {JSON.stringify(current.data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
