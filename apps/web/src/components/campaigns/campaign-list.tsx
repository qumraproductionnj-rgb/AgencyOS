'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useCampaigns, useDeleteCampaign, useUpdateCampaignStatus } from '@/hooks/use-campaigns'
import { CampaignForm } from './campaign-modal'
import { CampaignDetail } from './campaign-detail'

const STATUS_LABELS: Record<string, string> = {
  PLANNING: 'planning',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

const STATUS_COLORS: Record<string, string> = {
  PLANNING: 'bg-gray-100 text-gray-700',
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export function CampaignList() {
  const t = useTranslations('campaigns')
  const tCommon = useTranslations('common')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const { data: campaigns, isLoading } = useCampaigns({
    ...(search ? { search } : {}),
    ...(filterStatus ? { status: filterStatus } : {}),
  })
  const deleteCampaign = useDeleteCampaign()
  const updateStatus = useUpdateCampaignStatus()
  const [formOpen, setFormOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)

  if (isLoading) return <p className="text-muted-foreground p-4">{tCommon('loading')}</p>

  const formatCurrency = (value: number, currency: string) => {
    const sym = currency === 'IQD' ? 'د.ع' : currency === 'USD' ? '$' : currency
    return `${Number(value).toLocaleString()} ${sym}`
  }

  const formatDate = (date: string) => new Date(date).toLocaleDateString()

  const allStatuses = ['PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']

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
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">{tCommon('all')}</option>
            {allStatuses.map((s) => (
              <option key={s} value={s}>
                {t(STATUS_LABELS[s])}
              </option>
            ))}
          </select>
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

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">{t('name')}</th>
              <th className="px-4 py-3">{t('client')}</th>
              <th className="px-4 py-3">{t('budget')}</th>
              <th className="px-4 py-3">{t('duration')}</th>
              <th className="px-4 py-3">{t('status')}</th>
              <th className="px-4 py-3">{t('projects')}</th>
              <th className="px-4 py-3">{tCommon('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {campaigns?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  {t('noCampaigns')}
                </td>
              </tr>
            )}
            {campaigns?.map((campaign) => (
              <tr
                key={campaign.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => setDetailId(campaign.id)}
              >
                <td className="px-4 py-3 font-medium">
                  {campaign.name}
                  {campaign.nameEn && (
                    <span className="ml-1 text-xs text-gray-400">({campaign.nameEn})</span>
                  )}
                </td>
                <td className="px-4 py-3">{campaign.client.name}</td>
                <td className="px-4 py-3">{formatCurrency(campaign.budget, campaign.currency)}</td>
                <td className="px-4 py-3 text-xs">
                  {formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[campaign.status]}`}
                  >
                    {t(STATUS_LABELS[campaign.status])}
                  </span>
                </td>
                <td className="px-4 py-3">{campaign._count?.projects ?? 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    {campaign.status === 'PLANNING' && (
                      <button
                        onClick={() => updateStatus.mutate({ id: campaign.id, status: 'ACTIVE' })}
                        className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-200"
                      >
                        {t('activate')}
                      </button>
                    )}
                    {(campaign.status === 'PLANNING' || campaign.status === 'PAUSED') && (
                      <button
                        onClick={() => {
                          setEditId(campaign.id)
                          setFormOpen(true)
                        }}
                        className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                      >
                        {tCommon('edit')}
                      </button>
                    )}
                    {campaign.status !== 'CANCELLED' && campaign.status !== 'COMPLETED' && (
                      <button
                        onClick={() =>
                          updateStatus.mutate({ id: campaign.id, status: 'CANCELLED' })
                        }
                        className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                      >
                        {t('cancel')}
                      </button>
                    )}
                    {(campaign.status === 'PLANNING' || campaign.status === 'CANCELLED') && (
                      <button
                        onClick={() => {
                          if (window.confirm(t('deleteConfirm'))) deleteCampaign.mutate(campaign.id)
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

      {formOpen && (
        <CampaignForm
          campaignId={editId}
          onClose={() => {
            setFormOpen(false)
            setEditId(null)
          }}
        />
      )}

      {detailId && <CampaignDetail campaignId={detailId} onClose={() => setDetailId(null)} />}
    </div>
  )
}
