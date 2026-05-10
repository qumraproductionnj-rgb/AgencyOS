'use client'

import { useTranslations } from 'next-intl'
import { useLead, useUpdateLeadStatus } from '@/hooks/use-leads'
import type { LeadStatus } from '@/hooks/use-leads'

interface Props {
  leadId: string
  onClose: () => void
}

const STAGE_LABELS: Record<LeadStatus, string> = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  PROPOSAL: 'proposal',
  NEGOTIATION: 'negotiation',
  WON: 'won',
  LOST: 'lost',
}

const STAGE_COLORS: Record<LeadStatus, string> = {
  NEW: 'bg-gray-100 text-gray-700',
  CONTACTED: 'bg-blue-100 text-blue-700',
  QUALIFIED: 'bg-purple-100 text-purple-700',
  PROPOSAL: 'bg-indigo-100 text-indigo-700',
  NEGOTIATION: 'bg-orange-100 text-orange-700',
  WON: 'bg-green-100 text-green-700',
  LOST: 'bg-red-100 text-red-700',
}

export function LeadDetail({ leadId, onClose }: Props) {
  const t = useTranslations('leads')
  const { data: lead, isLoading } = useLead(leadId)
  const updateStatus = useUpdateLeadStatus()

  if (isLoading || !lead) return null

  const isTerminal = lead.status === 'WON' || lead.status === 'LOST'
  const stageLabel = t(STAGE_LABELS[lead.status])

  const formatCurrency = (value: number | null, currency: string | null) => {
    if (value == null) return '—'
    const sym = currency === 'IQD' ? 'د.ع' : currency === 'USD' ? '$' : (currency ?? '')
    return `${value.toLocaleString()} ${sym}`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">{lead.name}</h2>
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

        <div className="mb-4">
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${STAGE_COLORS[lead.status]}`}
          >
            {stageLabel}
          </span>
        </div>

        {lead.convertedToClientId && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            <p className="font-medium">{t('convertedToClient')}</p>
            <p className="mt-1 text-green-600">{t('conversionInfo')}</p>
          </div>
        )}

        <div className="mb-6 space-y-3">
          <h3 className="text-sm font-semibold uppercase text-gray-500">{t('leadInfo')}</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {lead.companyName && (
              <>
                <span className="text-gray-500">{t('companyName')}</span>
                <span>{lead.companyName}</span>
              </>
            )}
            {lead.email && (
              <>
                <span className="text-gray-500">{t('email')}</span>
                <span>{lead.email}</span>
              </>
            )}
            {lead.phone && (
              <>
                <span className="text-gray-500">{t('phone')}</span>
                <span>{lead.phone}</span>
              </>
            )}
            {lead.source && (
              <>
                <span className="text-gray-500">{t('source')}</span>
                <span>{lead.source}</span>
              </>
            )}
            {lead.assignee && (
              <>
                <span className="text-gray-500">{t('assignedTo')}</span>
                <span>{lead.assignee.email}</span>
              </>
            )}
            <>
              <span className="text-gray-500">{t('created')}</span>
              <span>{new Date(lead.createdAt).toLocaleDateString()}</span>
            </>
          </div>
          {lead.notes && (
            <div className="pt-2 text-sm">
              <span className="text-gray-500">{t('notes')}: </span>
              <p className="mt-1 whitespace-pre-wrap text-gray-700">{lead.notes}</p>
            </div>
          )}
        </div>

        {!isTerminal && (
          <div className="mb-6 flex gap-3">
            <button
              onClick={() => updateStatus.mutate({ id: leadId, status: 'WON' })}
              disabled={updateStatus.isPending}
              className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
            >
              {t('markWon')}
            </button>
            <button
              onClick={() => updateStatus.mutate({ id: leadId, status: 'LOST' })}
              disabled={updateStatus.isPending}
              className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {t('markLost')}
            </button>
          </div>
        )}

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase text-gray-500">{t('deals')}</h3>
          {lead.deals.length === 0 ? (
            <p className="text-sm text-gray-400">{t('noDeals')}</p>
          ) : (
            <div className="space-y-2">
              {lead.deals.map((deal) => (
                <div key={deal.id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{deal.name}</span>
                    <span className="text-xs text-gray-500">{deal.stage}</span>
                  </div>
                  <p className="mt-1 text-gray-600">{formatCurrency(deal.value, deal.currency)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
