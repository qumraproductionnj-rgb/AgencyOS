'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useExpenses, useDeleteExpense } from '@/hooks/use-expenses'
import { ExpenseForm } from './expense-modal'
import { ExpenseDetail } from './expense-detail'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REIMBURSED: 'reimbursed',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  REIMBURSED: 'bg-blue-100 text-blue-700',
}

const CATEGORIES = [
  'production',
  'equipment_rental',
  'advertising',
  'freelancer_payment',
  'operational',
  'travel',
  'software',
  'other',
]

export function ExpenseList() {
  const t = useTranslations('expenses')
  const tCommon = useTranslations('common')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const { data: expenses, isLoading } = useExpenses({
    ...(search ? { search } : {}),
    ...(filterStatus ? { status: filterStatus } : {}),
    ...(filterCategory ? { category: filterCategory } : {}),
  })
  const deleteExpense = useDeleteExpense()
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)

  if (isLoading) return <p className="text-muted-foreground p-4">{tCommon('loading')}</p>

  const formatCurrency = (value: number, currency: string) => {
    const sym = currency === 'IQD' ? 'د.ع' : currency === 'USD' ? '$' : currency
    return `${value.toLocaleString()} ${sym}`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="w-48 rounded-md border border-gray-300 px-3 py-2 text-sm"
            dir="auto"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">{tCommon('all')}</option>
            {Object.keys(STATUS_LABELS).map((s) => (
              <option key={s} value={s}>
                {t(STATUS_LABELS[s])}
              </option>
            ))}
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">{tCommon('all')}</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {t(c)}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setEditId(null)
              setFormOpen(true)
            }}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + {t('createTitle')}
          </button>
        </div>
      </div>

      {!expenses?.length ? (
        <p className="text-muted-foreground p-8 text-center">{t('noExpenses')}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t('description')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('employee')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('category')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('amount')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('status')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('date')}</th>
                <th className="px-4 py-3 text-right font-medium">{tCommon('edit')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {expenses.map((exp) => (
                <tr
                  key={exp.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => setDetailId(exp.id)}
                >
                  <td className="max-w-[200px] truncate px-4 py-3 font-medium">
                    {exp.description}
                  </td>
                  <td className="px-4 py-3">
                    {exp.employee?.fullNameAr || exp.employee?.fullNameEn || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500">{t(exp.category)}</span>
                  </td>
                  <td className="px-4 py-3">{formatCurrency(Number(exp.amount), exp.currency)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[exp.status]}`}
                    >
                      {t(STATUS_LABELS[exp.status])}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(exp.expenseDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {exp.status === 'PENDING' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditId(exp.id)
                            setFormOpen(true)
                          }}
                          className="text-blue-600 hover:underline"
                        >
                          {tCommon('edit')}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (window.confirm(t('deleteConfirm'))) deleteExpense.mutate(exp.id)
                          }}
                          className="ml-3 text-red-500 hover:underline"
                        >
                          {tCommon('delete')}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <ExpenseForm
          expenseId={editId}
          onClose={() => {
            setFormOpen(false)
            setEditId(null)
          }}
        />
      )}

      {detailId && <ExpenseDetail expenseId={detailId} onClose={() => setDetailId(null)} />}
    </div>
  )
}
