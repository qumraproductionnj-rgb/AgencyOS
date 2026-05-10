'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  useExpense,
  useCreateExpense,
  useUpdateExpense,
  useEmployeesList,
} from '@/hooks/use-expenses'

interface Props {
  expenseId: string | null
  onClose: () => void
}

export function ExpenseForm({ expenseId, onClose }: Props) {
  const t = useTranslations('expenses')
  const tCommon = useTranslations('common')
  const { data: existing } = useExpense(expenseId ?? '')
  const { data: employees } = useEmployeesList()
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()

  const [employeeId, setEmployeeId] = useState('')
  const [category, setCategory] = useState('operational')
  const [amount, setAmount] = useState(0)
  const [currency, setCurrency] = useState('IQD')
  const [description, setDescription] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10))

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

  useEffect(() => {
    if (existing) {
      setEmployeeId(existing.employeeId)
      setCategory(existing.category)
      setAmount(Number(existing.amount))
      setCurrency(existing.currency)
      setDescription(existing.description)
      setExpenseDate(existing.expenseDate ? existing.expenseDate.slice(0, 10) : '')
    }
  }, [existing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employeeId || !description) return

    const body = {
      employeeId,
      category,
      amount,
      currency,
      description,
      expenseDate: new Date(expenseDate).toISOString(),
    }

    if (expenseId) {
      await updateExpense.mutateAsync({ id: expenseId, ...body })
    } else {
      await createExpense.mutateAsync(body)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-xl font-bold">{expenseId ? t('editTitle') : t('createTitle')}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('employee')}</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            >
              <option value="">{t('selectEmployee')}</option>
              {employees?.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullNameAr || emp.fullNameEn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('category')}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(c)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">{t('amount')}</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                min="0"
                required
                dir="auto"
              />
            </div>
            <div className="w-24">
              <label className="mb-1 block text-sm font-medium">{t('currency')}</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="IQD">IQD</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              rows={3}
              required
              dir="auto"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('date')}</label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={createExpense.isPending || updateExpense.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {tCommon('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
