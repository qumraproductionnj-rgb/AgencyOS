'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useWorkLocations, useDeleteWorkLocation } from '@/hooks/use-work-locations'
import { WorkLocationModal } from './work-location-modal'

export function WorkLocationTable() {
  const t = useTranslations('workLocations')
  const tCommon = useTranslations('common')
  const { data: locations, isLoading } = useWorkLocations()
  const deleteLoc = useDeleteWorkLocation()
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)

  if (isLoading) return <p className="text-muted-foreground p-4">{tCommon('loading')}</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <button
          onClick={() => {
            setEditId(null)
            setModalOpen(true)
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + {tCommon('create')}
        </button>
      </div>

      {!locations?.length ? (
        <p className="text-muted-foreground p-8 text-center">{t('noLocations')}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t('name')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('address')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('coordinates')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('radius')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('employees')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('status')}</th>
                <th className="px-4 py-3 text-right font-medium">{tCommon('edit')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {locations.map((loc) => (
                <tr key={loc.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{loc.name}</td>
                  <td className="text-muted-foreground px-4 py-3">{loc.address || '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                  </td>
                  <td className="px-4 py-3">{loc.radiusMeters}m</td>
                  <td className="px-4 py-3">{loc._count?.workLocationEmployees ?? 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${loc.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {loc.isActive ? t('active') : t('inactive')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditId(loc.id)
                        setModalOpen(true)
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      {tCommon('edit')}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(t('deleteConfirm'))) deleteLoc.mutate(loc.id)
                      }}
                      className="ml-3 text-red-500 hover:underline"
                      disabled={deleteLoc.isPending}
                    >
                      {tCommon('delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <WorkLocationModal
          id={editId}
          onClose={() => {
            setModalOpen(false)
            setEditId(null)
          }}
        />
      )}
    </div>
  )
}
