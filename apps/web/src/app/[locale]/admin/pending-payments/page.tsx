'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, Check, X } from 'lucide-react'
import {
  usePendingPayments,
  useApprovePayment,
  useRejectPayment,
  type PaymentIntent,
} from '@/hooks/use-local-billing'

export default function PendingPaymentsAdminPage() {
  const t = useTranslations('billing')
  const { data: pending, isLoading } = usePendingPayments()
  const approve = useApprovePayment()
  const reject = useRejectPayment()
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  async function handleApprove(intent: PaymentIntent) {
    await approve.mutateAsync(intent.id)
  }

  async function handleReject(intent: PaymentIntent) {
    if (rejectionReason.trim().length < 3) return
    await reject.mutateAsync({ intentId: intent.id, reason: rejectionReason.trim() })
    setRejectingId(null)
    setRejectionReason('')
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {t('pendingPaymentsTitle')}
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">{t('pendingPaymentsDescription')}</p>

      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      ) : !pending || pending.length === 0 ? (
        <p className="rounded-lg border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800">
          {t('noPendingPayments')}
        </p>
      ) : (
        <div className="space-y-3">
          {pending.map((intent) => (
            <div
              key={intent.id}
              className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {Number(intent.amount).toLocaleString()} IQD · {intent.interval}
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t('intentId')}: <span className="font-mono">{intent.id}</span>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('bankReference')}: {intent.bankReference ?? '—'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t('submittedAt')}: {new Date(intent.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleApprove(intent)}
                    disabled={approve.isPending}
                    className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check className="h-4 w-4" />
                    {t('approve')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRejectingId(intent.id)}
                    className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                  >
                    <X className="h-4 w-4" />
                    {t('reject')}
                  </button>
                </div>
              </div>

              {rejectingId === intent.id && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder={t('rejectionReasonPlaceholder')}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleReject(intent)}
                    disabled={reject.isPending || rejectionReason.trim().length < 3}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {reject.isPending ? (
                      <Loader2 className="inline h-4 w-4 animate-spin" />
                    ) : (
                      t('confirmReject')
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRejectingId(null)
                      setRejectionReason('')
                    }}
                    className="rounded-md px-3 py-1.5 text-sm text-gray-700 dark:text-gray-200"
                  >
                    {t('cancelConfirmNo')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
