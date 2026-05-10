'use client'

import { useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useLeads, useUpdateLeadStatus, useDeleteLead } from '@/hooks/use-leads'
import type { LeadStatus, Lead } from '@/hooks/use-leads'
import { LeadModal } from './lead-modal'
import { LeadDetail } from './lead-detail'

const STAGES: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL',
  'NEGOTIATION',
  'WON',
  'LOST',
]

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
  NEW: 'border-t-gray-400',
  CONTACTED: 'border-t-blue-400',
  QUALIFIED: 'border-t-purple-400',
  PROPOSAL: 'border-t-indigo-400',
  NEGOTIATION: 'border-t-orange-400',
  WON: 'border-t-green-400',
  LOST: 'border-t-red-400',
}

export function LeadKanban() {
  const t = useTranslations('leads')
  const tCommon = useTranslations('common')
  const [search, setSearch] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | ''>('')
  const { data: leads, isLoading } = useLeads({
    ...(search ? { search } : {}),
    ...(selectedStatus ? { status: selectedStatus } : {}),
  })
  const updateStatus = useUpdateLeadStatus()
  const deleteLead = useDeleteLead()
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<LeadStatus | null>(null)

  const grouped = STAGES.reduce(
    (acc, stage) => {
      acc[stage] = (leads ?? []).filter((l) => l.status === stage)
      return acc
    },
    {} as Record<LeadStatus, Lead[]>,
  )

  const handleDragStart = useCallback((e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent, stage: LeadStatus) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(stage)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent, targetStage: LeadStatus) => {
      e.preventDefault()
      setDragOverColumn(null)
      const leadId = e.dataTransfer.getData('text/plain')
      if (!leadId) return
      const lead = (leads ?? []).find((l) => l.id === leadId)
      if (!lead || lead.status === targetStage) return
      if (lead.status === 'WON' || lead.status === 'LOST') return
      if (targetStage === 'WON' || targetStage === 'LOST') {
        if (!window.confirm(t('deleteConfirm'))) return
      }
      updateStatus.mutate({ id: leadId, status: targetStage })
    },
    [leads, updateStatus, t],
  )

  const leadCount = leads?.length ?? 0

  if (isLoading) return <p className="text-muted-foreground p-4">{tCommon('loading')}</p>

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
            {t('totalLeads')}: {leadCount}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('search')}
            className="w-48 rounded-md border border-gray-300 px-3 py-2 text-sm"
            dir="auto"
          />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as LeadStatus | '')}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">{tCommon('all')}</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {t(STAGE_LABELS[s])}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setEditId(null)
              setModalOpen(true)
            }}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            + {t('createTitle')}
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const cards = grouped[stage] ?? []
          return (
            <div
              key={stage}
              className={`flex min-w-[240px] flex-shrink-0 flex-col rounded-lg border bg-gray-50 ${
                STAGE_COLORS[stage]
              } border-t-4 ${dragOverColumn === stage ? 'bg-blue-50' : ''}`}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-sm font-semibold text-gray-700">
                  {t(STAGE_LABELS[stage])}
                </span>
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                  {cards.length}
                </span>
              </div>

              <div className="flex-1 space-y-2 px-2 pb-2">
                {cards.length === 0 && <p className="py-8 text-center text-xs text-gray-400">—</p>}
                {cards.map((lead) => (
                  <div
                    key={lead.id}
                    draggable={lead.status !== 'WON' && lead.status !== 'LOST'}
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onClick={() => setDetailId(lead.id)}
                    className={`cursor-pointer rounded-md border bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
                      lead.status === 'WON'
                        ? 'border-green-200 bg-green-50'
                        : lead.status === 'LOST'
                          ? 'border-red-200 bg-red-50 opacity-60'
                          : ''
                    }`}
                  >
                    <p className="truncate text-sm font-medium">{lead.name}</p>
                    {lead.companyName && (
                      <p className="mt-0.5 truncate text-xs text-gray-500">{lead.companyName}</p>
                    )}
                    {(lead.email || lead.phone) && (
                      <p className="mt-0.5 truncate text-xs text-gray-400">
                        {lead.email || lead.phone}
                      </p>
                    )}
                    {lead.source && <p className="mt-1 text-xs text-gray-400">{lead.source}</p>}
                    {lead.status !== 'WON' && lead.status !== 'LOST' && (
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (window.confirm(t('deleteConfirm'))) deleteLead.mutate(lead.id)
                          }}
                          className="text-xs text-red-400 hover:text-red-600"
                        >
                          {tCommon('delete')}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {modalOpen && (
        <LeadModal
          leadId={editId}
          onClose={() => {
            setModalOpen(false)
            setEditId(null)
          }}
        />
      )}

      {detailId && <LeadDetail leadId={detailId} onClose={() => setDetailId(null)} />}
    </div>
  )
}
