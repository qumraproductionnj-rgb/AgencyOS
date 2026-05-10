'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useClient, useDeleteContact } from '@/hooks/use-clients'
import { useCampaigns } from '@/hooks/use-campaigns'
import { ContactModal } from './contact-modal'

interface Props {
  clientId: string
  onClose: () => void
}

export function ClientDetail({ clientId, onClose }: Props) {
  const t = useTranslations('clients')
  const tCommon = useTranslations('common')
  const { data: client, isLoading } = useClient(clientId)
  const { data: clientCampaigns } = useCampaigns({ clientId })
  const deleteContact = useDeleteContact()
  const [tab, setTab] = useState<'overview' | 'contacts' | 'campaigns'>('overview')
  const [contactModal, setContactModal] = useState(false)
  const [editContactId, setEditContactId] = useState<string | null>(null)

  if (isLoading || !client) return null

  const tabs = [
    { key: 'overview' as const, label: t('overview') },
    { key: 'contacts' as const, label: t('contacts') },
    { key: 'campaigns' as const, label: t('campaigns') },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-2xl overflow-y-auto bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{client.name}</h2>
            {client.nameEn && <p className="text-sm text-gray-500">{client.nameEn}</p>}
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

        <div className="mb-4 flex gap-2">
          {client.isVip && (
            <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
              VIP
            </span>
          )}
          {client.isBlacklisted && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
              {t('blacklisted')}
            </span>
          )}
        </div>

        <div className="mb-6 flex gap-4 border-b">
          {tabs.map((tabItem) => (
            <button
              key={tabItem.key}
              onClick={() => setTab(tabItem.key)}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                tab === tabItem.key
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tabItem.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {client.email && (
                <>
                  <span className="text-gray-500">{t('email')}</span>
                  <span>{client.email}</span>
                </>
              )}
              {client.phone && (
                <>
                  <span className="text-gray-500">{t('phone')}</span>
                  <span>{client.phone}</span>
                </>
              )}
              {client.address && (
                <>
                  <span className="text-gray-500">{t('address')}</span>
                  <span>{client.address}</span>
                </>
              )}
              {client.website && (
                <>
                  <span className="text-gray-500">{t('website')}</span>
                  <span>{client.website}</span>
                </>
              )}
              <>
                <span className="text-gray-500">{t('revenue')}</span>
                <span>
                  {client.totalRevenueIqd
                    ? `${client.totalRevenueIqd.toLocaleString()} د.ع`
                    : client.totalRevenueUsd
                      ? `$${client.totalRevenueUsd.toLocaleString()}`
                      : '—'}
                </span>
              </>
              <>
                <span className="text-gray-500">{t('created')}</span>
                <span>{new Date(client.createdAt).toLocaleDateString()}</span>
              </>
            </div>
            {client.notes && (
              <div className="pt-2 text-sm">
                <span className="text-gray-500">{t('notes')}: </span>
                <p className="mt-1 whitespace-pre-wrap text-gray-700">{client.notes}</p>
              </div>
            )}

            {client.deals.length > 0 && (
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-500">{t('deals')}</h3>
                <div className="space-y-2">
                  {client.deals.map((deal) => (
                    <div key={deal.id} className="rounded-md border p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{deal.name}</span>
                        <span className="text-xs text-gray-500">{deal.stage}</span>
                      </div>
                      <p className="mt-1 text-gray-600">
                        {deal.value
                          ? `${Number(deal.value).toLocaleString()} ${deal.currency}`
                          : '—'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'campaigns' && (
          <div>
            {!clientCampaigns || clientCampaigns.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">{t('noCampaigns')}</p>
            ) : (
              <div className="space-y-2">
                {clientCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between rounded-md border p-3 text-sm"
                  >
                    <div>
                      <span className="font-medium">{campaign.name}</span>
                      {campaign.nameEn && (
                        <span className="ml-1 text-xs text-gray-400">({campaign.nameEn})</span>
                      )}
                      <p className="text-xs text-gray-500">
                        {Number(campaign.budget).toLocaleString()} {campaign.currency}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        campaign.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : campaign.status === 'PLANNING'
                            ? 'bg-gray-100 text-gray-700'
                            : campaign.status === 'PAUSED'
                              ? 'bg-yellow-100 text-yellow-700'
                              : campaign.status === 'COMPLETED'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'contacts' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-500">{t('contacts')}</h3>
              <button
                onClick={() => {
                  setEditContactId(null)
                  setContactModal(true)
                }}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                + {t('addContact')}
              </button>
            </div>

            {client.contacts.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">{t('noContacts')}</p>
            ) : (
              <div className="space-y-2">
                {client.contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between rounded-md border p-3 text-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{contact.name}</span>
                        {contact.isPrimary && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                            {t('primary')}
                          </span>
                        )}
                      </div>
                      {contact.position && (
                        <p className="text-xs text-gray-500">{contact.position}</p>
                      )}
                      {contact.email && <p className="text-xs text-gray-400">{contact.email}</p>}
                      {contact.phone && <p className="text-xs text-gray-400">{contact.phone}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditContactId(contact.id)
                          setContactModal(true)
                        }}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {tCommon('edit')}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(t('deleteContactConfirm')))
                            deleteContact.mutate({ clientId, id: contact.id })
                        }}
                        className="text-xs text-red-500 hover:underline"
                      >
                        {tCommon('delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {contactModal && (
          <ContactModal
            clientId={clientId}
            contactId={editContactId}
            onClose={() => {
              setContactModal(false)
              setEditContactId(null)
            }}
          />
        )}
      </div>
    </div>
  )
}
