'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useExpense, useApproveExpense } from '@/hooks/use-expenses'

interface Props {
  expenseId: string
  onClose: () => void
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  REIMBURSED: 'bg-blue-100 text-blue-700',
}

export function ExpenseDetail({ expenseId, onClose }: Props) {
  const t = useTranslations('expenses')
  const tCommon = useTranslations('common')
  const { data: exp, isLoading } = useExpense(expenseId)
  const approveExpense = useApproveExpense()
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)

  if (isLoading || !exp) return null

  const formatCurrency = (value: number, currency: string) => {
    const sym = currency === 'IQD' ? 'د.ع' : currency === 'USD' ? '$' : currency
    return `${Number(value).toLocaleString()} ${sym}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">{t('expense')}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <span
          className={`mb-4 inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[exp.status]}`}
        >
          {t(exp.status.toLowerCase() as string)}
        </span>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">{t('description')}</span>
            <span className="font-medium">{exp.description}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">{t('employee')}</span>
            <span className="font-medium">
              {exp.employee?.fullNameAr || exp.employee?.fullNameEn || '—'}
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">{t('category')}</span>
            <span className="font-medium">{t(exp.category)}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">{t('amount')}</span>
            <span className="font-medium">{formatCurrency(Number(exp.amount), exp.currency)}</span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">{t('date')}</span>
            <span className="font-medium">{new Date(exp.expenseDate).toLocaleDateString()}</span>
          </div>
          {exp.receiptUrl && (
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">{t('receipt')}</span>
              <a
                href={exp.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {t('viewReceipt')}
              </a>
            </div>
          )}
          {exp.approver && (
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">{t('approvedBy')}</span>
              <span className="font-medium">{exp.approver.email}</span>
            </div>
          )}
          {exp.rejectionReason && (
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">{t('rejectionReason')}</span>
              <span className="font-medium text-red-600">{exp.rejectionReason}</span>
            </div>
          )}
        </div>

        {exp.status === 'PENDING' && (
          <div className="mt-6 space-y-3">
            <button
              onClick={() => approveExpense.mutate({ id: expenseId, status: 'APPROVED' })}
              disabled={approveExpense.isPending}
              className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {t('approve')}
            </button>
            {!showRejectInput ? (
              <button
                onClick={() => setShowRejectInput(true)}
                className="w-full rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                {t('reject')}
              </button>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder={t('rejectionReason')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  rows={2}
                  dir="auto"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      approveExpense.mutate({
                        id: expenseId,
                        status: 'REJECTED',
                        ...(rejectReason ? { rejectionReason: rejectReason } : {}),
                      })
                      setShowRejectInput(false)
                    }}
                    disabled={approveExpense.isPending}
                    className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {t('confirmReject')}
                  </button>
                  <button
                    onClick={() => setShowRejectInput(false)}
                    className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    {tCommon('cancel')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
