'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useProject, useUpdateProjectStage, useAddRevision } from '@/hooks/use-projects'

interface Props {
  projectId: string
  onClose: () => void
}

const STAGE_COLORS: Record<string, string> = {
  BRIEF: 'bg-gray-100 text-gray-700',
  PLANNING: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-purple-100 text-purple-700',
  REVIEW: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-green-100 text-green-700',
  DELIVERED: 'bg-teal-100 text-teal-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const STAGE_LABELS: Record<string, string> = {
  BRIEF: 'brief',
  PLANNING: 'planning',
  IN_PROGRESS: 'inProgress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

type Tab = 'overview' | 'tasks' | 'revisions' | 'deliverables'

export function ProjectDetail({ projectId, onClose }: Props) {
  const t = useTranslations('projects')
  const tCommon = useTranslations('common')
  const { data: project, isLoading } = useProject(projectId)
  const updateStage = useUpdateProjectStage()
  const addRevision = useAddRevision()
  const [tab, setTab] = useState<Tab>('overview')
  const [revisionNotes, setRevisionNotes] = useState('')
  const [showRevisionInput, setShowRevisionInput] = useState(false)
  const [deliverableName, setDeliverableName] = useState('')
  const [deliverableUrl, setDeliverableUrl] = useState('')

  if (isLoading || !project) return null

  const formatCurrency = (value: number, currency: string) => {
    const sym = currency === 'IQD' ? 'د.ع' : currency === 'USD' ? '$' : currency
    return `${Number(value).toLocaleString()} ${sym}`
  }

  const ALL_TABS: { key: Tab; label: string }[] = [
    { key: 'overview', label: t('overview') },
    { key: 'tasks', label: t('tasks') },
    { key: 'revisions', label: t('revisions') },
    { key: 'deliverables', label: t('deliverables') },
  ]

  const revisionCount = project.revisions?.length ?? 0
  const revisionLimit = 3
  const atRevisionLimit = revisionCount >= revisionLimit

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{project.name}</h2>
            {project.nameEn && <p className="text-sm text-gray-500">{project.nameEn}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STAGE_COLORS[project.stage]}`}
          >
            {t(STAGE_LABELS[project.stage])}
          </span>
          {atRevisionLimit && (
            <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
              {t('revisionLimitReached')}
            </span>
          )}
        </div>

        {project.stage !== 'DELIVERED' && (
          <div className="mb-4 flex flex-wrap gap-2">
            {project.stage === 'BRIEF' && (
              <button
                onClick={() => updateStage.mutate({ id: projectId, stage: 'PLANNING' })}
                className="rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
              >
                {t('moveToPlanning')}
              </button>
            )}
            {project.stage === 'PLANNING' && (
              <button
                onClick={() => updateStage.mutate({ id: projectId, stage: 'IN_PROGRESS' })}
                className="rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
              >
                {t('moveToInProgress')}
              </button>
            )}
            {project.stage === 'IN_PROGRESS' && (
              <button
                onClick={() => updateStage.mutate({ id: projectId, stage: 'REVIEW' })}
                className="rounded bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-200"
              >
                {t('moveToReview')}
              </button>
            )}
            {project.stage === 'REVIEW' && (
              <>
                <button
                  onClick={() => updateStage.mutate({ id: projectId, stage: 'COMPLETED' })}
                  className="rounded bg-green-100 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-200"
                >
                  {t('moveToCompleted')}
                </button>
                <button
                  onClick={() => updateStage.mutate({ id: projectId, stage: 'IN_PROGRESS' })}
                  className="rounded bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-200"
                >
                  {t('sendBackToInProgress')}
                </button>
              </>
            )}
            {project.stage === 'COMPLETED' && (
              <button
                onClick={() => updateStage.mutate({ id: projectId, stage: 'DELIVERED' })}
                className="rounded bg-teal-100 px-3 py-1 text-xs font-medium text-teal-700 hover:bg-teal-200"
              >
                {t('moveToDelivered')}
              </button>
            )}
            {!['COMPLETED', 'DELIVERED'].includes(project.stage) && (
              <button
                onClick={() => updateStage.mutate({ id: projectId, stage: 'CANCELLED' })}
                className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
              >
                {tCommon('cancel')}
              </button>
            )}
          </div>
        )}

        <div className="mb-6 flex gap-4 border-b">
          {ALL_TABS.map((tItem) => (
            <button
              key={tItem.key}
              onClick={() => setTab(tItem.key)}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                tab === tItem.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tItem.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">{t('client')}</span>
              <span className="font-medium">{project.client.name}</span>
            </div>
            {project.campaign && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">{t('campaign')}</span>
                <span className="font-medium">{project.campaign.name}</span>
              </div>
            )}
            {project.description && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">{t('description')}</span>
                <span className="max-w-[60%] text-right font-medium">{project.description}</span>
              </div>
            )}
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">{t('budget')}</span>
              <span className="font-medium">
                {formatCurrency(project.budget, project.currency)}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">{t('duration')}</span>
              <span className="text-xs font-medium">
                {new Date(project.startDate).toLocaleDateString()} —{' '}
                {new Date(project.deadline).toLocaleDateString()}
              </span>
            </div>
            {project.completedAt && (
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">{t('completedAt')}</span>
                <span className="font-medium">
                  {new Date(project.completedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        )}

        {tab === 'tasks' && (
          <div>
            {!project.tasks || project.tasks.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">{t('noTasks')}</p>
            ) : (
              <div className="space-y-2">
                {project.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-md border p-3 text-sm"
                  >
                    <span className="font-medium">{task.title}</span>
                    <span className="text-xs text-gray-500">{task.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'revisions' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {t('revisionsUsed', { count: revisionCount, limit: revisionLimit })}
              </p>
              {!atRevisionLimit && !showRevisionInput && (
                <button
                  onClick={() => setShowRevisionInput(true)}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                >
                  + {t('requestRevision')}
                </button>
              )}
            </div>

            {showRevisionInput && (
              <div className="mb-4 space-y-2 rounded-md border p-3">
                <textarea
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder={t('revisionNotesPlaceholder')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  rows={2}
                  dir="auto"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      addRevision.mutate({
                        id: projectId,
                        ...(revisionNotes ? { notes: revisionNotes } : {}),
                      })
                      setShowRevisionInput(false)
                      setRevisionNotes('')
                    }}
                    disabled={addRevision.isPending}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {t('submitRevision')}
                  </button>
                  <button
                    onClick={() => setShowRevisionInput(false)}
                    className="rounded-md border px-3 py-1.5 text-xs hover:bg-gray-50"
                  >
                    {tCommon('cancel')}
                  </button>
                </div>
              </div>
            )}

            {atRevisionLimit && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {t('revisionLimitWarning')}
              </div>
            )}

            {!project.revisions || project.revisions.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">{t('noRevisions')}</p>
            ) : (
              <div className="space-y-2">
                {project.revisions.map((rev) => (
                  <div key={rev.id} className="rounded-md border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {t('revisionNumber', { n: rev.revisionNumber })}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {rev.notes && <p className="mt-1 text-gray-600">{rev.notes}</p>}
                    <p className="mt-1 text-xs text-gray-400">{rev.requestor?.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'deliverables' && (
          <div>
            <div className="mb-4 flex gap-2">
              <input
                value={deliverableName}
                onChange={(e) => setDeliverableName(e.target.value)}
                placeholder={t('deliverableName')}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
              />
              <input
                value={deliverableUrl}
                onChange={(e) => setDeliverableUrl(e.target.value)}
                placeholder={t('deliverableUrl')}
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="ltr"
              />
              <button
                onClick={() => {
                  if (deliverableName && deliverableUrl) {
                    window.open(deliverableUrl, '_blank')
                    setDeliverableName('')
                    setDeliverableUrl('')
                  }
                }}
                className="rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700"
              >
                {t('addDeliverable')}
              </button>
            </div>
            <p className="py-4 text-center text-sm text-gray-400">{t('deliverablesPlaceholder')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
