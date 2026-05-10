'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  useLeaves,
  useApproveLeave,
  useRejectLeave,
  useCancelLeave,
  type LeaveStatus,
} from '@/hooks/use-leaves'
import { LeaveModal } from './leave-modal'
import { LeaveBalance } from './leave-balance'

const STATUS_OPTIONS: (LeaveStatus | 'ALL')[] = ['ALL', 'PENDING', 'APPROVED', 'REJECTED']

export function LeaveTable() {
  const t = useTranslations('leaves')
  const tCommon = useTranslations('common')
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | 'ALL'>('ALL')
  const [view, setView] = useState<'all' | 'my'>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data: leaves, isLoading } = useLeaves(
    statusFilter !== 'ALL'
      ? { status: statusFilter, ...(view === 'my' ? { view: 'my' as const } : {}) }
      : undefined,
  )
  const approve = useApproveLeave()
  const reject = useRejectLeave()
  const cancel = useCancelLeave()

  const getStatusLabel = (status: LeaveStatus): string => {
    const map: Record<LeaveStatus, string> = {
      PENDING: 'pending',
      APPROVED: 'approved',
      REJECTED: 'rejected',
      CANCELLED: 'cancelled',
    }
    return t(map[status])
  }

  const statusColor: Record<LeaveStatus, string> = {
    PENDING: 'text-yellow-600 bg-yellow-50',
    APPROVED: 'text-green-600 bg-green-50',
    REJECTED: 'text-red-600 bg-red-50',
    CANCELLED: 'text-gray-500 bg-gray-50',
  }

  const getTypeLabel = (type: string): string => {
    const map: Record<string, string> = {
      ANNUAL: 'annual',
      SICK: 'sick',
      PERSONAL: 'personal',
      MATERNITY: 'maternity',
      PATERNITY: 'paternity',
      UNPAID: 'unpaid',
      OTHER: 'other',
    }
    return t(map[type] || 'other')
  }

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-CA')
  }

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) return
    await reject.mutateAsync({ id, rejectionReason: rejectReason.trim() })
    setRejectId(null)
    setRejectReason('')
  }

  if (isLoading) return <p className="text-muted-foreground p-4">{tCommon('loading')}</p>

  return (
    <div className="space-y-4">
      <LeaveBalance />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + {t('createTitle')}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-md border">
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-medium ${
                statusFilter === s ? 'bg-blue-600 text-white' : 'hover:bg-muted/50'
              } ${s !== 'ALL' ? 'border-l' : ''}`}
            >
              {s === 'ALL' ? t('all') : getStatusLabel(s)}
            </button>
          ))}
        </div>

        <button
          onClick={() => setView(view === 'all' ? 'my' : 'all')}
          className={`rounded-md border px-3 py-1.5 text-xs font-medium ${
            view === 'my' ? 'bg-blue-600 text-white' : 'hover:bg-muted/50'
          }`}
        >
          {t('myLeaves')}
        </button>
      </div>

      {!leaves?.length ? (
        <p className="text-muted-foreground p-8 text-center">{t('noLeaves')}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t('employee')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('leaveType')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('startDate')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('endDate')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('duration')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('status')}</th>
                <th className="px-4 py-3 text-right font-medium">{tCommon('edit')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    {leave.employee.fullNameAr || leave.employee.fullNameEn}
                    <span className="text-muted-foreground ml-1 text-xs">
                      ({leave.employee.employeeCode})
                    </span>
                  </td>
                  <td className="px-4 py-3">{getTypeLabel(leave.leaveType)}</td>
                  <td className="px-4 py-3">{formatDate(leave.startDate)}</td>
                  <td className="px-4 py-3">{formatDate(leave.endDate)}</td>
                  <td className="px-4 py-3">{leave.durationDays}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        statusColor[leave.status]
                      }`}
                    >
                      {getStatusLabel(leave.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {leave.status === 'PENDING' && (
                      <>
                        <button
                          onClick={async () => {
                            if (window.confirm(t('approveConfirm')))
                              await approve.mutateAsync(leave.id)
                          }}
                          disabled={approve.isPending}
                          className="text-green-600 hover:underline"
                        >
                          {t('approve')}
                        </button>
                        <button
                          onClick={() => setRejectId(leave.id)}
                          className="ml-3 text-red-500 hover:underline"
                        >
                          {t('reject')}
                        </button>
                      </>
                    )}
                    {(leave.status === 'PENDING' || leave.status === 'APPROVED') && (
                      <button
                        onClick={async () => {
                          if (window.confirm(t('cancelConfirm'))) await cancel.mutateAsync(leave.id)
                        }}
                        disabled={cancel.isPending}
                        className="ml-3 text-gray-500 hover:underline"
                      >
                        {t('cancel')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rejectId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setRejectId(null)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-sm font-semibold">{t('rejectionReason')}</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder={t('rejectionReasonPlaceholder')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setRejectId(null)
                  setRejectReason('')
                }}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={() => handleReject(rejectId)}
                disabled={reject.isPending || !rejectReason.trim()}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {reject.isPending ? tCommon('loading') : t('reject')}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && <LeaveModal onClose={() => setModalOpen(false)} />}
    </div>
  )
}
