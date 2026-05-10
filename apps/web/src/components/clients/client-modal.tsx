'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useClient, useCreateClient, useUpdateClient } from '@/hooks/use-clients'

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

  const [name, setName] = useState('')
  const [nameEn, setNameEn] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [website, setWebsite] = useState('')
  const [isVip, setIsVip] = useState(false)
  const [isBlacklisted, setIsBlacklisted] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setNameEn(existing.nameEn ?? '')
      setEmail(existing.email ?? '')
      setPhone(existing.phone ?? '')
      setAddress(existing.address ?? '')
      setWebsite(existing.website ?? '')
      setIsVip(existing.isVip)
      setIsBlacklisted(existing.isBlacklisted)
      setNotes(existing.notes ?? '')
    }
  }, [existing])

  const busy = create.isPending || update.isPending

  const handleSubmit = async () => {
    if (!name.trim()) return
    if (clientId) {
      await update.mutateAsync({
        id: clientId,
        name: name.trim(),
        ...(nameEn.trim() ? { nameEn: nameEn.trim() } : {}),
        ...(email.trim() ? { email: email.trim() } : {}),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(address.trim() ? { address: address.trim() } : {}),
        ...(website.trim() ? { website: website.trim() } : {}),
        isVip,
        isBlacklisted,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      })
    } else {
      await create.mutateAsync({
        name: name.trim(),
        ...(nameEn.trim() ? { nameEn: nameEn.trim() } : {}),
        ...(email.trim() ? { email: email.trim() } : {}),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(address.trim() ? { address: address.trim() } : {}),
        ...(website.trim() ? { website: website.trim() } : {}),
        ...(isVip ? { isVip: true } : {}),
        ...(isBlacklisted ? { isBlacklisted: true } : {}),
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
        <h2 className="mb-4 text-lg font-semibold">
          {clientId ? t('editTitle') : t('createTitle')}
        </h2>

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
            <label className="text-sm font-medium">{t('nameEn')}</label>
            <input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
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
            <label className="text-sm font-medium">{t('address')}</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t('website')}</label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
            />
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isVip}
                onChange={(e) => {
                  setIsVip(e.target.checked)
                  if (e.target.checked) setIsBlacklisted(false)
                }}
                className="rounded"
              />
              {t('vip')}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isBlacklisted}
                onChange={(e) => {
                  setIsBlacklisted(e.target.checked)
                  if (e.target.checked) setIsVip(false)
                }}
                className="rounded"
              />
              {t('blacklisted')}
            </label>
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
