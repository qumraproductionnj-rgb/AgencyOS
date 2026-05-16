'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useTasks, useDeleteTask } from '@/hooks/use-tasks'
import { TaskForm } from './task-modal'
import { TaskDetail } from './task-detail'
import { TaskKanban } from './task-kanban'
import { EmptyState } from '@/components/EmptyState'
import { SkeletonTable } from '@/components/SkeletonTable'
import { ConfirmDialog } from '@/components/ConfirmDialog'

const STATUS_LABELS: Record<string, string> = {
  TODO: 'todo',
  IN_PROGRESS: 'inProgress',
  IN_REVIEW: 'inReview',
  DONE: 'done',
  CANCELLED: 'cancelled',
}

const STATUS_COLORS: Record<string, string> = {
  TODO: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-gray-500',
  MEDIUM: 'text-blue-600',
  HIGH: 'text-orange-600',
  URGENT: 'text-red-600 font-bold',
}

const ALL_STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']

export function TaskList() {
  const t = useTranslations('tasks')
  const tCommon = useTranslations('common')
  const [view, setView] = useState<'list' | 'kanban'>('list')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const { data: tasks, isLoading } = useTasks({
    ...(search ? { search } : {}),
    ...(filterStatus ? { status: filterStatus } : {}),
    ...(filterPriority ? { priority: filterPriority } : {}),
  })
  const deleteTask = useDeleteTask()
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  if (isLoading) return <SkeletonTable rows={6} cols={6} />

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t('pageTitle')}</h1>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="w-44 rounded-md border border-gray-300 px-3 py-2 text-sm"
            dir="auto"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">{tCommon('all')}</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(STATUS_LABELS[s])}
              </option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">{tCommon('all')}</option>
            {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((p) => (
              <option key={p} value={p}>
                {t(p.toLowerCase())}
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

      {/* List View */}
      {view === 'list' ? (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">{t('title')}</th>
                <th className="px-4 py-3">{t('project')}</th>
                <th className="px-4 py-3">{t('priority')}</th>
                <th className="px-4 py-3">{t('status')}</th>
                <th className="px-4 py-3">{t('assignee')}</th>
                <th className="px-4 py-3">{t('dueDate')}</th>
                <th className="px-4 py-3">{t('subtasks')}</th>
                <th className="px-4 py-3">{tCommon('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tasks?.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-4">
                    <EmptyState
                      icon="✅"
                      title={t('noTasks')}
                      description={t('noTasksDesc')}
                      actions={[
                        {
                          label: `+ ${t('create')}`,
                          onClick: () => {
                            setEditId(null)
                            setFormOpen(true)
                          },
                        },
                      ]}
                    />
                  </td>
                </tr>
              )}
              {tasks?.map((task) => (
                <tr
                  key={task.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setDetailId(task.id)}
                >
                  <td className="px-4 py-3 font-medium">
                    {task.title}
                    {task.description && (
                      <p className="mt-0.5 max-w-xs truncate text-xs text-gray-400">
                        {task.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs">{task.project?.name ?? '-'}</td>
                  <td className={`px-4 py-3 text-xs ${PRIORITY_COLORS[task.priority]}`}>
                    {t(task.priority.toLowerCase())}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[task.status]}`}
                    >
                      {t(STATUS_LABELS[task.status])}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{task.assignee?.email ?? '-'}</td>
                  <td className="px-4 py-3 text-xs">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-xs">{task.subTasks?.length ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      {task.status !== 'CANCELLED' && task.status !== 'DONE' && (
                        <button
                          onClick={() => {
                            setEditId(task.id)
                            setFormOpen(true)
                          }}
                          className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                        >
                          {tCommon('edit')}
                        </button>
                      )}
                      {(task.status === 'TODO' || task.status === 'CANCELLED') && (
                        <button
                          onClick={() => {
                            setDeleteId(task.id)
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
        <TaskKanban tasks={tasks ?? []} onCardClick={(id) => setDetailId(id)} />
      )}

      {formOpen && (
        <TaskForm
          taskId={editId}
          onClose={() => {
            setFormOpen(false)
            setEditId(null)
          }}
        />
      )}
      {detailId && <TaskDetail taskId={detailId} onClose={() => setDetailId(null)} />}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteTask.mutateAsync(deleteId!)}
        title={t('deleteConfirm')}
        confirmLabel={tCommon('delete')}
        variant="danger"
      />
    </div>
  )
}
