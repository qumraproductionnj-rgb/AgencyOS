'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useCreateExhibition, useUpdateExhibition } from '@/hooks/use-exhibitions'

export interface ExhibitionModalProps {
  open: boolean
  onClose: () => void
  editItem: {
    id: string
    name: string
    locationAddress: string | null
    city: string | null
    country: string | null
    startDate: string
    endDate: string
    organizingClientId: string | null
    managerId: string | null
  } | null
}

export function ExhibitionModal({ open, onClose, editItem }: ExhibitionModalProps) {
  const tCommon = useTranslations('common')
  const t = useTranslations('exhibitions')
  const create = useCreateExhibition()
  const update = useUpdateExhibition()
  const [form, setForm] = useState({
    name: '',
    locationAddress: '',
    city: '',
    country: '',
    startDate: '',
    endDate: '',
    organizingClientId: '',
    managerId: '',
  })

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        locationAddress: editItem.locationAddress ?? '',
        city: editItem.city ?? '',
        country: editItem.country ?? '',
        startDate: editItem.startDate?.split('T')[0] ?? '',
        endDate: editItem.endDate?.split('T')[0] ?? '',
        organizingClientId: editItem.organizingClientId ?? '',
        managerId: editItem.managerId ?? '',
      })
    } else {
      setForm({
        name: '',
        locationAddress: '',
        city: '',
        country: '',
        startDate: '',
        endDate: '',
        organizingClientId: '',
        managerId: '',
      })
    }
  }, [editItem, open])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const data: Record<string, unknown> = {
      name: form.name,
      locationAddress: form.locationAddress || undefined,
      city: form.city || undefined,
      country: form.country || undefined,
      startDate: form.startDate,
      endDate: form.endDate,
      organizingClientId: form.organizingClientId || undefined,
      managerId: form.managerId || undefined,
    }
    if (editItem) {
      await update.mutateAsync({ id: editItem.id, data })
    } else {
      await create.mutateAsync(data)
    }
    onClose()
  }

  const isPending = create.isPending || update.isPending

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
            <label className="block text-sm font-medium">{t('name')} *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">{t('startDate')} *</label>
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('endDate')} *</label>
              <input
                type="date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">{t('location')}</label>
            <input
              value={form.locationAddress}
              onChange={(e) => setForm({ ...form, locationAddress: e.target.value })}
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">{t('city')}</label>
              <input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">{t('country')}</label>
              <input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              />
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
