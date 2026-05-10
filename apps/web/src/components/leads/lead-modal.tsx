'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useLead, useCreateLead, useUpdateLead } from '@/hooks/use-leads'

interface Props {
  leadId: string | null
  onClose: () => void
}

export function LeadModal({ leadId, onClose }: Props) {
  const t = useTranslations('leads')
  const tCommon = useTranslations('common')
  const { data: existing } = useLead(leadId ?? '')
  const create = useCreateLead()
  const update = useUpdateLead()

  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [source, setSource] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setCompanyName(existing.companyName ?? '')
      setEmail(existing.email ?? '')
      setPhone(existing.phone ?? '')
      setSource(existing.source ?? '')
      setNotes(existing.notes ?? '')
    }
  }, [existing])

  const busy = create.isPending || update.isPending

  const handleSubmit = async () => {
    if (!name.trim()) return
    if (leadId) {
      await update.mutateAsync({
        id: leadId,
        name: name.trim(),
        ...(companyName.trim() ? { companyName: companyName.trim() } : {}),
        ...(email.trim() ? { email: email.trim() } : {}),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(source.trim() ? { source: source.trim() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      })
    } else {
      await create.mutateAsync({
        name: name.trim(),
        ...(companyName.trim() ? { companyName: companyName.trim() } : {}),
        ...(email.trim() ? { email: email.trim() } : {}),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(source.trim() ? { source: source.trim() } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      })
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">{leadId ? t('editTitle') : t('createTitle')}</h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">{t('name')} *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t('companyName')}</label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t('email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t('phone')}</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t('source')}</label>
            <input
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t('notes')}</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
          >
            {tCommon('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={busy || !name.trim()}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? tCommon('loading') : tCommon('save')}
          </button>
        </div>
      </div>
    </div>
  )
}
