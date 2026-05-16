'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import {
  useProject,
  useCreateProject,
  useUpdateProject,
  useClientsList,
  useCampaignsList,
} from '@/hooks/use-projects'
import { ProjectSchema, type ProjectFormValues } from '@/lib/schemas/project.schema'
import { FieldError } from '@/components/FieldError'

interface Props {
  projectId: string | null
  onClose: () => void
}

export function ProjectForm({ projectId, onClose }: Props) {
  const t = useTranslations('projects')
  const tCommon = useTranslations('common')
  const { data: existing } = useProject(projectId ?? '')
  const { data: clients } = useClientsList()
  const { data: campaigns } = useCampaignsList()
  const createProject = useCreateProject()
  const updateProject = useUpdateProject()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      currency: 'IQD',
      budget: 0,
      startDate: new Date().toISOString().slice(0, 10),
    },
  })

  useEffect(() => {
    if (existing) {
      reset({
        clientId: existing.clientId,
        campaignId: existing.campaignId ?? '',
        name: existing.name,
        nameEn: existing.nameEn ?? '',
        description: existing.description ?? '',
        budget: Number(existing.budget),
        currency: existing.currency as 'IQD' | 'USD',
        startDate: existing.startDate ? existing.startDate.slice(0, 10) : '',
        deadline: existing.deadline ? existing.deadline.slice(0, 10) : '',
      })
    }
  }, [existing, reset])

  const onSubmit = async (data: ProjectFormValues) => {
    const body = {
      clientId: data.clientId,
      ...(data.campaignId ? { campaignId: data.campaignId } : {}),
      name: data.name,
      ...(data.nameEn ? { nameEn: data.nameEn } : {}),
      ...(data.description ? { description: data.description } : {}),
      budget: data.budget,
      currency: data.currency,
      startDate: new Date(data.startDate).toISOString(),
      deadline: new Date(data.deadline).toISOString(),
    }
    if (projectId) {
      await updateProject.mutateAsync({ id: projectId, ...body })
    } else {
      await createProject.mutateAsync(body)
    }
    onClose()
  }

  const fieldClass = (hasError: boolean) =>
    `w-full rounded-md border px-3 py-2 text-sm ${hasError ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'}`

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-xl font-bold">{projectId ? t('editTitle') : t('createTitle')}</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('client')} *</label>
            <select {...register('clientId')} className={fieldClass(!!errors.clientId)}>
              <option value="">{t('selectClient')}</option>
              {clients?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <FieldError message={errors.clientId?.message} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('campaign')}</label>
            <select {...register('campaignId')} className={fieldClass(false)}>
              <option value="">{t('noCampaign')}</option>
              {campaigns?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('name')} *</label>
            <input
              {...register('name')}
              className={fieldClass(!!errors.name)}
              dir="auto"
              placeholder="3-100 characters"
            />
            <FieldError message={errors.name?.message} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('nameEn')}</label>
            <input {...register('nameEn')} className={fieldClass(false)} dir="ltr" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('description')}</label>
            <textarea
              {...register('description')}
              className={fieldClass(false)}
              rows={3}
              dir="auto"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('budget')}</label>
              <input
                type="number"
                {...register('budget', { valueAsNumber: true })}
                className={fieldClass(!!errors.budget)}
                min={0}
              />
              <FieldError message={errors.budget?.message} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('currency')}</label>
              <select {...register('currency')} className={fieldClass(false)}>
                <option value="IQD">IQD</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('startDate')} *</label>
              <input
                type="date"
                {...register('startDate')}
                className={fieldClass(!!errors.startDate)}
              />
              <FieldError message={errors.startDate?.message} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('deadline')} *</label>
              <input
                type="date"
                {...register('deadline')}
                className={fieldClass(!!errors.deadline)}
              />
              <FieldError message={errors.deadline?.message} />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? tCommon('saving') : projectId ? tCommon('save') : tCommon('create')}
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
