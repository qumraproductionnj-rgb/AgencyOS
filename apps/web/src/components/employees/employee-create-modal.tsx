'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useCreateEmployee } from '@/hooks/use-employees'
import { useDepartments, type Department } from '@/hooks/use-departments'
import { EmployeeSchema, type EmployeeFormValues } from '@/lib/schemas/employee.schema'
import { FieldError } from '@/components/FieldError'

interface Props {
  onClose: () => void
}

export function EmployeeCreateModal({ onClose }: Props) {
  const t = useTranslations('employees')
  const tCommon = useTranslations('common')
  const { data: departments } = useDepartments()
  const create = useCreateEmployee()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(EmployeeSchema),
    defaultValues: { startDate: new Date().toISOString().slice(0, 10) },
  })

  const onSubmit = async (data: EmployeeFormValues) => {
    const payload: Record<string, unknown> = {
      fullNameAr: data.fullNameAr.trim(),
      email: data.email.trim(),
      startDate: data.startDate,
    }
    if (data.fullNameEn?.trim()) payload['fullNameEn'] = data.fullNameEn.trim()
    if (data.phone?.trim()) payload['phone'] = data.phone.trim()
    if (data.position?.trim()) payload['position'] = data.position.trim()
    if (data.departmentId) payload['departmentId'] = data.departmentId
    await create.mutateAsync(payload)
    onClose()
  }

  const fc = (hasErr: boolean) =>
    `w-full rounded-md border px-3 py-2 text-sm ${hasErr ? 'border-red-400' : 'border-gray-300'}`

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">{t('createTitle')}</h2>
        <p className="text-muted-foreground mb-4 text-sm">{t('inviteSent')}</p>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-sm font-medium">{t('fullNameAr')} *</label>
              <input {...register('fullNameAr')} className={fc(!!errors.fullNameAr)} dir="rtl" />
              <FieldError message={errors.fullNameAr?.message} />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">{t('fullNameEn')}</label>
              <input {...register('fullNameEn')} className={fc(false)} dir="ltr" />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">{t('email')} *</label>
              <input {...register('email')} type="email" className={fc(!!errors.email)} dir="ltr" />
              <FieldError message={errors.email?.message} />
            </div>
            <div>
              <label className="text-sm font-medium">{t('phone')}</label>
              <input
                {...register('phone')}
                className={fc(!!errors.phone)}
                placeholder="+9647..."
                dir="ltr"
              />
              <FieldError message={errors.phone?.message} />
            </div>
            <div>
              <label className="text-sm font-medium">{t('position')}</label>
              <input {...register('position')} className={fc(false)} />
            </div>
            <div>
              <label className="text-sm font-medium">{t('department')}</label>
              <select {...register('departmentId')} className={fc(false)}>
                <option value="">—</option>
                {departments?.map((d: Department) => (
                  <option key={d.id} value={d.id}>
                    {d.nameAr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">{t('startDate')} *</label>
              <input type="date" {...register('startDate')} className={fc(!!errors.startDate)} />
              <FieldError message={errors.startDate?.message} />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? tCommon('loading') : tCommon('save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
