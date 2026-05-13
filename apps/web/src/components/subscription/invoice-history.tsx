'use client'

import { useTranslations } from 'next-intl'
import { ExternalLink } from 'lucide-react'
import { useInvoices, type InvoiceRecord } from '@/hooks/use-billing-data'

function formatAmount(inv: InvoiceRecord): string {
  if (inv.currency.toLowerCase() === 'iqd') {
    return `${Number(inv.amount).toLocaleString()} IQD`
  }
  return `$${(inv.amount / 100).toFixed(2)}`
}

export function InvoiceHistory() {
  const t = useTranslations('billing')
  const { data, isLoading } = useInvoices()

  if (isLoading) {
    return <div className="h-32 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
        {t('invoiceHistory')}
      </h2>
      {!data || data.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{t('noInvoices')}</p>
      ) : (
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-500 dark:text-gray-400">
              <th className="pb-2 font-medium">{t('invoiceDate')}</th>
              <th className="pb-2 font-medium">{t('invoiceAmount')}</th>
              <th className="pb-2 font-medium">{t('invoiceStatus')}</th>
              <th className="pb-2 text-right font-medium">{t('invoiceReceipt')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {data.map((inv) => (
              <tr key={inv.id}>
                <td className="py-2 text-gray-700 dark:text-gray-300">
                  {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : '—'}
                </td>
                <td className="py-2 font-medium">{formatAmount(inv)}</td>
                <td className="py-2">
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900 dark:text-green-200">
                    {inv.status}
                  </span>
                </td>
                <td className="py-2 text-right">
                  {inv.hostedUrl ? (
                    <a
                      href={inv.hostedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      {t('view')} <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
