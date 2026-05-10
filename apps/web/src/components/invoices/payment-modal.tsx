'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRecordPayment } from '@/hooks/use-invoices'

interface Props {
  invoiceId: string
  currency: string
  onClose: () => void
}

export function PaymentModal({ invoiceId, currency, onClose }: Props) {
  const t = useTranslations('invoices')
  const tCommon = useTranslations('common')
  const recordPayment = useRecordPayment()

  const [amount, setAmount] = useState(0)
  const [method, setMethod] = useState('bank_transfer')
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10))
  const [referenceNo, setReferenceNo] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (amount <= 0) return

    await recordPayment.mutateAsync({
      id: invoiceId,
      amount,
      currency,
      method,
      paidAt: new Date(paidAt).toISOString(),
      ...(referenceNo ? { referenceNo } : {}),
      ...(notes ? { notes } : {}),
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-bold">{t('recordPayment')}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('paymentAmount')}</label>
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

          <div>
            <label className="mb-1 block text-sm font-medium">{t('paymentMethod')}</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="cash">{t('cash')}</option>
              <option value="bank_transfer">{t('bankTransfer')}</option>
              <option value="stripe">{t('stripe')}</option>
              <option value="zaincash">{t('zaincash')}</option>
              <option value="fastpay">{t('fastpay')}</option>
              <option value="fib">{t('fib')}</option>
              <option value="other">{t('other')}</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('paymentDate')}</label>
            <input
              type="date"
              value={paidAt}
              onChange={(e) => setPaidAt(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('paymentReference')}</label>
            <input
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('notes')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              rows={2}
              dir="auto"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={recordPayment.isPending}
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
