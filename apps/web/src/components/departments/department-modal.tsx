'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useDepartments, useCreateDepartment, useUpdateDepartment } from '@/hooks/use-departments'

interface Props {
  departmentId: string | null
  onClose: () => void
}

export function DepartmentModal({ departmentId, onClose }: Props) {
  const t = useTranslations('departments')
  const tCommon = useTranslations('common')
  const { data: departments } = useDepartments()
  const create = useCreateDepartment()
  const update = useUpdateDepartment()

  const editing = departmentId ? departments?.find((d) => d.id === departmentId) : null
  const [nameAr, setNameAr] = useState(editing?.nameAr ?? '')
  const [nameEn, setNameEn] = useState(editing?.nameEn ?? '')
  const [description, setDescription] = useState(editing?.description ?? '')

  useEffect(() => {
    if (editing) {
      setNameAr(editing.nameAr)
      setNameEn(editing.nameEn ?? '')
      setDescription(editing.description ?? '')
    }
  }, [editing])

  const busy = create.isPending || update.isPending

  const handleSubmit = async () => {
    if (!nameAr.trim()) return
    if (editing) {
      await update.mutateAsync({
        id: editing.id,
        nameAr: nameAr.trim(),
        ...(nameEn.trim() ? { nameEn: nameEn.trim() } : {}),
        ...(description.trim() ? { description: description.trim() } : {}),
      })
    } else {
      await create.mutateAsync({
        nameAr: nameAr.trim(),
        ...(nameEn.trim() ? { nameEn: nameEn.trim() } : {}),
        ...(description.trim() ? { description: description.trim() } : {}),
      })
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">
          {editing ? t('editTitle') : t('createTitle')}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">{t('nameAr')}</label>
            <input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t('nameEn')}</label>
            <input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t('description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            {tCommon('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={busy || !nameAr.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? tCommon('loading') : tCommon('save')}
          </button>
        </div>
      </div>
    </div>
  )
}
