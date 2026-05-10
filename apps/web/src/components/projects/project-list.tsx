'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useProjects, useDeleteProject } from '@/hooks/use-projects'
import { ProjectForm } from './project-modal'
import { ProjectDetail } from './project-detail'

const STAGE_LABELS: Record<string, string> = {
  BRIEF: 'brief',
  PLANNING: 'planning',
  IN_PROGRESS: 'inProgress',
  REVIEW: 'review',
  COMPLETED: 'completed',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
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

const ALL_STAGES = [
  'BRIEF',
  'PLANNING',
  'IN_PROGRESS',
  'REVIEW',
  'COMPLETED',
  'DELIVERED',
  'CANCELLED',
]

export function ProjectList() {
  const t = useTranslations('projects')
  const tCommon = useTranslations('common')
  const [view, setView] = useState<'list' | 'kanban'>('list')
  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState('')
  const { data: projects, isLoading } = useProjects({
    ...(search ? { search } : {}),
    ...(filterStage ? { stage: filterStage } : {}),
  })
  const deleteProject = useDeleteProject()
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)

  if (isLoading) return <p className="text-muted-foreground p-4">{tCommon('loading')}</p>

  const formatCurrency = (value: number, currency: string) => {
    const sym = currency === 'IQD' ? 'د.ع' : currency === 'USD' ? '$' : currency
    return `${Number(value).toLocaleString()} ${sym}`
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="w-48 rounded-md border border-gray-300 px-3 py-2 text-sm"
            dir="auto"
          />
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">{tCommon('all')}</option>
            {ALL_STAGES.map((s) => (
              <option key={s} value={s}>
                {t(STAGE_LABELS[s])}
              </option>
            ))}
          </select>
          <div className="flex rounded-md border">
            <button
              onClick={() => setView('list')}
              className={`px-3 py-2 text-xs ${view === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {t('listView')}
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`px-3 py-2 text-xs ${view === 'kanban' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {t('kanbanView')}
            </button>
          </div>
          <button
            onClick={() => {
              setEditId(null)
              setFormOpen(true)
            }}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + {t('create')}
          </button>
        </div>
      </div>

      {view === 'list' ? (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">{t('name')}</th>
                <th className="px-4 py-3">{t('client')}</th>
                <th className="px-4 py-3">{t('budget')}</th>
                <th className="px-4 py-3">{t('stage')}</th>
                <th className="px-4 py-3">{t('deadline')}</th>
                <th className="px-4 py-3">{t('tasks')}</th>
                <th className="px-4 py-3">{tCommon('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects?.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    {t('noProjects')}
                  </td>
                </tr>
              )}
              {projects?.map((project) => (
                <tr
                  key={project.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setDetailId(project.id)}
                >
                  <td className="px-4 py-3 font-medium">
                    {project.name}
                    {project.nameEn && (
                      <span className="ml-1 text-xs text-gray-400">({project.nameEn})</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{project.client.name}</td>
                  <td className="px-4 py-3">{formatCurrency(project.budget, project.currency)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STAGE_COLORS[project.stage]}`}
                    >
                      {t(STAGE_LABELS[project.stage])}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {new Date(project.deadline).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{project._count?.tasks ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      {project.stage !== 'CANCELLED' && project.stage !== 'DELIVERED' && (
                        <button
                          onClick={() => {
                            setEditId(project.id)
                            setFormOpen(true)
                          }}
                          className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                        >
                          {tCommon('edit')}
                        </button>
                      )}
                      {(project.stage === 'BRIEF' || project.stage === 'CANCELLED') && (
                        <button
                          onClick={() => {
                            if (window.confirm(t('deleteConfirm'))) deleteProject.mutate(project.id)
                          }}
                          className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                        >
                          {tCommon('delete')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-7">
          {ALL_STAGES.filter((s) => s !== 'CANCELLED').map((stage) => (
            <div key={stage} className="rounded-md border bg-gray-50 p-2">
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-gray-500">
                {t(STAGE_LABELS[stage])}
                <span className="ml-1 text-gray-400">
                  ({projects?.filter((p) => p.stage === stage).length ?? 0})
                </span>
              </h3>
              <div className="space-y-2">
                {projects
                  ?.filter((p) => p.stage === stage)
                  .map((project) => (
                    <div
                      key={project.id}
                      onClick={() => setDetailId(project.id)}
                      className="cursor-pointer rounded-md border bg-white p-3 text-sm shadow-sm hover:shadow-md"
                    >
                      <p className="font-medium">{project.name}</p>
                      <p className="mt-1 text-xs text-gray-500">{project.client.name}</p>
                      <p className="text-xs text-gray-400">
                        {formatCurrency(project.budget, project.currency)}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {t('deadline')}: {new Date(project.deadline).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <ProjectForm
          projectId={editId}
          onClose={() => {
            setFormOpen(false)
            setEditId(null)
          }}
        />
      )}
      {detailId && <ProjectDetail projectId={detailId} onClose={() => setDetailId(null)} />}
    </div>
  )
}
