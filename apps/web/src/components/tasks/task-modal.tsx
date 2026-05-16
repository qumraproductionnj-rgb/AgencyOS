'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import {
  useTask,
  useCreateTask,
  useUpdateTask,
  useProjectsList,
  useEmployeesList,
} from '@/hooks/use-tasks'
import { TaskSchema, type TaskFormValues } from '@/lib/schemas/task.schema'
import { FieldError } from '@/components/FieldError'

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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(TaskSchema),
    defaultValues: { priority: 'MEDIUM', projectId: projectId ?? '' },
  })

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        description: existing.description ?? '',
        priority: existing.priority,
        projectId: existing.projectId ?? '',
        assignedTo: existing.assignedTo ?? '',
        startDate: existing.startDate ? existing.startDate.slice(0, 10) : '',
        dueDate: existing.dueDate ? existing.dueDate.slice(0, 10) : '',
        estimatedHours: Number(existing.estimatedHours ?? 0) || undefined,
      })
    }
  }, [existing, reset])

  const onSubmit = async (data: TaskFormValues) => {
    const body = {
      title: data.title,
      ...(data.description ? { description: data.description } : {}),
      priority: data.priority,
      ...(data.projectId ? { projectId: data.projectId } : {}),
      ...(data.assignedTo ? { assignedTo: data.assignedTo } : {}),
      ...(data.startDate ? { startDate: new Date(data.startDate).toISOString() } : {}),
      ...(data.dueDate ? { dueDate: new Date(data.dueDate).toISOString() } : {}),
      ...(data.estimatedHours ? { estimatedHours: data.estimatedHours } : {}),
      ...(parentTaskId ? { parentTaskId } : {}),
    }
    if (taskId) {
      await updateTask.mutateAsync({ id: taskId, ...body })
    } else {
      await createTask.mutateAsync(body)
    }
    onClose()
  }

  const fc = (hasErr: boolean) =>
    `w-full rounded-md border px-3 py-2 text-sm ${hasErr ? 'border-red-400' : 'border-gray-300'}`

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-xl font-bold">{taskId ? t('editTitle') : t('createTitle')}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('title')} *</label>
            <input {...register('title')} className={fc(!!errors.title)} dir="auto" />
            <FieldError message={errors.title?.message} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('description')}</label>
            <textarea {...register('description')} className={fc(false)} rows={3} dir="auto" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('priority')}</label>
            <select {...register('priority')} className={fc(false)}>
              <option value="LOW">{t('low')}</option>
              <option value="MEDIUM">{t('medium')}</option>
              <option value="HIGH">{t('high')}</option>
              <option value="URGENT">{t('urgent')}</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('project')}</label>
            <select {...register('projectId')} className={fc(false)}>
              <option value="">{t('noProject')}</option>
              {projects?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('assignee')}</label>
            <select {...register('assignedTo')} className={fc(false)}>
              <option value="">{t('unassigned')}</option>
              {employees?.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.fullNameAr ?? e.email}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('startDate')}</label>
              <input type="date" {...register('startDate')} className={fc(false)} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('dueDate')}</label>
              <input type="date" {...register('dueDate')} className={fc(!!errors.dueDate)} />
              <FieldError message={errors.dueDate?.message} />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('estimatedHours')}</label>
            <input
              type="number"
              step="0.5"
              {...register('estimatedHours', { valueAsNumber: true })}
              className={fc(false)}
              min={0}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? tCommon('saving') : taskId ? tCommon('save') : tCommon('create')}
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
