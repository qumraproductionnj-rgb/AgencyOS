'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import {
  useInvoice,
  useCreateInvoice,
  useUpdateInvoice,
  useClientsList,
} from '@/hooks/use-invoices'
import type { InvoiceItem } from '@/hooks/use-invoices'

interface Props {
  invoiceId: string | null
  onClose: () => void
}

function emptyItem(): InvoiceItem {
  return { description: '', quantity: 1, unitPrice: 0, currency: 'IQD', total: 0 }
}

export function InvoiceForm({ invoiceId, onClose }: Props) {
  const t = useTranslations('invoices')
  const tCommon = useTranslations('common')
  const { data: existing } = useInvoice(invoiceId ?? '')
  const { data: clients } = useClientsList()
  const createInvoice = useCreateInvoice()
  const updateInvoice = useUpdateInvoice()

  const [clientId, setClientId] = useState('')
  const [currency, setCurrency] = useState('IQD')
  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()])
  const [discountPercent, setDiscountPercent] = useState(0)
  const [taxPercent, setTaxPercent] = useState(0)
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (existing) {
      setClientId(existing.clientId)
      setCurrency(existing.currency)
      setItems(existing.items.length > 0 ? existing.items : [emptyItem()])
      setDiscountPercent(Number(existing.discountPercent ?? 0))
      setTaxPercent(Number(existing.taxPercent ?? 0))
      setDueDate(existing.dueDate ? existing.dueDate.slice(0, 10) : '')
      setNotes(existing.notes ?? '')
    }
  }, [existing])

  const updateItem = useCallback(
    (index: number, field: keyof InvoiceItem, value: string | number) => {
      setItems((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], [field]: value } as InvoiceItem
        if (field === 'quantity' || field === 'unitPrice') {
          next[index].total = Number(next[index].quantity ?? 0) * Number(next[index].unitPrice ?? 0)
        }
        return next
      })
    },
    [],
  )

  const addItem = useCallback(() => setItems((prev) => [...prev, emptyItem()]), [])
  const removeItem = useCallback(
    (index: number) => setItems((prev) => prev.filter((_, i) => i !== index)),
    [],
  )

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const discount = discountPercent > 0 ? Math.round(subtotal * (discountPercent / 100)) : 0
  const tax = taxPercent > 0 ? Math.round((subtotal - discount) * (taxPercent / 100)) : 0
  const total = subtotal - discount + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId) return

    const body = {
      clientId,
      currency,
      items,
      dueDate: new Date(dueDate).toISOString(),
      ...(discountPercent > 0 ? { discountPercent } : {}),
      ...(taxPercent > 0 ? { taxPercent } : {}),
      ...(notes ? { notes } : {}),
    }

    if (invoiceId) {
      await updateInvoice.mutateAsync({ id: invoiceId, ...body })
    } else {
      await createInvoice.mutateAsync(body)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-xl font-bold">{invoiceId ? t('editTitle') : t('createTitle')}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('selectClient')}</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            >
              <option value="">{t('selectClient')}</option>
              {clients?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.nameEn ? `(${c.nameEn})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
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
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">{t('dueDate')}</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">{t('lineItems')}</label>
              <button
                type="button"
                onClick={addItem}
                className="text-sm text-blue-600 hover:underline"
              >
                + {t('addItem')}
              </button>
            </div>
            {items.map((item, i) => (
              <div key={i} className="mb-2 flex gap-2">
                <input
                  value={item.description}
                  onChange={(e) => updateItem(i, 'description', e.target.value)}
                  placeholder={t('itemDescription')}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                  required
                  dir="auto"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                  className="w-16 rounded-md border border-gray-300 px-2 py-2 text-center text-sm"
                  min="1"
                />
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))}
                  className="w-24 rounded-md border border-gray-300 px-2 py-2 text-left text-sm"
                  min="0"
                  dir="auto"
                />
                <span className="flex items-center text-sm text-gray-600">
                  {item.total.toLocaleString()}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(i)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    &times;
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">{t('discountPercent')}</label>
              <input
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                min="0"
                max="100"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">{t('taxPercent')}</label>
              <input
                type="number"
                value={taxPercent}
                onChange={(e) => setTaxPercent(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                min="0"
                max="100"
              />
            </div>
          </div>

          <div className="rounded-md bg-gray-50 p-3 text-sm">
            <div className="flex justify-between py-1">
              <span>{t('subtotal')}</span>
              <span>
                {subtotal.toLocaleString()} {currency}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between py-1 text-red-600">
                <span>
                  {t('discount')} ({discountPercent}%)
                </span>
                <span>-{discount.toLocaleString()}</span>
              </div>
            )}
            {tax > 0 && (
              <div className="flex justify-between py-1">
                <span>
                  {t('tax')} ({taxPercent}%)
                </span>
                <span>+{tax.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between border-t py-1 pt-2 font-bold">
              <span>{t('total')}</span>
              <span>
                {total.toLocaleString()} {currency}
              </span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('notes')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              rows={3}
              dir="auto"
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
              disabled={createInvoice.isPending || updateInvoice.isPending}
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
