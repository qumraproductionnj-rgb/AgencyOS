'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useDepartments, useDeleteDepartment } from '@/hooks/use-departments'
import { DepartmentModal } from './department-modal'

export function DepartmentTable() {
  const t = useTranslations('departments')
  const tCommon = useTranslations('common')
  const { data: departments, isLoading } = useDepartments()
  const deleteDept = useDeleteDepartment()
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

      {!departments?.length ? (
        <p className="text-muted-foreground p-8 text-center">{t('noDepartments')}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t('nameAr')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('nameEn')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('description')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('manager')}</th>
                <th className="px-4 py-3 text-right font-medium">{tCommon('edit')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {departments.map((dept) => (
                <tr key={dept.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">{dept.nameAr}</td>
                  <td className="text-muted-foreground px-4 py-3">{dept.nameEn || '—'}</td>
                  <td className="text-muted-foreground max-w-xs truncate px-4 py-3">
                    {dept.description || '—'}
                  </td>
                  <td className="px-4 py-3">{dept.manager?.email || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditId(dept.id)
                        setModalOpen(true)
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      {tCommon('edit')}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(t('deleteConfirm'))) deleteDept.mutate(dept.id)
                      }}
                      className="ml-3 text-red-500 hover:underline"
                      disabled={deleteDept.isPending}
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
        <DepartmentModal
          departmentId={editId}
          onClose={() => {
            setModalOpen(false)
            setEditId(null)
          }}
        />
      )}
    </div>
  )
}
