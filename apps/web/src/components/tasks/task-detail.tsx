'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  useTask,
  useUpdateTaskStatus,
  useAddComment,
  useDeleteComment,
  useStartTimer,
  useStopTimer,
  useDeleteTask,
} from '@/hooks/use-tasks'
import { TaskForm } from './task-modal'

interface Props {
  taskId: string
  onClose: () => void
}

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

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
}

// Allowed next transitions per status
const NEXT_TRANSITIONS: Record<string, string[]> = {
  TODO: ['IN_PROGRESS'],
  IN_PROGRESS: ['IN_REVIEW', 'TODO'],
  IN_REVIEW: ['DONE', 'IN_PROGRESS'],
  DONE: [],
  CANCELLED: [],
}

export function TaskDetail({ taskId, onClose }: Props) {
  const t = useTranslations('tasks')
  const tCommon = useTranslations('common')
  const { data: task, isLoading } = useTask(taskId)
  const updateStatus = useUpdateTaskStatus()
  const addComment = useAddComment()
  const deleteComment = useDeleteComment()
  const startTimer = useStartTimer()
  const stopTimer = useStopTimer()
  const removeTask = useDeleteTask()

  const [showForm, setShowForm] = useState(false)
  const [showSubtaskForm, setShowSubtaskForm] = useState(false)
  const [commentText, setCommentText] = useState('')

  if (isLoading || !task) return <p className="text-muted-foreground p-4">{tCommon('loading')}</p>

  const activeTimer = task.timeLogs?.find((tl) => !tl.endTime)
  const totalLoggedMinutes = task.timeLogs?.reduce((sum, tl) => sum + (tl.duration ?? 0), 0) ?? 0
  const transitions = NEXT_TRANSITIONS[task.status] ?? []

  const handleStatusChange = (status: string) => {
    updateStatus.mutate({ id: taskId, status })
  }

  const handleAddComment = async () => {
    if (!commentText.trim()) return
    await addComment.mutateAsync({ id: taskId, content: commentText.trim() })
    setCommentText('')
  }

  const handleDelete = () => {
    if (window.confirm(t('deleteConfirm'))) {
      removeTask.mutate(taskId)
      onClose()
    }
  }

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    return h > 0 ? `${h}h ${m}m` : `${m}m`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">{task.title}</h2>
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[task.status]}`}
              >
                {t(STATUS_LABELS[task.status])}
              </span>
              <span className="text-xs font-medium uppercase">
                {t(PRIORITY_LABELS[task.priority])}
              </span>
            </div>
            {task.project && (
              <p className="mt-1 text-sm text-gray-500">
                {t('project')}: {task.project.name}
              </p>
            )}
            {task.assignee && (
              <p className="text-sm text-gray-500">
                {t('assignee')}: {task.assignee.email}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            &times;
          </button>
        </div>

        {/* Stage progression buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {transitions.includes('IN_PROGRESS') && task.status === 'TODO' && (
            <button
              onClick={() => handleStatusChange('IN_PROGRESS')}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              {t('startTask')}
            </button>
          )}
          {transitions.includes('IN_REVIEW') && (
            <button
              onClick={() => handleStatusChange('IN_REVIEW')}
              className="rounded-md bg-yellow-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-yellow-700"
            >
              {t('moveToReview')}
            </button>
          )}
          {transitions.includes('DONE') && (
            <button
              onClick={() => handleStatusChange('DONE')}
              className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
            >
              {t('markDone')}
            </button>
          )}
          {transitions.includes('TODO') && (
            <button
              onClick={() => handleStatusChange('TODO')}
              className="rounded-md bg-gray-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
            >
              {t('reopen')}
            </button>
          )}
          {transitions.includes('IN_PROGRESS') && task.status !== 'TODO' && (
            <button
              onClick={() => handleStatusChange('IN_PROGRESS')}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
            >
              {t('sendBackToInProgress')}
            </button>
          )}
          {!['DONE', 'CANCELLED'].includes(task.status) && (
            <button
              onClick={() => handleStatusChange('CANCELLED')}
              className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
            >
              {t('cancelTask')}
            </button>
          )}
          {!['DONE', 'CANCELLED'].includes(task.status) && (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              {tCommon('edit')}
            </button>
          )}
        </div>

        {/* Info grid */}
        <div className="mb-6 grid grid-cols-3 gap-4 rounded-md border bg-gray-50 p-4 text-sm">
          <div>
            <p className="text-xs text-gray-500">{t('startDate')}</p>
            <p>{task.startDate ? new Date(task.startDate).toLocaleDateString() : '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{t('dueDate')}</p>
            <p>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{t('estimatedHours')}</p>
            <p>{task.estimatedHours ? `${task.estimatedHours}h` : '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{t('loggedTime')}</p>
            <p>{formatDuration(totalLoggedMinutes)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{t('subtasks')}</p>
            <p>{task.subTasks?.length ?? 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{t('comments')}</p>
            <p>{task.comments?.length ?? 0}</p>
          </div>
        </div>

        {/* Timer */}
        <div className="mb-6">
          <h3 className="mb-2 text-sm font-semibold">{t('timeTracking')}</h3>
          <div className="flex gap-2">
            {activeTimer ? (
              <button
                onClick={() => stopTimer.mutate({ id: taskId })}
                disabled={stopTimer.isPending}
                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {t('stopTimer')}
              </button>
            ) : (
              <button
                onClick={() => startTimer.mutate({ id: taskId })}
                disabled={startTimer.isPending}
                className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {t('startTimer')}
              </button>
            )}
          </div>
          {task.timeLogs && task.timeLogs.length > 0 && (
            <div className="mt-2 space-y-1">
              {task.timeLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center gap-3 text-xs text-gray-600">
                  <span>{new Date(log.startTime).toLocaleString()}</span>
                  {log.endTime && <span>→ {new Date(log.endTime).toLocaleString()}</span>}
                  {log.duration && (
                    <span className="font-medium">{formatDuration(log.duration)}</span>
                  )}
                  <span className="text-gray-400">{log.user.email}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold">{t('description')}</h3>
            <p className="whitespace-pre-wrap text-sm text-gray-700">{task.description}</p>
          </div>
        )}

        {/* Subtasks */}
        {task.subTasks && task.subTasks.length > 0 && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {t('subtasks')} ({task.subTasks.length})
              </h3>
            </div>
            <div className="space-y-1">
              {task.subTasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center gap-2 rounded-md border bg-gray-50 px-3 py-2 text-sm"
                >
                  <span
                    className={`h-2 w-2 rounded-full ${st.status === 'DONE' ? 'bg-green-500' : 'bg-gray-300'}`}
                  />
                  <span className={st.status === 'DONE' ? 'text-gray-400 line-through' : ''}>
                    {st.title}
                  </span>
                  <span className={`ml-auto text-xs ${STATUS_COLORS[st.status] ?? ''}`}>
                    {t(STATUS_LABELS[st.status] ?? st.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => setShowSubtaskForm(true)}
          className="mb-6 text-sm text-blue-600 hover:text-blue-800"
        >
          + {t('addSubtask')}
        </button>

        {/* Comments */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold">{t('comments')}</h3>

          {/* Comment list */}
          <div className="mb-3 space-y-3">
            {task.comments?.length === 0 && (
              <p className="text-xs text-gray-400">{t('noComments')}</p>
            )}
            {task.comments?.map((comment) => (
              <div key={comment.id} className="rounded-md border bg-gray-50 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">{comment.user.email}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                    <button
                      onClick={() => deleteComment.mutate({ taskId, commentId: comment.id })}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      {tCommon('delete')}
                    </button>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>

          {/* Add comment */}
          <div className="flex gap-2">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t('commentPlaceholder')}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              rows={2}
              dir="auto"
            />
            <button
              onClick={handleAddComment}
              disabled={!commentText.trim() || addComment.isPending}
              className="self-end rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {t('send')}
            </button>
          </div>
        </div>

        {/* Delete */}
        <div className="border-t pt-4">
          <button
            onClick={handleDelete}
            disabled={removeTask.isPending}
            className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            {tCommon('delete')}
          </button>
        </div>
      </div>

      {showForm && <TaskForm taskId={taskId} onClose={() => setShowForm(false)} />}
      {showSubtaskForm && (
        <TaskForm
          taskId={null}
          parentTaskId={taskId}
          projectId={task.projectId}
          onClose={() => setShowSubtaskForm(false)}
        />
      )}
    </div>
  )
}
