'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useInvoice, useSendInvoice } from '@/hooks/use-invoices'
import { PaymentModal } from './payment-modal'

interface Props {
  invoiceId: string
  onClose: () => void
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SENT: 'bg-blue-100 text-blue-700',
  OVERDUE: 'bg-red-100 text-red-700',
  PARTIALLY_PAID: 'bg-yellow-100 text-yellow-700',
  PAID: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500 line-through',
  REFUNDED: 'bg-purple-100 text-purple-700',
}

export function InvoiceDetail({ invoiceId, onClose }: Props) {
  const t = useTranslations('invoices')
  const { data: inv, isLoading } = useInvoice(invoiceId)
  const sendInvoice = useSendInvoice()
  const [paymentOpen, setPaymentOpen] = useState(false)

  if (isLoading || !inv) return null

  const formatCurrency = (value: number, currency: string) => {
    const sym = currency === 'IQD' ? 'د.ع' : currency === 'USD' ? '$' : currency
    return `${Number(value).toLocaleString()} ${sym}`
  }

  const items = (inv.items ?? []) as InvoiceItem[]
  const canRecordPayment = ['SENT', 'PARTIALLY_PAID', 'OVERDUE'].includes(inv.status)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{inv.number}</h2>
            <p className="text-sm text-gray-500">{inv.client?.name}</p>
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

        <div className="mb-4 flex items-center gap-2">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[inv.status]}`}
          >
            {t(inv.status.toLowerCase() as string)}
          </span>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">{t('dueDate')}</p>
            <p className="font-medium">{new Date(inv.dueDate).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-500">{t('issuedDate')}</p>
            <p className="font-medium">{new Date(inv.createdAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-500">{t('paidAmount')}</p>
            <p className="font-medium text-green-600">
              {formatCurrency(Number(inv.paidAmount), inv.currency)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">{t('balanceDue')}</p>
            <p
              className={`font-medium ${Number(inv.balanceDue) > 0 ? 'text-red-600' : 'text-green-600'}`}
            >
              {formatCurrency(Number(inv.balanceDue), inv.currency)}
            </p>
          </div>
        </div>

        {inv.status === 'DRAFT' && (
          <div className="mb-4 flex gap-2">
            <button
              onClick={() => sendInvoice.mutate(invoiceId)}
              disabled={sendInvoice.isPending}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {t('send')}
            </button>
          </div>
        )}

        {canRecordPayment && (
          <div className="mb-4">
            <button
              onClick={() => setPaymentOpen(true)}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              {t('recordPayment')}
            </button>
          </div>
        )}

        <div className="mb-6">
          <h3 className="mb-2 text-sm font-medium text-gray-500">{t('lineItems')}</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left font-medium">{t('itemDescription')}</th>
                <th className="py-2 text-center font-medium">{t('quantity')}</th>
                <th className="py-2 text-right font-medium">{t('unitPrice')}</th>
                <th className="py-2 text-right font-medium">{t('total')}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="py-2">{item.description}</td>
                  <td className="py-2 text-center">{item.quantity}</td>
                  <td className="py-2 text-right">
                    {formatCurrency(item.unitPrice, inv.currency)}
                  </td>
                  <td className="py-2 text-right font-medium">
                    {formatCurrency(item.quantity * item.unitPrice, inv.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-6 ml-auto w-full max-w-xs space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">{t('subtotal')}</span>
            <span>{formatCurrency(Number(inv.subtotal), inv.currency)}</span>
          </div>
          {inv.discountPercent && Number(inv.discountPercent) > 0 && (
            <div className="flex justify-between text-red-600">
              <span>
                {t('discount')} ({Number(inv.discountPercent)}%)
              </span>
              <span>-{formatCurrency(Number(inv.discountAmount), inv.currency)}</span>
            </div>
          )}
          {inv.taxPercent && Number(inv.taxPercent) > 0 && (
            <div className="flex justify-between">
              <span>
                {t('tax')} ({Number(inv.taxPercent)}%)
              </span>
              <span>+{formatCurrency(Number(inv.taxAmount), inv.currency)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-1 font-bold">
            <span>{t('total')}</span>
            <span>{formatCurrency(Number(inv.total), inv.currency)}</span>
          </div>
          <div className="flex justify-between text-green-600">
            <span>{t('paidAmount')}</span>
            <span>-{formatCurrency(Number(inv.paidAmount), inv.currency)}</span>
          </div>
          <div
            className={`flex justify-between font-bold ${Number(inv.balanceDue) > 0 ? 'text-red-600' : 'text-green-600'}`}
          >
            <span>{t('balanceDue')}</span>
            <span>{formatCurrency(Number(inv.balanceDue), inv.currency)}</span>
          </div>
        </div>

        {inv.notes && (
          <div className="mb-4 rounded-md bg-gray-50 p-3 text-sm">
            <strong className="text-gray-500">{t('notes')}:</strong>
            <p className="mt-1">{inv.notes}</p>
          </div>
        )}

        {inv.payments && inv.payments.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-2 text-sm font-medium text-gray-500">{t('recordPayment')}</h3>
            <div className="space-y-2">
              {inv.payments.map((p) => (
                <div key={p.id} className="rounded-md border p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">
                      {formatCurrency(Number(p.amount), p.currency)}
                    </span>
                    <span className="text-gray-500">{t(p.method)}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {new Date(p.paidAt).toLocaleDateString()}
                    {p.referenceNo && ` — ${t('paymentReference')}: ${p.referenceNo}`}
                  </div>
                  {p.notes && <p className="mt-1 text-xs text-gray-500">{p.notes}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {paymentOpen && (
        <PaymentModal
          invoiceId={invoiceId}
          currency={inv.currency}
          onClose={() => setPaymentOpen(false)}
        />
      )}
    </div>
  )
}

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
}
