'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useCreateEquipment, useUpdateEquipment } from '@/hooks/use-equipment'

export interface EquipmentModalProps {
  open: boolean
  onClose: () => void
  editItem: {
    id: string
    name: string
    category: string
    brand: string | null
    model: string | null
    serialNumber: string | null
    purchaseDate: string | null
    purchasePrice: number | null
    currency: string | null
    condition: string
  } | null
}

const CATEGORIES = ['CAMERA', 'LENS', 'LIGHTING', 'AUDIO', 'GRIP', 'COMPUTER', 'OTHER'] as const
const CONDITIONS = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'] as const

export function EquipmentModal({ open, onClose, editItem }: EquipmentModalProps) {
  const tCommon = useTranslations('common')
  const t = useTranslations('equipment')
  const createEquipment = useCreateEquipment()
  const updateEquipment = useUpdateEquipment()
  const [form, setForm] = useState({
    name: '',
    category: 'CAMERA',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    currency: 'IQD',
    condition: 'GOOD',
  })

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        category: editItem.category,
        brand: editItem.brand ?? '',
        model: editItem.model ?? '',
        serialNumber: editItem.serialNumber ?? '',
        purchaseDate: editItem.purchaseDate?.split('T')[0] ?? '',
        purchasePrice: editItem.purchasePrice?.toString() ?? '',
        currency: editItem.currency ?? 'IQD',
        condition: editItem.condition,
      })
    } else {
      setForm({
        name: '',
        category: 'CAMERA',
        brand: '',
        model: '',
        serialNumber: '',
        purchaseDate: '',
        purchasePrice: '',
        currency: 'IQD',
        condition: 'GOOD',
      })
    }
  }, [editItem, open])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data: Record<string, unknown> = {
      name: form.name,
      category: form.category,
      brand: form.brand || undefined,
      model: form.model || undefined,
      serialNumber: form.serialNumber || undefined,
      purchaseDate: form.purchaseDate || undefined,
      purchasePrice: form.purchasePrice ? parseInt(form.purchasePrice, 10) : undefined,
      currency: form.currency,
      condition: form.condition,
    }
    if (editItem) {
      await updateEquipment.mutateAsync({ id: editItem.id, data })
    } else {
      await createEquipment.mutateAsync(data)
    }
    onClose()
  }

  const isPending = createEquipment.isPending || updateEquipment.isPending

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-white p-6 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold">{editItem ? t('editTitle') : t('createTitle')}</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium">{t('name')}</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">{t('category')}</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {t(`cat_${c}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">{t('brand')}</label>
              <input
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('model')}</label>
              <input
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">{t('serialNumber')}</label>
            <input
              value={form.serialNumber}
              onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">{t('purchaseDate')}</label>
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('purchasePrice')}</label>
              <input
                type="number"
                value={form.purchasePrice}
                onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('condition')}</label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {t(`cond_${c}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? tCommon('saving') : tCommon('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
