'use client'

import { useTranslations } from 'next-intl'
import { useQuotation, useUpdateQuotationStatus } from '@/hooks/use-quotations'

interface Props {
  quotationId: string
  onClose: () => void
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SENT: 'bg-blue-100 text-blue-700',
  ACCEPTED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-yellow-100 text-yellow-700',
}

export function QuotationDetail({ quotationId, onClose }: Props) {
  const t = useTranslations('quotations')
  const { data: q, isLoading } = useQuotation(quotationId)
  const updateStatus = useUpdateQuotationStatus()

  if (isLoading || !q) return null

  const formatCurrency = (value: number, currency: string) => {
    const sym = currency === 'IQD' ? 'د.ع' : currency === 'USD' ? '$' : currency
    return `${Number(value).toLocaleString()} ${sym}`
  }

  const items = (q.items ?? []) as {
    description: string
    quantity: number
    unitPrice: number
    total: number
  }[]

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{q.number}</h2>
            <p className="text-sm text-gray-500">{q.client?.name}</p>
          </div>
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

        <div className="mb-6">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[q.status]}`}
          >
            {t(q.status.toLowerCase())}
          </span>
        </div>

        {q.status === 'DRAFT' && (
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => updateStatus.mutate({ id: quotationId, status: 'SENT' })}
              disabled={updateStatus.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {t('send')}
            </button>
          </div>
        )}

        {q.status === 'SENT' && (
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => updateStatus.mutate({ id: quotationId, status: 'ACCEPTED' })}
              disabled={updateStatus.isPending}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {t('accept')}
            </button>
            <button
              onClick={() => {
                const reason = window.prompt(t('rejectionReason'))
                if (reason !== null)
                  updateStatus.mutate({
                    id: quotationId,
                    status: 'REJECTED',
                    ...(reason ? { rejectionReason: reason } : {}),
                  })
              }}
              disabled={updateStatus.isPending}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {t('reject')}
            </button>
          </div>
        )}

        <div className="mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-3 py-2 text-right">{t('item')}</th>
                <th className="px-3 py-2 text-right">{t('quantity')}</th>
                <th className="px-3 py-2 text-right">{t('unitPrice')}</th>
                <th className="px-3 py-2 text-right">{t('total')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="px-3 py-2">{item.description}</td>
                  <td className="px-3 py-2">{item.quantity}</td>
                  <td className="px-3 py-2">{formatCurrency(item.unitPrice, q.currency)}</td>
                  <td className="px-3 py-2 font-medium">
                    {formatCurrency(item.total, q.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 space-y-1 border-t pt-3 text-sm">
            <div className="flex justify-between">
              <span>{t('subtotal')}</span>
              <span>{formatCurrency(Number(q.subtotal), q.currency)}</span>
            </div>
            {q.discountPercent && Number(q.discountPercent) > 0 && (
              <div className="flex justify-between text-red-600">
                <span>
                  {t('discount')} ({Number(q.discountPercent)}%)
                </span>
                <span>-{formatCurrency(Number(q.discountAmount), q.currency)}</span>
              </div>
            )}
            {q.taxPercent && Number(q.taxPercent) > 0 && (
              <div className="flex justify-between">
                <span>
                  {t('tax')} ({Number(q.taxPercent)}%)
                </span>
                <span>+{formatCurrency(Number(q.taxAmount), q.currency)}</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2 text-base font-bold">
              <span>{t('total')}</span>
              <span>{formatCurrency(Number(q.total), q.currency)}</span>
            </div>
          </div>
        </div>

        {q.validUntil && (
          <p className="mb-4 text-sm text-gray-500">
            <strong>{t('validUntil')}:</strong> {new Date(q.validUntil).toLocaleDateString()}
          </p>
        )}

        {q.notes && (
          <div className="mb-4 rounded-md bg-gray-50 p-3 text-sm">
            <strong>{t('notes')}:</strong>
            <p className="mt-1 whitespace-pre-wrap">{q.notes}</p>
          </div>
        )}

        {q.sentAt && (
          <p className="text-xs text-gray-400">
            {t('sentAt')}: {new Date(q.sentAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  )
}
