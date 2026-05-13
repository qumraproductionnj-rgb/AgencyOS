'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useExhibitions, useDeleteExhibition } from '@/hooks/use-exhibitions'
import { ExhibitionModal, type ExhibitionModalProps } from './exhibition-modal'

const STATUS_COLORS: Record<string, string> = {
  PLANNING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  CONCLUDED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  SETTLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
}

export function ExhibitionList() {
  const t = useTranslations('exhibitions')
  const tCommon = useTranslations('common')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState<Record<string, unknown> | null>(null)

  const params: Record<string, string | undefined> = {}
  if (search) params['search'] = search
  if (filterStatus) params['status'] = filterStatus
  const { data, isLoading } = useExhibitions(params)
  const deleteExhibition = useDeleteExhibition()

  const handleDelete = async (id: string) => {
    if (window.confirm(t('deleteConfirm'))) {
      await deleteExhibition.mutateAsync(id)
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
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="">{t('allStatuses')}</option>
          {['PLANNING', 'ACTIVE', 'CONCLUDED', 'SETTLED'].map((s) => (
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
            href={`/exhibitions/${item.id}`}
            className="bg-card rounded-lg border p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-muted-foreground text-sm">
                  {item.city}
                  {item.country ? `, ${item.country}` : ''}
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[item.status] ?? ''}`}
              >
                {t(`status_${item.status}`)}
              </span>
            </div>
            <div className="text-muted-foreground mt-2 text-xs">
              {item.startDate?.split('T')[0]} → {item.endDate?.split('T')[0]}
            </div>
            {item.manager?.employee?.fullNameAr && (
              <div className="text-muted-foreground mt-1 text-xs">
                {t('manager')}: {item.manager.employee.fullNameAr}
              </div>
            )}
            <div className="text-muted-foreground mt-1 text-xs">
              {item._count?.booths ?? 0} {t('booths')} · {item._count?.financials ?? 0}{' '}
              {t('entries')}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  setEditItem(item as unknown as Record<string, unknown>)
                  setModalOpen(true)
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
        <p className="text-muted-foreground py-8 text-center">{t('noExhibitions')}</p>
      )}

      <ExhibitionModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditItem(null)
        }}
        editItem={editItem as unknown as ExhibitionModalProps['editItem']}
      />
    </div>
  )
}
