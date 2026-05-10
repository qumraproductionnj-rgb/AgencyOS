'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  usePerformanceReviews,
  useDeletePerformanceReview,
  type PerformanceReview,
} from '@/hooks/use-performance-reviews'
import { PerformanceReviewModal } from './performance-review-modal'

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-green-600 bg-green-50'
  if (score >= 5) return 'text-yellow-600 bg-yellow-50'
  return 'text-red-600 bg-red-50'
}

export function PerformanceReviewTable() {
  const t = useTranslations('performanceReviews')
  const tCommon = useTranslations('common')
  const { data: reviews, isLoading } = usePerformanceReviews()
  const deleteReview = useDeletePerformanceReview()
  const [modalOpen, setModalOpen] = useState(false)
  const [editReview, setEditReview] = useState<PerformanceReview | null>(null)

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-CA')
  }

  if (isLoading) return <p className="text-muted-foreground p-4">{tCommon('loading')}</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <button
          onClick={() => {
            setEditReview(null)
            setModalOpen(true)
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + {t('createTitle')}
        </button>
      </div>

      {!reviews?.length ? (
        <p className="text-muted-foreground p-8 text-center">{t('noReviews')}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t('employee')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('reviewDate')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('overallScore')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('kpis')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('reviewer')}</th>
                <th className="px-4 py-3 text-right">{tCommon('edit')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    {rev.employee.fullNameAr || rev.employee.fullNameEn}
                  </td>
                  <td className="px-4 py-3">{formatDate(rev.reviewDate)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getScoreColor(rev.overallScore)}`}
                    >
                      {rev.overallScore.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">{rev.kpis.length}</td>
                  <td className="px-4 py-3">{rev.reviewer.email}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => {
                        setEditReview(rev)
                        setModalOpen(true)
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      {tCommon('edit')}
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(t('deleteConfirm'))) deleteReview.mutate(rev.id)
                      }}
                      disabled={deleteReview.isPending}
                      className="ml-3 text-red-500 hover:underline"
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
        <PerformanceReviewModal
          review={editReview}
          onClose={() => {
            setModalOpen(false)
            setEditReview(null)
          }}
        />
      )}
    </div>
  )
}
