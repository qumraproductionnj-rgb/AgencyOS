'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  usePayrollRun,
  useFinalizePayroll,
  useMarkPayrollPaid,
  useUpdatePayrollEntry,
} from '@/hooks/use-payroll'

interface Props {
  runId: string
  onBack: () => void
}

export function PayrollRunDetail({ runId, onBack }: Props) {
  const t = useTranslations('payroll')
  const tCommon = useTranslations('common')
  const { data: run, isLoading } = usePayrollRun(runId)
  const finalize = useFinalizePayroll()
  const markPaid = useMarkPayrollPaid()
  const updateEntry = useUpdatePayrollEntry(runId)
  const [editEntryId, setEditEntryId] = useState<string | null>(null)
  const [editAdditions, setEditAdditions] = useState('')
  const [editDeductions, setEditDeductions] = useState('')
  const [editNotes, setEditNotes] = useState('')

  const getStatusLabel = (status: string) => t(status.toLowerCase())
  const statusColor: Record<string, string> = {
    DRAFT: 'text-yellow-600 bg-yellow-50',
    FINALIZED: 'text-green-600 bg-green-50',
    PAID: 'text-blue-600 bg-blue-50',
  }
  const formatCurrency = (amount: number | bigint, currency: string) => {
    const num = typeof amount === 'bigint' ? Number(amount) : amount
    return `${(num / 100).toLocaleString()} ${currency}`
  }
  const getEmployeeName = (e: { fullNameAr?: string; fullNameEn?: string }) =>
    e.fullNameAr || e.fullNameEn || '—'

  if (isLoading) return <p className="text-muted-foreground p-4">{tCommon('loading')}</p>
  if (!run) return <p className="text-muted-foreground p-4">{tCommon('error')}</p>

  const handleSaveEdit = async () => {
    if (!editEntryId) return
    await updateEntry.mutateAsync({
      entryId: editEntryId,
      ...(editAdditions !== '' ? { additions: Math.round(Number(editAdditions) * 100) } : {}),
      ...(editDeductions !== '' ? { deductions: Math.round(Number(editDeductions) * 100) } : {}),
      ...(editNotes !== '' ? { notes: editNotes } : {}),
    })
    setEditEntryId(null)
    setEditAdditions('')
    setEditDeductions('')
    setEditNotes('')
  }

  const openEdit = (entry: (typeof run.entries)[number]) => {
    setEditEntryId(entry.id)
    setEditAdditions((Number(entry.additions) / 100).toString())
    setEditDeductions((Number(entry.deductions) / 100).toString())
    setEditNotes(entry.notes ?? '')
  }

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="text-sm text-blue-600 hover:underline">
        &larr; {tCommon('back')}
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">
            {t(`monthNames.${run.month}`)} {run.year}
          </h2>
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[run.status] ?? ''}`}
          >
            {getStatusLabel(run.status)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">
            {t('totalAmount')}: {formatCurrency(run.totalAmount, run.currency)}
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        {run.status === 'DRAFT' && (
          <button
            onClick={async () => {
              if (window.confirm(t('finalizeConfirm'))) await finalize.mutateAsync(run.id)
            }}
            disabled={finalize.isPending}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {t('finalize')}
          </button>
        )}
        {run.status === 'FINALIZED' && (
          <button
            onClick={async () => {
              if (window.confirm(t('markPaidConfirm'))) await markPaid.mutateAsync(run.id)
            }}
            disabled={markPaid.isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {t('markPaid')}
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">{t('employee')}</th>
              <th className="px-4 py-3 text-left font-medium">{t('baseSalary')}</th>
              <th className="px-4 py-3 text-left font-medium">{t('additions')}</th>
              <th className="px-4 py-3 text-left font-medium">{t('deductions')}</th>
              <th className="px-4 py-3 text-left font-medium">{t('netAmount')}</th>
              <th className="px-4 py-3 text-left font-medium">{t('attendanceDays')}</th>
              <th className="px-4 py-3 text-left font-medium">{t('lateDays')}</th>
              <th className="px-4 py-3 text-left font-medium">{t('absentDays')}</th>
              {run.status === 'DRAFT' && (
                <th className="px-4 py-3 text-right">{tCommon('edit')}</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {run.entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-muted/30">
                <td className="px-4 py-3">{getEmployeeName(entry.employee)}</td>
                <td className="px-4 py-3">{formatCurrency(entry.baseSalary, run.currency)}</td>
                <td className="px-4 py-3 text-green-600">
                  {entry.additions > 0 ? `+${formatCurrency(entry.additions, run.currency)}` : '—'}
                </td>
                <td className="px-4 py-3 text-red-500">
                  {entry.deductions > 0
                    ? `-${formatCurrency(entry.deductions, run.currency)}`
                    : '—'}
                </td>
                <td className="px-4 py-3 font-medium">
                  {formatCurrency(entry.netAmount, run.currency)}
                </td>
                <td className="px-4 py-3">{entry.attendanceDays}</td>
                <td className="px-4 py-3">{entry.lateDays}</td>
                <td className="px-4 py-3">{entry.absentDays}</td>
                {run.status === 'DRAFT' && (
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(entry)}
                      className="text-blue-600 hover:underline"
                    >
                      {tCommon('edit')}
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editEntryId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setEditEntryId(null)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-3 text-sm font-semibold">{tCommon('edit')}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">{t('additions')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={editAdditions}
                  onChange={(e) => setEditAdditions(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t('deductions')}</label>
                <input
                  type="number"
                  step="0.01"
                  value={editDeductions}
                  onChange={(e) => setEditDeductions(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t('notes')}</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setEditEntryId(null)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={updateEntry.isPending}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {updateEntry.isPending ? tCommon('loading') : tCommon('save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
