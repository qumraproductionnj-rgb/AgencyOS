'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useCreateEmployee } from '@/hooks/use-employees'
import { useDepartments, type Department } from '@/hooks/use-departments'

interface Props {
  onClose: () => void
}

export function EmployeeCreateModal({ onClose }: Props) {
  const t = useTranslations('employees')
  const tCommon = useTranslations('common')
  const { data: departments } = useDepartments()
  const create = useCreateEmployee()

  const [fullNameAr, setFullNameAr] = useState('')
  const [fullNameEn, setFullNameEn] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [position, setPosition] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))

  const busy = create.isPending

  const handleSubmit = async () => {
    if (!fullNameAr.trim() || !email.trim() || !startDate) return
    const payload: Record<string, unknown> = {
      fullNameAr: fullNameAr.trim(),
      email: email.trim(),
      startDate,
    }
    if (fullNameEn.trim()) payload['fullNameEn'] = fullNameEn.trim()
    if (phone.trim()) payload['phone'] = phone.trim()
    if (position.trim()) payload['position'] = position.trim()
    if (departmentId) payload['departmentId'] = departmentId
    await create.mutateAsync(payload)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">{t('createTitle')}</h2>
        <p className="text-muted-foreground mb-4 text-sm">{t('inviteSent')}</p>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="text-sm font-medium">{t('fullNameAr')}</label>
            <input
              value={fullNameAr}
              onChange={(e) => setFullNameAr(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium">{t('fullNameEn')}</label>
            <input
              value={fullNameEn}
              onChange={(e) => setFullNameEn(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm font-medium">{t('email')}</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t('phone')}</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t('position')}</label>
            <input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t('department')}</label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">—</option>
              {departments?.map((d: Department) => (
                <option key={d.id} value={d.id}>
                  {d.nameAr}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">{t('startDate')}</label>
            <input
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              type="date"
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
            disabled={busy || !fullNameAr.trim() || !email.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? tCommon('loading') : tCommon('save')}
          </button>
        </div>
      </div>
    </div>
  )
}
