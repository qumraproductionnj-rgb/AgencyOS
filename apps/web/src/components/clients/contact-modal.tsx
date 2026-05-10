'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useClient, useCreateContact, useUpdateContact } from '@/hooks/use-clients'

interface Props {
  clientId: string
  contactId: string | null
  onClose: () => void
}

export function ContactModal({ clientId, contactId, onClose }: Props) {
  const t = useTranslations('clients')
  const tCommon = useTranslations('common')
  const { data: client } = useClient(clientId)
  const create = useCreateContact()
  const update = useUpdateContact()

  const editing = contactId ? client?.contacts.find((c) => c.id === contactId) : null

  const [name, setName] = useState(editing?.name ?? '')
  const [position, setPosition] = useState(editing?.position ?? '')
  const [email, setEmail] = useState(editing?.email ?? '')
  const [phone, setPhone] = useState(editing?.phone ?? '')
  const [isPrimary, setIsPrimary] = useState(editing?.isPrimary ?? false)

  useEffect(() => {
    if (editing) {
      setName(editing.name)
      setPosition(editing.position ?? '')
      setEmail(editing.email ?? '')
      setPhone(editing.phone ?? '')
      setIsPrimary(editing.isPrimary)
    }
  }, [editing])

  const busy = create.isPending || update.isPending

  const handleSubmit = async () => {
    if (!name.trim()) return
    if (contactId) {
      await update.mutateAsync({
        clientId,
        id: contactId,
        name: name.trim(),
        ...(position.trim() ? { position: position.trim() } : {}),
        ...(email.trim() ? { email: email.trim() } : {}),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        isPrimary,
      })
    } else {
      await create.mutateAsync({
        clientId,
        name: name.trim(),
        ...(position.trim() ? { position: position.trim() } : {}),
        ...(email.trim() ? { email: email.trim() } : {}),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        ...(isPrimary ? { isPrimary: true } : {}),
      })
    }
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">
          {contactId ? t('editContact') : t('addContact')}
        </h2>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">{t('contactName')} *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
            />
          </div>
          <div>
            <label className="text-sm font-medium">{t('position')}</label>
            <input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
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
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="rounded"
            />
            {t('primary')}
          </label>
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
