'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  useCampaign,
  useCreateCampaign,
  useUpdateCampaign,
  useClientsList,
} from '@/hooks/use-campaigns'

interface Props {
  campaignId: string | null
  onClose: () => void
}

export function CampaignForm({ campaignId, onClose }: Props) {
  const t = useTranslations('campaigns')
  const tCommon = useTranslations('common')
  const { data: existing } = useCampaign(campaignId ?? '')
  const { data: clients } = useClientsList()
  const createCampaign = useCreateCampaign()
  const updateCampaign = useUpdateCampaign()

  const [clientId, setClientId] = useState('')
  const [name, setName] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState(0)
  const [currency, setCurrency] = useState('IQD')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (existing) {
      setClientId(existing.clientId)
      setName(existing.name)
      setNameEn(existing.nameEn ?? '')
      setDescription(existing.description ?? '')
      setBudget(Number(existing.budget))
      setCurrency(existing.currency)
      setStartDate(existing.startDate ? existing.startDate.slice(0, 10) : '')
      setEndDate(existing.endDate ? existing.endDate.slice(0, 10) : '')
    }
  }, [existing])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || !name || !endDate) return

    const body = {
      clientId,
      name,
      ...(nameEn ? { nameEn } : {}),
      ...(description ? { description } : {}),
      budget,
      currency,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
    }

    if (campaignId) {
      await updateCampaign.mutateAsync({ id: campaignId, ...body })
    } else {
      await createCampaign.mutateAsync(body)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-6 text-xl font-bold">{campaignId ? t('editTitle') : t('createTitle')}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('client')}</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              required
            >
              <option value="">{t('selectClient')}</option>
              {clients?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('name')}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('nameEn')}</label>
            <input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="ltr"
            />
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('budget')}</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                min={0}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('currency')}</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="IQD">IQD</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">{t('startDate')}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">{t('endDate')}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={createCampaign.isPending || updateCampaign.isPending}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {campaignId ? tCommon('save') : tCommon('create')}
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
