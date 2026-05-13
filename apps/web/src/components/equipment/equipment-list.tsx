'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEquipment, useDeleteEquipment } from '@/hooks/use-equipment'
import { EquipmentModal, type EquipmentModalProps } from './equipment-modal'

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  IN_USE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  RETIRED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  LOST: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
}

export function EquipmentList() {
  const t = useTranslations('equipment')
  const tCommon = useTranslations('common')
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null)

  const params: Record<string, string | undefined> = {}
  if (search) params['search'] = search
  if (filterCategory) params['category'] = filterCategory
  if (filterStatus) params['status'] = filterStatus
  const { data, isLoading } = useEquipment(params)
  const deleteEquipment = useDeleteEquipment()

  const handleEdit = (item: Record<string, unknown>) => {
    setEditItem(item)
    setModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm(t('deleteConfirm'))) {
      await deleteEquipment.mutateAsync(id)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <button
          onClick={() => {
            setEditItem(null)
            setModalOpen(true)
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + {tCommon('create')}
        </button>
      </div>

      <div className="flex gap-3">
        <input
          placeholder={t('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="">{t('allCategories')}</option>
          {['CAMERA', 'LENS', 'LIGHTING', 'AUDIO', 'GRIP', 'COMPUTER', 'OTHER'].map((c) => (
            <option key={c} value={c}>
              {t(`cat_${c}`)}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="">{t('allStatuses')}</option>
          {['AVAILABLE', 'IN_USE', 'MAINTENANCE', 'RETIRED', 'LOST'].map((s) => (
            <option key={s} value={s}>
              {t(`status_${s}`)}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-muted-foreground">{tCommon('loading')}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.items.map((item) => (
          <Link
            key={item.id}
            href={`/equipment/${item.id}`}
            className="bg-card rounded-lg border p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {item.brand && `${item.brand} ${item.model ?? ''}`}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[item.currentStatus] ?? ''}`}
              >
                {t(`status_${item.currentStatus}`)}
              </span>
            </div>
            <div className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
              <span className="rounded bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">
                {t(`cat_${item.category}`)}
              </span>
              <span>{t(`cond_${item.condition}`)}</span>
              {item.holder?.fullNameAr && <span>{item.holder.fullNameAr}</span>}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleEdit(item as unknown as Record<string, unknown>)
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                {tCommon('edit')}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleDelete(item.id)
                }}
                className="text-xs text-red-600 hover:underline"
              >
                {tCommon('delete')}
              </button>
            </div>
          </Link>
        ))}
      </div>

      {data?.items.length === 0 && !isLoading && (
        <p className="text-muted-foreground py-8 text-center">{t('noEquipment')}</p>
      )}

      <EquipmentModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditItem(null)
        }}
        editItem={editItem as unknown as EquipmentModalProps['editItem']}
      />
    </div>
  )
}
