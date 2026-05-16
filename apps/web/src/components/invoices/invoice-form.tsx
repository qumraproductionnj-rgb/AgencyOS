'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import {
  useInvoice,
  useCreateInvoice,
  useUpdateInvoice,
  useClientsList,
} from '@/hooks/use-invoices'
import type { InvoiceItem } from '@/hooks/use-invoices'
import { InvoiceSchema } from '@/lib/schemas/invoice.schema'
import type { InvoiceFormValues } from '@/lib/schemas/invoice.schema'
import { FieldError } from '@/components/FieldError'

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

  const [items, setItems] = useState<InvoiceItem[]>([emptyItem()])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(InvoiceSchema),
    defaultValues: {
      clientId: '',
      currency: 'IQD',
      items: [emptyItem()],
      discountPercent: 0,
      taxPercent: 0,
      dueDate: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (existing) {
      const populated = existing.items.length > 0 ? existing.items : [emptyItem()]
      setItems(populated)
      reset({
        clientId: existing.clientId,
        currency: existing.currency as 'IQD' | 'USD',
        items: populated,
        discountPercent: Number(existing.discountPercent ?? 0),
        taxPercent: Number(existing.taxPercent ?? 0),
        dueDate: existing.dueDate ? existing.dueDate.slice(0, 10) : '',
        notes: existing.notes ?? '',
      })
    }
  }, [existing, reset])

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

  const discountPercent = watch('discountPercent') ?? 0
  const taxPercent = watch('taxPercent') ?? 0
  const currency = watch('currency') ?? 'IQD'

  const subtotal = items.reduce((sum, item) => sum + item.total, 0)
  const discount = discountPercent > 0 ? Math.round(subtotal * (discountPercent / 100)) : 0
  const tax = taxPercent > 0 ? Math.round((subtotal - discount) * (taxPercent / 100)) : 0
  const total = subtotal - discount + tax

  const onSubmit = async (data: InvoiceFormValues) => {
    const body = {
      clientId: data.clientId,
      currency: data.currency,
      items,
      dueDate: new Date(data.dueDate).toISOString(),
      ...(data.discountPercent ? { discountPercent: data.discountPercent } : {}),
      ...(data.taxPercent ? { taxPercent: data.taxPercent } : {}),
      ...(data.notes ? { notes: data.notes } : {}),
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('selectClient')}</label>
            <select
              {...register('clientId')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">{t('selectClient')}</option>
              {clients?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.nameEn ? `(${c.nameEn})` : ''}
                </option>
              ))}
            </select>
            <FieldError message={errors.clientId?.message} />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">{t('currency')}</label>
              <select
                {...register('currency')}
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
                {...register('dueDate')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <FieldError message={errors.dueDate?.message} />
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
            <FieldError message={errors.items?.message as string | undefined} />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">{t('discountPercent')}</label>
              <input
                type="number"
                {...register('discountPercent', { valueAsNumber: true })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                min="0"
                max="100"
              />
              <FieldError message={errors.discountPercent?.message} />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">{t('taxPercent')}</label>
              <input
                type="number"
                {...register('taxPercent', { valueAsNumber: true })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                min="0"
                max="100"
              />
              <FieldError message={errors.taxPercent?.message} />
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
              {...register('notes')}
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
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? tCommon('saving') : tCommon('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
