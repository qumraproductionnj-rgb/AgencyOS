'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2, Upload, Check, Hourglass } from 'lucide-react'
import { useSubmitManualReceipt, type PaymentIntentStatus } from '@/hooks/use-local-billing'

interface Props {
  intentId: string
  status: PaymentIntentStatus
}

const MANUAL_BANK_HINT = {
  bankName: 'Iraqi Trade Bank',
  iban: 'IQ00 BANK 0000 0000 0000 0000',
  swift: 'IBANIQBA',
  accountNumber: '0000-0000-0000-0000',
}

export function ManualPaymentSubmit({ intentId, status }: Props) {
  const t = useTranslations('billing')
  const submit = useSubmitManualReceipt(intentId)
  const [bankReference, setBankReference] = useState('')
  const [receiptFileId, setReceiptFileId] = useState('')

  async function handleSubmit() {
    if (!receiptFileId.trim() || bankReference.trim().length < 3) return
    await submit.mutateAsync({
      receiptFileId: receiptFileId.trim(),
      bankReference: bankReference.trim(),
    })
  }

  if (status === 'AWAITING_VERIFICATION') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/40">
        <Hourglass className="mb-2 h-6 w-6 text-amber-600" />
        <h2 className="text-base font-semibold text-amber-900 dark:text-amber-100">
          {t('awaitingVerification')}
        </h2>
        <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
          {t('awaitingVerificationBody')}
        </p>
      </div>
    )
  }

  if (status === 'PAID') {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950/40">
        <Check className="mb-2 h-6 w-6 text-green-600" />
        <h2 className="text-base font-semibold text-green-900 dark:text-green-100">
          {t('paymentApproved')}
        </h2>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
        {t('bankDetails')}
      </h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('bankDetailsHint')}</p>

      <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-gray-500">{t('bankName')}</dt>
          <dd className="font-medium text-gray-900 dark:text-gray-100">
            {MANUAL_BANK_HINT.bankName}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">{t('iban')}</dt>
          <dd className="font-mono text-gray-900 dark:text-gray-100">{MANUAL_BANK_HINT.iban}</dd>
        </div>
        <div>
          <dt className="text-gray-500">{t('swift')}</dt>
          <dd className="font-mono text-gray-900 dark:text-gray-100">{MANUAL_BANK_HINT.swift}</dd>
        </div>
        <div>
          <dt className="text-gray-500">{t('accountNumber')}</dt>
          <dd className="font-mono text-gray-900 dark:text-gray-100">
            {MANUAL_BANK_HINT.accountNumber}
          </dd>
        </div>
      </dl>

      <hr className="my-5 border-gray-200 dark:border-gray-700" />

      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {t('submitReceiptTitle')}
      </h3>
      <div className="mt-3 space-y-3">
        <div>
          <label className="block text-xs text-gray-500" htmlFor="bank-ref">
            {t('bankReference')}
          </label>
          <input
            id="bank-ref"
            type="text"
            value={bankReference}
            onChange={(e) => setBankReference(e.target.value)}
            placeholder="TXN-12345"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500" htmlFor="receipt-id">
            {t('receiptFileId')}
          </label>
          <input
            id="receipt-id"
            type="text"
            value={receiptFileId}
            onChange={(e) => setReceiptFileId(e.target.value)}
            placeholder="UUID from /files upload"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 font-mono text-sm dark:border-gray-600 dark:bg-gray-700"
          />
          <p className="mt-1 text-xs text-gray-400">{t('receiptUploadHint')}</p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submit.isPending || !receiptFileId.trim() || bankReference.trim().length < 3}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submit.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {t('submitReceipt')}
        </button>

        {submit.isError && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {(submit.error as Error).message}
          </p>
        )}
      </div>
    </div>
  )
}
