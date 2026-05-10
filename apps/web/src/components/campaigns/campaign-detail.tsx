'use client'

import { useTranslations } from 'next-intl'
import { useCampaign } from '@/hooks/use-campaigns'

interface Props {
  campaignId: string
  onClose: () => void
}

const STATUS_COLORS: Record<string, string> = {
  PLANNING: 'bg-gray-100 text-gray-700',
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-yellow-100 text-yellow-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export function CampaignDetail({ campaignId, onClose }: Props) {
  const t = useTranslations('campaigns')
  const { data: campaign, isLoading } = useCampaign(campaignId)

  if (isLoading || !campaign) return null

  const formatCurrency = (value: number, currency: string) => {
    const sym = currency === 'IQD' ? 'د.ع' : currency === 'USD' ? '$' : currency
    return `${Number(value).toLocaleString()} ${sym}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{campaign.name}</h2>
            {campaign.nameEn && <p className="text-sm text-gray-500">{campaign.nameEn}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <span
          className={`mb-4 inline-block rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[campaign.status]}`}
        >
          {t(campaign.status.toLowerCase() as string)}
        </span>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">{t('client')}</span>
            <span className="font-medium">{campaign.client.name}</span>
          </div>
          {campaign.description && (
            <div className="flex justify-between border-b pb-2">
              <span className="text-gray-500">{t('description')}</span>
              <span className="max-w-[60%] text-right font-medium">{campaign.description}</span>
            </div>
          )}
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">{t('budget')}</span>
            <span className="font-medium">
              {formatCurrency(campaign.budget, campaign.currency)}
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">{t('duration')}</span>
            <span className="text-xs font-medium">
              {new Date(campaign.startDate).toLocaleDateString()} —{' '}
              {new Date(campaign.endDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between border-b pb-2">
            <span className="text-gray-500">{t('projects')}</span>
            <span className="font-medium">{campaign.projects?.length ?? 0}</span>
          </div>
        </div>

        {campaign.projects && campaign.projects.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-500">{t('linkedProjects')}</h3>
            <div className="space-y-2">
              {campaign.projects.map((project) => (
                <div key={project.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{project.name}</span>
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {project.stage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(!campaign.projects || campaign.projects.length === 0) && (
          <div className="mt-6 rounded-md border border-dashed p-4 text-center text-sm text-gray-400">
            {t('noProjects')}
          </div>
        )}
      </div>
    </div>
  )
}
