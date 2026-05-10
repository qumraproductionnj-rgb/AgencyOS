'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  useCreatePerformanceReview,
  useUpdatePerformanceReview,
  type Kpi,
  type PerformanceReview,
} from '@/hooks/use-performance-reviews'

interface Props {
  review?: PerformanceReview | null
  onClose: () => void
}

export function PerformanceReviewModal({ review, onClose }: Props) {
  const t = useTranslations('performanceReviews')
  const tCommon = useTranslations('common')
  const create = useCreatePerformanceReview()
  const update = useUpdatePerformanceReview()
  const editing = review ?? null
  const [reviewDate, setReviewDate] = useState('')
  const [kpis, setKpis] = useState<Kpi[]>([{ name: '', score: 5, weight: 1, comment: '' }])
  const [strengths, setStrengths] = useState('')
  const [improvements, setImprovements] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (editing) {
      setReviewDate(editing.reviewDate.slice(0, 10))
      setKpis(
        editing.kpis.length > 0 ? editing.kpis : [{ name: '', score: 5, weight: 1, comment: '' }],
      )
      setStrengths(editing.strengths ?? '')
      setImprovements(editing.improvements ?? '')
      setNotes(editing.notes ?? '')
    } else {
      setReviewDate(new Date().toISOString().slice(0, 10))
    }
  }, [editing])

  const busy = create.isPending || update.isPending

  const addKpi = () => setKpis([...kpis, { name: '', score: 5, weight: 1, comment: '' }])
  const updateKpi = (i: number, field: keyof Kpi, value: string | number) => {
    const next = [...kpis]
    next[i] = Object.assign({}, next[i], { [field]: value })
    setKpis(next)
  }
  const removeKpi = (i: number) => setKpis(kpis.filter((_, idx) => idx !== i))

  const handleSubmit = async () => {
    setError('')
    const validKpis = kpis.filter((k) => k.name.trim())
    if (validKpis.length === 0) {
      setError('At least one KPI is required')
      return
    }

    const body = {
      reviewDate,
      kpis: validKpis,
      ...(strengths.trim() ? { strengths: strengths.trim() } : {}),
      ...(improvements.trim() ? { improvements: improvements.trim() } : {}),
      ...(notes.trim() ? { notes: notes.trim() } : {}),
    }

    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...body })
      } else {
        await create.mutateAsync({ employeeId: '', ...body })
      }
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
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">
          {editing ? t('editTitle') : t('createTitle')}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">{t('reviewDate')}</label>
            <input
              type="date"
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium">{t('kpis')}</label>
              <button onClick={addKpi} className="text-xs text-blue-600 hover:underline">
                + {t('addKpi')}
              </button>
            </div>
            {kpis.map((kpi, i) => (
              <div key={i} className="mb-2 flex gap-2 rounded-md border p-2">
                <input
                  placeholder={t('kpiName')}
                  value={kpi.name}
                  onChange={(e) => updateKpi(i, 'name', e.target.value)}
                  className="min-w-0 flex-1 rounded border border-gray-200 px-2 py-1 text-xs"
                />
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  value={kpi.score}
                  onChange={(e) => updateKpi(i, 'score', Number(e.target.value))}
                  className="w-14 rounded border border-gray-200 px-2 py-1 text-center text-xs"
                />
                {kpis.length > 1 && (
                  <button
                    onClick={() => removeKpi(i)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    {t('removeKpi')}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="text-sm font-medium">{t('strengths')}</label>
            <textarea
              value={strengths}
              onChange={(e) => setStrengths(e.target.value)}
              rows={2}
              maxLength={2000}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t('improvements')}</label>
            <textarea
              value={improvements}
              onChange={(e) => setImprovements(e.target.value)}
              rows={2}
              maxLength={2000}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t('notes')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={2000}
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
            disabled={busy}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? tCommon('loading') : tCommon('save')}
          </button>
        </div>
      </div>
    </div>
  )
}
