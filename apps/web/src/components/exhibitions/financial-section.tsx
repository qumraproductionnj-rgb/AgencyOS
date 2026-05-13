'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useFinancials, useCreateFinancial, useDeleteFinancial } from '@/hooks/use-exhibitions'
import { format } from 'date-fns'

interface Props {
  exhibitionId: string
}

export function FinancialSection({ exhibitionId }: Props) {
  const t = useTranslations('exhibitions')
  const tCommon = useTranslations('common')
  const { data: financials, isLoading } = useFinancials(exhibitionId)
  const createFinancial = useCreateFinancial()
  const deleteFinancial = useDeleteFinancial()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    type: 'INCOME',
    category: 'CLIENT_PAYMENT',
    description: '',
    amount: '',
    currency: 'IQD',
    transactionDate: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createFinancial.mutateAsync({
      exhibitionId,
      data: {
        type: form.type,
        category: form.category,
        description: form.description || undefined,
        amount: parseInt(form.amount, 10),
        currency: form.currency,
        transactionDate: form.transactionDate,
      } as Record<string, unknown>,
    })
    setForm({
      type: 'INCOME',
      category: 'CLIENT_PAYMENT',
      description: '',
      amount: '',
      currency: 'IQD',
      transactionDate: '',
    })
    setShowForm(false)
  }

  const incomeTotal =
    financials?.filter((f) => f.type === 'INCOME').reduce((s, f) => s + Number(f.amount), 0) ?? 0
  const expenseTotal =
    financials?.filter((f) => f.type === 'EXPENSE').reduce((s, f) => s + Number(f.amount), 0) ?? 0

  if (isLoading) return <p className="text-muted-foreground">{tCommon('loading')}</p>

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm text-green-600 dark:text-green-400">{t('totalIncome')}</p>
          <p className="text-xl font-bold text-green-700 dark:text-green-300">
            {(incomeTotal / 1000).toFixed(1)}K IQD
          </p>
        </div>
        <div className="rounded-lg border bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{t('totalExpenses')}</p>
          <p className="text-xl font-bold text-red-700 dark:text-red-300">
            {(expenseTotal / 1000).toFixed(1)}K IQD
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t('entries')}</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          + {t('addEntry')}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-3 rounded-lg border bg-gray-50 p-4 dark:bg-gray-800/50"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium">{t('type')}</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value,
                    category: e.target.value === 'INCOME' ? 'CLIENT_PAYMENT' : 'VENUE_RENTAL',
                  })
                }
                className="mt-1 w-full rounded border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="INCOME">{t('income')}</option>
                <option value="EXPENSE">{t('expense')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium">{t('financialCategory')}</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="mt-1 w-full rounded border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                {(form.type === 'INCOME'
                  ? ['CLIENT_PAYMENT']
                  : [
                      'VENUE_RENTAL',
                      'CONSTRUCTION',
                      'LOGISTICS',
                      'STAFF',
                      'CONSUMABLES',
                      'FREELANCER',
                      'OTHER',
                    ]
                ).map((c) => (
                  <option key={c} value={c}>
                    {t(`finCategory_${c}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium">{t('description')}</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full rounded border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium">{t('amount')} *</label>
              <input
                type="number"
                required
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="mt-1 w-full rounded border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-xs font-medium">{t('currency_short')}</label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="mt-1 w-full rounded border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="IQD">IQD</option>
                <option value="USD">USD</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium">{t('transactionDate')} *</label>
              <input
                type="date"
                required
                value={form.transactionDate}
                onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
                className="mt-1 w-full rounded border px-2 py-1.5 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createFinancial.isPending}
              className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {tCommon('save')}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {tCommon('cancel')}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {financials?.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded border p-3 text-sm"
          >
            <div>
              <p className="font-medium">
                <span className={entry.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}>
                  {entry.type === 'INCOME' ? '+' : '-'}
                  {(Number(entry.amount) / 1000).toFixed(1)}K
                </span>
                <span className="ml-1">{entry.currency}</span>
              </p>
              <p className="text-muted-foreground text-xs">
                {t(`finCategory_${entry.category}`)}
                {entry.description && ` · ${entry.description}`}
                {entry.recorder?.employee?.fullNameAr && ` · ${entry.recorder.employee.fullNameAr}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">
                {format(new Date(entry.transactionDate), 'yyyy-MM-dd')}
              </span>
              <button
                onClick={() => deleteFinancial.mutate({ exhibitionId, financialId: entry.id })}
                className="text-xs text-red-600 hover:underline"
              >
                {tCommon('delete')}
              </button>
            </div>
          </div>
        ))}
        {(!financials || financials.length === 0) && (
          <p className="text-muted-foreground text-sm">{t('noEntries')}</p>
        )}
      </div>
    </div>
  )
}
