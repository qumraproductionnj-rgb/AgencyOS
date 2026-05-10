'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { usePayrollRuns } from '@/hooks/use-payroll'
import { PayrollRunDetail } from './payroll-run-detail'
import { PayrollGenerateModal } from './payroll-generate-modal'

export function PayrollPage() {
  const t = useTranslations('payroll')
  const tCommon = useTranslations('common')
  const { data: runs, isLoading } = usePayrollRuns()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showGenerate, setShowGenerate] = useState(false)

  const statusColor: Record<string, string> = {
    DRAFT: 'text-yellow-600 bg-yellow-50',
    FINALIZED: 'text-green-600 bg-green-50',
    PAID: 'text-blue-600 bg-blue-50',
  }

  const getStatusLabel = (status: string) => t(status.toLowerCase())
  const formatCurrency = (amount: number | bigint, currency: string) => {
    const num = typeof amount === 'bigint' ? Number(amount) : amount
    return `${(num / 100).toLocaleString()} ${currency}`
  }

  if (selectedId) {
    return <PayrollRunDetail runId={selectedId} onBack={() => setSelectedId(null)} />
  }

  if (isLoading) return <p className="text-muted-foreground p-4">{tCommon('loading')}</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <button
          onClick={() => setShowGenerate(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + {t('generate')}
        </button>
      </div>

      {!runs?.length ? (
        <p className="text-muted-foreground p-8 text-center">{t('noRuns')}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t('month')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('year')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('status')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('totalAmount')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('currency')}</th>
                <th className="px-4 py-3 text-right">{tCommon('edit')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {runs.map((run) => (
                <tr key={run.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{t(`monthNames.${run.month}`)}</td>
                  <td className="px-4 py-3">{run.year}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusColor[run.status] ?? ''
                      }`}
                    >
                      {getStatusLabel(run.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{formatCurrency(run.totalAmount, run.currency)}</td>
                  <td className="px-4 py-3">{run.currency}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setSelectedId(run.id)}
                      className="text-blue-600 hover:underline"
                    >
                      {tCommon('edit')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showGenerate && <PayrollGenerateModal onClose={() => setShowGenerate(false)} />}
    </div>
  )
}
