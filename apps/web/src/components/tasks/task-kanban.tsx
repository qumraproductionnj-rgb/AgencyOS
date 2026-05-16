'use client'

import { useTranslations } from 'next-intl'
import { useUpdateTaskStatus, useUpdateTask } from '@/hooks/use-tasks'
import type { Task } from '@/hooks/use-tasks'
import { InlineEdit } from '@/components/InlineEdit'

const STATUS_LABELS: Record<string, string> = {
  TODO: 'todo',
  IN_PROGRESS: 'inProgress',
  IN_REVIEW: 'inReview',
  DONE: 'done',
  CANCELLED: 'cancelled',
}

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-gray-500',
  MEDIUM: 'text-blue-600',
  HIGH: 'text-orange-600',
  URGENT: 'text-red-600 font-bold',
}

const KANBAN_COLUMNS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']

interface Props {
  tasks: Task[]
}

interface KanbanProps extends Props {
  onCardClick?: (taskId: string) => void
}

export function TaskKanban({ tasks, onCardClick }: KanbanProps) {
  const t = useTranslations('tasks')
  const updateStatus = useUpdateTaskStatus()
  const updateTask = useUpdateTask()

  const handleDrop = (taskId: string, newStatus: string) => {
    updateStatus.mutate({ id: taskId, status: newStatus })
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {KANBAN_COLUMNS.map((status) => (
        <div
          key={status}
          className="rounded-md border bg-gray-50 p-2"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const taskId = e.dataTransfer.getData('taskId')
            if (taskId) handleDrop(taskId, status)
          }}
        >
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-gray-500">
            {t(STATUS_LABELS[status])}
            <span className="ml-1 text-gray-400">
              ({tasks.filter((t) => t.status === status).length})
            </span>
          </h3>
          <div className="space-y-2">
            {tasks
              .filter((t) => t.status === status)
              .map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                  onClick={() => onCardClick?.(task.id)}
                  className="cursor-pointer rounded-md border bg-white p-3 text-sm shadow-sm hover:shadow-md"
                >
                  <div
                    className="flex items-start justify-between gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <InlineEdit
                      type="text"
                      value={task.title}
                      onSave={(v) => updateTask.mutateAsync({ id: task.id, title: v })}
                      className="w-full text-sm font-medium"
                    />
                    <span className={`whitespace-nowrap text-xs ${PRIORITY_COLORS[task.priority]}`}>
                      {t(task.priority.toLowerCase())}
                    </span>
                  </div>
                  {task.project && (
                    <p className="mt-1 text-xs text-gray-500">{task.project.name}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                    <span>{task.assignee?.email ?? '-'}</span>
                    {task.dueDate && <span>{new Date(task.dueDate).toLocaleDateString()}</span>}
                  </div>
                  {task.subTasks && task.subTasks.length > 0 && (
                    <p className="mt-1 text-xs text-gray-400">
                      {t('subtasks')}: {task.subTasks.length}
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
