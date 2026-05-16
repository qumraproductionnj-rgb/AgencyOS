'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useClient, useCreateClient, useUpdateClient } from '@/hooks/use-clients'
import { ClientSchema, type ClientFormValues } from '@/lib/schemas/client.schema'
import { FieldError } from '@/components/FieldError'

interface Props {
  clientId: string | null
  onClose: () => void
}

export function ClientModal({ clientId, onClose }: Props) {
  const t = useTranslations('clients')
  const tCommon = useTranslations('common')
  const { data: existing } = useClient(clientId ?? '')
  const create = useCreateClient()
  const update = useUpdateClient()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(ClientSchema),
    defaultValues: { isVip: false, isBlacklisted: false },
  })

  const isVip = watch('isVip')
  const isBlacklisted = watch('isBlacklisted')

  useEffect(() => {
    if (existing) {
      reset({
        name: existing.name,
        nameEn: existing.nameEn ?? '',
        email: existing.email ?? '',
        phone: existing.phone ?? '',
        address: existing.address ?? '',
        website: existing.website ?? '',
        isVip: existing.isVip,
        isBlacklisted: existing.isBlacklisted,
        notes: existing.notes ?? '',
      })
    }
  }, [existing, reset])

  const onSubmit = async (data: ClientFormValues) => {
    const payload = {
      name: data.name.trim(),
      ...(data.nameEn?.trim() ? { nameEn: data.nameEn.trim() } : {}),
      ...(data.email?.trim() ? { email: data.email.trim() } : {}),
      ...(data.phone?.trim() ? { phone: data.phone.trim() } : {}),
      ...(data.address?.trim() ? { address: data.address.trim() } : {}),
      ...(data.website?.trim() ? { website: data.website.trim() } : {}),
      isVip: data.isVip,
      isBlacklisted: data.isBlacklisted,
      ...(data.notes?.trim() ? { notes: data.notes.trim() } : {}),
    }
    if (clientId) {
      await update.mutateAsync({ id: clientId, ...payload })
    } else {
      await create.mutateAsync(payload)
    }
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
        <h2 className="mb-4 text-lg font-semibold">
          {clientId ? t('editTitle') : t('createTitle')}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="text-sm font-medium">{t('name')} *</label>
            <input {...register('name')} className={fc(!!errors.name)} dir="auto" />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <label className="text-sm font-medium">{t('nameEn')}</label>
            <input {...register('nameEn')} className={fc(false)} dir="ltr" />
          </div>
          <div>
            <label className="text-sm font-medium">{t('email')}</label>
            <input {...register('email')} type="email" className={fc(!!errors.email)} dir="ltr" />
            <FieldError message={errors.email?.message} />
          </div>
          <div>
            <label className="text-sm font-medium">{t('phone')}</label>
            <input {...register('phone')} className={fc(false)} dir="ltr" />
          </div>
          <div>
            <label className="text-sm font-medium">{t('address')}</label>
            <input {...register('address')} className={fc(false)} dir="auto" />
          </div>
          <div>
            <label className="text-sm font-medium">{t('website')}</label>
            <input
              {...register('website')}
              className={fc(!!errors.website)}
              dir="ltr"
              placeholder="https://..."
            />
            <FieldError message={errors.website?.message} />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register('isVip')}
                onChange={(e) => {
                  setValue('isVip', e.target.checked)
                  if (e.target.checked) setValue('isBlacklisted', false)
                }}
                checked={isVip}
                className="rounded"
              />
              {t('vip')}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                {...register('isBlacklisted')}
                onChange={(e) => {
                  setValue('isBlacklisted', e.target.checked)
                  if (e.target.checked) setValue('isVip', false)
                }}
                checked={isBlacklisted}
                className="rounded"
              />
              {t('blacklisted')}
            </label>
          </div>
          <FieldError message={errors.isBlacklisted?.message} />
          <div>
            <label className="text-sm font-medium">{t('notes')}</label>
            <textarea {...register('notes')} rows={3} className={fc(false)} dir="auto" />
          </div>

          <div className="mt-4 flex justify-end gap-3">
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
