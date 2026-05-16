'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import {
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
  type Department,
} from '@/hooks/use-departments'
import { useEmployeesList } from '@/hooks/use-expenses'

const ICON_CHOICES = ['🎨', '🎬', '📸', '📝', '📣', '💼', '🛠️', '🎯', '🏷️', '📊', '🤝', '💡']
const COLOR_CHOICES = [
  '#fee2e2',
  '#fed7aa',
  '#fef08a',
  '#bbf7d0',
  '#bae6fd',
  '#ddd6fe',
  '#fbcfe8',
  '#e5e7eb',
]

interface Props {
  departmentId: string | null
  allowHierarchy: boolean
  allDepartments: Department[]
  onClose: () => void
}

export function DepartmentEditor({ departmentId, allowHierarchy, allDepartments, onClose }: Props) {
  const locale = useLocale()
  const isAr = locale === 'ar'
  const existing = departmentId ? allDepartments.find((d) => d.id === departmentId) : null
  const create = useCreateDepartment()
  const update = useUpdateDepartment()
  const del = useDeleteDepartment()
  const { data: users } = useEmployeesList()

  const [nameAr, setNameAr] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState<string | null>(null)
  const [color, setColor] = useState<string | null>(null)
  const [managerUserId, setManagerUserId] = useState<string>('')
  const [parentId, setParentId] = useState<string>('')

  useEffect(() => {
    if (existing) {
      setNameAr(existing.nameAr)
      setNameEn(existing.nameEn ?? '')
      setDescription(existing.description ?? '')
      setIcon(existing.icon)
      setColor(existing.color)
      setManagerUserId(existing.managerUserId ?? '')
      setParentId(existing.parentId ?? '')
    }
  }, [existing])

  const handleSave = async () => {
    if (!nameAr.trim()) return
    const body = {
      nameAr: nameAr.trim(),
      ...(nameEn.trim() ? { nameEn: nameEn.trim() } : {}),
      ...(description.trim() ? { description: description.trim() } : {}),
      ...(icon ? { icon } : {}),
      ...(color ? { color } : {}),
    }
    if (departmentId) {
      await update.mutateAsync({
        id: departmentId,
        ...body,
        managerUserId: managerUserId || null,
        parentId: allowHierarchy ? parentId || null : null,
      })
    } else {
      await create.mutateAsync({
        ...body,
        ...(managerUserId ? { managerUserId } : {}),
        ...(allowHierarchy && parentId ? { parentId } : {}),
      })
    }
    onClose()
  }

  const handleDelete = async () => {
    if (!departmentId) return
    if (!confirm(isAr ? 'حذف القسم؟' : 'Delete department?')) return
    await del.mutateAsync(departmentId)
    onClose()
  }

  const validParents = allDepartments.filter((d) => d.id !== departmentId)

  const T = {
    title: departmentId
      ? isAr
        ? 'تعديل قسم'
        : 'Edit Department'
      : isAr
        ? 'قسم جديد'
        : 'New Department',
    nameAr: isAr ? 'الاسم بالعربي' : 'Arabic Name',
    nameEn: isAr ? 'الاسم بالإنكليزي (اختياري)' : 'English Name (optional)',
    description: isAr ? 'الوصف' : 'Description',
    icon: isAr ? 'الأيقونة' : 'Icon',
    color: isAr ? 'اللون' : 'Color',
    manager: isAr ? 'مدير القسم' : 'Department Manager',
    noManager: isAr ? '— بدون مدير —' : '— no manager —',
    parent: isAr ? 'القسم الأب (اختياري)' : 'Parent Department (optional)',
    noParent: isAr ? '— قسم رئيسي —' : '— top-level —',
    cancel: isAr ? 'إلغاء' : 'Cancel',
    save: isAr ? 'حفظ' : 'Save',
    delete: isAr ? 'حذف' : 'Delete',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 py-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">{T.title}</h2>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">{T.nameAr}</label>
            <input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
              autoFocus
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{T.nameEn}</label>
            <input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="ltr"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{T.icon}</label>
            <div className="flex flex-wrap gap-2">
              {ICON_CHOICES.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(icon === ic ? null : ic)}
                  className={`flex h-10 w-10 items-center justify-center rounded-md border-2 text-xl ${
                    icon === ic ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{T.color}</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_CHOICES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(color === c ? null : c)}
                  className={`h-9 w-9 rounded-md border-2 ${
                    color === c ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{T.manager}</label>
            <select
              value={managerUserId}
              onChange={(e) => setManagerUserId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">{T.noManager}</option>
              {users?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.fullNameAr ?? u.fullNameEn ?? u.id}
                </option>
              ))}
            </select>
          </div>

          {allowHierarchy && (
            <div>
              <label className="mb-1 block text-sm font-medium">{T.parent}</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">{T.noParent}</option>
                {validParents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {isAr ? p.nameAr : (p.nameEn ?? p.nameAr)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">{T.description}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <div>
            {departmentId && (
              <button
                onClick={handleDelete}
                disabled={del.isPending}
                className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                {T.delete}
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              {T.cancel}
            </button>
            <button
              onClick={handleSave}
              disabled={!nameAr.trim() || create.isPending || update.isPending}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {T.save}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
