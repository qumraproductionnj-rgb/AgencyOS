'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useCreateLeave, type LeaveType } from '@/hooks/use-leaves'

interface Props {
  onClose: () => void
}

const LEAVE_TYPES: { value: LeaveType; labelKey: string }[] = [
  { value: 'ANNUAL', labelKey: 'annual' },
  { value: 'SICK', labelKey: 'sick' },
  { value: 'PERSONAL', labelKey: 'personal' },
  { value: 'MATERNITY', labelKey: 'maternity' },
  { value: 'PATERNITY', labelKey: 'paternity' },
  { value: 'UNPAID', labelKey: 'unpaid' },
  { value: 'OTHER', labelKey: 'other' },
]

export function LeaveModal({ onClose }: Props) {
  const t = useTranslations('leaves')
  const tCommon = useTranslations('common')
  const create = useCreateLeave()

  const [leaveType, setLeaveType] = useState<LeaveType>('ANNUAL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const parseDate = (s: string) => {
    const d = new Date(s)
    return isNaN(d.getTime()) ? null : d
  }

  const calcDuration = (): number | null => {
    const start = parseDate(startDate)
    const end = parseDate(endDate)
    if (!start || !end) return null
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  }

  const duration = calcDuration()

  const handleSubmit = async () => {
    setError('')
    if (!startDate || !endDate) {
      setError(tCommon('error'))
      return
    }
    const start = parseDate(startDate)
    const end = parseDate(endDate)
    if (!start || !end || end < start) {
      setError('End date must be after start date')
      return
    }

    try {
      await create.mutateAsync({
        leaveType,
        startDate,
        endDate,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      })
      onClose()
    } catch (err) {
      setError((err as Error).message || tCommon('error'))
    }
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
        <h2 className="mb-4 text-lg font-semibold">{t('createTitle')}</h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">{t('leaveType')}</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              {LEAVE_TYPES.map((lt) => (
                <option key={lt.value} value={lt.value}>
                  {t(lt.labelKey)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">{t('startDate')}</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t('endDate')}</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {duration !== null && duration > 0 && (
            <p className="text-muted-foreground text-sm">
              {t('duration')}: {duration} {t('days')}
            </p>
          )}

          <div>
            <label className="text-sm font-medium">{t('reason')}</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder={t('reasonPlaceholder')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
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
            disabled={create.isPending || !startDate || !endDate}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {create.isPending ? tCommon('loading') : tCommon('save')}
          </button>
        </div>
      </div>
    </div>
  )
}
