'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGeneratePayroll } from '@/hooks/use-payroll'

interface Props {
  onClose: () => void
}

export function PayrollGenerateModal({ onClose }: Props) {
  const t = useTranslations('payroll')
  const tCommon = useTranslations('common')
  const generate = useGeneratePayroll()

  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [error, setError] = useState('')

  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i)

  const handleSubmit = async () => {
    setError('')
    try {
      await generate.mutateAsync({ month, year })
      onClose()
    } catch (err) {
      setError((err as Error).message || tCommon('error'))
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">{t('generateTitle')}</h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">{t('month')}</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {t(`monthNames.${m}`)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">{t('year')}</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            {tCommon('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={generate.isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {generate.isPending ? tCommon('loading') : t('generate')}
          </button>
        </div>
      </div>
    </div>
  )
}
