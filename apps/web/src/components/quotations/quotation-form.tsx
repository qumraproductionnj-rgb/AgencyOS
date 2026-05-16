'use client'

import { useEffect, useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import {
  useQuotation,
  useCreateQuotation,
  useUpdateQuotation,
  useClientsList,
} from '@/hooks/use-quotations'
import type { QuotationItem } from '@/hooks/use-quotations'
import { QuotationSchema } from '@/lib/schemas/quotation.schema'
import type { QuotationFormValues } from '@/lib/schemas/quotation.schema'
import { FieldError } from '@/components/FieldError'

interface Props {
  quotationId: string | null
  onClose: () => void
}

function emptyItem(): QuotationItem {
  return { description: '', quantity: 1, unitPrice: 0, currency: 'IQD', total: 0 }
}

export function QuotationForm({ quotationId, onClose }: Props) {
  const t = useTranslations('quotations')
  const tCommon = useTranslations('common')
  const { data: existing } = useQuotation(quotationId ?? '')
  const { data: clients } = useClientsList()
  const create = useCreateQuotation()
  const update = useUpdateQuotation()

  const [items, setItems] = useState<QuotationItem[]>([emptyItem()])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuotationFormValues>({
    resolver: zodResolver(QuotationSchema),
    defaultValues: {
      clientId: '',
      currency: 'IQD',
      items: [emptyItem()],
      discountPercent: 0,
      taxPercent: 0,
      validUntil: '',
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
        discountPercent: existing.discountPercent ?? 0,
        taxPercent: existing.taxPercent ?? 0,
        validUntil: existing.validUntil ?? '',
        notes: existing.notes ?? '',
      })
    }
  }, [existing, reset])

  const updateItem = useCallback(
    (index: number, field: keyof QuotationItem, value: string | number) => {
      setItems((prev) => {
        const next = [...prev]
        next[index] = { ...next[index], [field]: value } as QuotationItem
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
  const discountAmt = discountPercent > 0 ? Math.round(subtotal * (discountPercent / 100)) : 0
  const taxAmt = taxPercent > 0 ? Math.round((subtotal - discountAmt) * (taxPercent / 100)) : 0
  const grandTotal = subtotal - discountAmt + taxAmt

  const onSubmit = async (data: QuotationFormValues) => {
    const payload = {
      clientId: data.clientId,
      currency: data.currency,
      items: items.filter((i) => i.description.trim()),
      ...(data.discountPercent ? { discountPercent: data.discountPercent } : {}),
      ...(data.taxPercent ? { taxPercent: data.taxPercent } : {}),
      ...(data.validUntil ? { validUntil: data.validUntil } : {}),
      ...(data.notes ? { notes: data.notes } : {}),
    }
    if (quotationId) {
      await update.mutateAsync({ id: quotationId, ...payload })
    } else {
      await create.mutateAsync(payload)
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">
          {quotationId ? t('editTitle') : t('createTitle')}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t('client')} *</label>
              <select
                {...register('clientId')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">{t('selectClient')}</option>
                {(clients ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.nameEn ? `(${c.nameEn})` : ''}
                  </option>
                ))}
              </select>
              <FieldError message={errors.clientId?.message} />
            </div>
            <div>
              <label className="text-sm font-medium">{t('currency')}</label>
              <select
                {...register('currency')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="IQD">IQD - د.ع</option>
                <option value="USD">USD - $</option>
              </select>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">{t('lineItems')}</label>
              <button
                type="button"
                onClick={addItem}
                className="text-xs text-blue-600 hover:underline"
              >
                + {t('addItem')}
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-2 rounded-md border p-2">
                  <div className="flex-1">
                    <input
                      value={item.description}
                      onChange={(e) => updateItem(i, 'description', e.target.value)}
                      placeholder={t('itemDescription')}
                      className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                      dir="auto"
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))}
                      min={1}
                      className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))}
                      min={0}
                      className="w-full rounded border border-gray-200 px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="w-28 py-1 text-right text-sm font-medium">
                    {item.total.toLocaleString()}
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="text-red-400 hover:text-red-600"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>
            <FieldError message={errors.items?.message as string | undefined} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">{t('discountPercent')}</label>
              <input
                type="number"
                {...register('discountPercent', { valueAsNumber: true })}
                min={0}
                max={100}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <FieldError message={errors.discountPercent?.message} />
            </div>
            <div>
              <label className="text-sm font-medium">{t('taxPercent')}</label>
              <input
                type="number"
                {...register('taxPercent', { valueAsNumber: true })}
                min={0}
                max={100}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <FieldError message={errors.taxPercent?.message} />
            </div>
            <div>
              <label className="text-sm font-medium">{t('validUntil')}</label>
              <input
                type="date"
                {...register('validUntil')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <FieldError message={errors.validUntil?.message} />
            </div>
          </div>

          <div className="rounded-md bg-gray-50 p-4">
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>{t('subtotal')}</span>
                <span>
                  {subtotal.toLocaleString()} {currency}
                </span>
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>
                    {t('discount')} ({discountPercent}%)
                  </span>
                  <span>
                    -{discountAmt.toLocaleString()} {currency}
                  </span>
                </div>
              )}
              {taxPercent > 0 && (
                <div className="flex justify-between">
                  <span>
                    {t('tax')} ({taxPercent}%)
                  </span>
                  <span>
                    +{taxAmt.toLocaleString()} {currency}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 text-lg font-bold">
                <span>{t('total')}</span>
                <span>
                  {grandTotal.toLocaleString()} {currency}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">{t('notes')}</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
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
