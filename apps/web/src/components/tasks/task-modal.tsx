'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  useTask,
  useCreateTask,
  useUpdateTask,
  useProjectsList,
  useEmployeesList,
} from '@/hooks/use-tasks'

interface Props {
  taskId: string | null
  parentTaskId?: string | null
  projectId?: string | null
  onClose: () => void
}

export function TaskForm({ taskId, parentTaskId, projectId, onClose }: Props) {
  const t = useTranslations('tasks')
  const tCommon = useTranslations('common')
  const { data: existing } = useTask(taskId ?? '')
  const { data: projects } = useProjectsList()
  const { data: employees } = useEmployeesList()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM')
  const [selectedProjectId, setSelectedProjectId] = useState(projectId ?? '')
  const [assignedTo, setAssignedTo] = useState('')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [estimatedHours, setEstimatedHours] = useState(0)

  useEffect(() => {
    if (existing) {
      setTitle(existing.title)
      setDescription(existing.description ?? '')
      setPriority(existing.priority)
      setSelectedProjectId(existing.projectId ?? '')
      setAssignedTo(existing.assignedTo ?? '')
      setStartDate(existing.startDate ? existing.startDate.slice(0, 10) : '')
      setDueDate(existing.dueDate ? existing.dueDate.slice(0, 10) : '')
      setEstimatedHours(Number(existing.estimatedHours ?? 0))
    }
  }, [existing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    const body = {
      title,
      ...(description ? { description } : {}),
      priority,
      ...(selectedProjectId ? { projectId: selectedProjectId } : {}),
      ...(assignedTo ? { assignedTo } : {}),
      ...(startDate ? { startDate: new Date(startDate).toISOString() } : {}),
      ...(dueDate ? { dueDate: new Date(dueDate).toISOString() } : {}),
      ...(estimatedHours ? { estimatedHours } : {}),
      ...(parentTaskId ? { parentTaskId } : {}),
    }

    if (taskId) {
      await updateTask.mutateAsync({ id: taskId, ...body })
    } else {
      await createTask.mutateAsync(body)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-xl font-bold">{taskId ? t('editTitle') : t('createTitle')}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-sm font-medium">{t('title')}</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-sm font-medium">{t('description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              rows={3}
              dir="auto"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="mb-1 block text-sm font-medium">{t('priority')}</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as typeof priority)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="LOW">{t('low')}</option>
              <option value="MEDIUM">{t('medium')}</option>
              <option value="HIGH">{t('high')}</option>
              <option value="URGENT">{t('urgent')}</option>
            </select>
          </div>

          {/* Project */}
          <div>
            <label className="mb-1 block text-sm font-medium">{t('project')}</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">{t('noProject')}</option>
              {projects?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label className="mb-1 block text-sm font-medium">{t('assignee')}</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">{t('unassigned')}</option>
              {employees?.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullNameAr ?? emp.fullNameEn ?? emp.email}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date / Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('startDate')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('dueDate')}</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Estimated Hours */}
          <div>
            <label className="mb-1 block text-sm font-medium">{t('estimatedHours')}</label>
            <input
              type="number"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              min={0}
              step={0.5}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={createTask.isPending || updateTask.isPending}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {taskId ? tCommon('save') : tCommon('create')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              {tCommon('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
