'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useInvoices, useSendInvoice, useDeleteInvoice } from '@/hooks/use-invoices'
import { InvoiceForm } from './invoice-form'
import { InvoiceDetail } from './invoice-detail'

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'draft',
  SENT: 'sent',
  OVERDUE: 'overdue',
  PARTIALLY_PAID: 'partiallyPaid',
  PAID: 'paid',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
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

export function InvoiceList() {
  const t = useTranslations('invoices')
  const tCommon = useTranslations('common')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const { data: invoices, isLoading } = useInvoices({
    ...(search ? { search } : {}),
    ...(filterStatus ? { status: filterStatus } : {}),
  })
  const sendInvoice = useSendInvoice()
  const deleteInvoice = useDeleteInvoice()
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

      {!invoices?.length ? (
        <p className="text-muted-foreground p-8 text-center">{t('noInvoices')}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t('number')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('client')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('total')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('status')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('dueDate')}</th>
                <th className="px-4 py-3 text-right font-medium">{tCommon('edit')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => setDetailId(inv.id)}
                >
                  <td className="px-4 py-3 font-medium">{inv.number}</td>
                  <td className="px-4 py-3">{inv.client?.name || '—'}</td>
                  <td className="px-4 py-3">{formatCurrency(Number(inv.total), inv.currency)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[inv.status]}`}
                    >
                      {t(STATUS_LABELS[inv.status])}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(inv.dueDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {inv.status === 'DRAFT' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            sendInvoice.mutate(inv.id)
                          }}
                          className="text-green-600 hover:underline"
                        >
                          {t('send')}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditId(inv.id)
                            setFormOpen(true)
                          }}
                          className="ml-3 text-blue-600 hover:underline"
                        >
                          {tCommon('edit')}
                        </button>
                      </>
                    )}
                    {inv.status === 'DRAFT' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (window.confirm(t('deleteConfirm'))) deleteInvoice.mutate(inv.id)
                        }}
                        className="ml-3 text-red-500 hover:underline"
                      >
                        {tCommon('delete')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formOpen && (
        <InvoiceForm
          invoiceId={editId}
          onClose={() => {
            setFormOpen(false)
            setEditId(null)
          }}
        />
      )}

      {detailId && <InvoiceDetail invoiceId={detailId} onClose={() => setDetailId(null)} />}
    </div>
  )
}
