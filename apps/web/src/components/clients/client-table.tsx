'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useClients, useDeleteClient } from '@/hooks/use-clients'
import { ClientModal } from './client-modal'
import { ClientDetail } from './client-detail'
import { EmptyState } from '@/components/EmptyState'
import { SkeletonTable } from '@/components/SkeletonTable'
import { ConfirmDialog } from '@/components/ConfirmDialog'

export function ClientTable() {
  const t = useTranslations('clients')
  const tCommon = useTranslations('common')
  const [search, setSearch] = useState('')
  const [filterVip, setFilterVip] = useState('')
  const { data: clients, isLoading } = useClients({
    ...(search ? { search } : {}),
    ...(filterVip ? { vip: filterVip } : {}),
  })
  const deleteClient = useDeleteClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  if (isLoading) return <SkeletonTable rows={6} cols={5} />

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
            value={filterVip}
            onChange={(e) => setFilterVip(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">{tCommon('all')}</option>
            <option value="true">{t('vip')}</option>
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

      {!clients?.length ? (
        <EmptyState
          icon="🏢"
          title={t('noClients')}
          description={t('noClientsDesc')}
          actions={[{ label: `+ ${t('create')}`, onClick: () => setModalOpen(true) }]}
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t('name')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('email')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('phone')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('status')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('contacts')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('revenue')}</th>
                <th className="px-4 py-3 text-right font-medium">{tCommon('edit')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {clients.map((client) => (
                <tr
                  key={client.id}
                  className="hover:bg-muted/30 cursor-pointer"
                  onClick={() => setDetailId(client.id)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{client.name}</span>
                      {client.nameEn && (
                        <span className="text-xs text-gray-400">({client.nameEn})</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{client.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{client.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {client.isVip && (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                          VIP
                        </span>
                      )}
                      {client.isBlacklisted && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          {t('blacklisted')}
                        </span>
                      )}
                      {!client.isVip && !client.isBlacklisted && (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          {t('active')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{client._count?.contacts ?? 0}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {client.totalRevenueIqd
                      ? `${client.totalRevenueIqd.toLocaleString()} د.ع`
                      : client.totalRevenueUsd
                        ? `$${client.totalRevenueUsd.toLocaleString()}`
                        : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditId(client.id)
                        setModalOpen(true)
                      }}
                      className="text-blue-600 hover:underline"
                    >
                      {tCommon('edit')}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeleteId(client.id)
                      }}
                      className="ml-3 text-red-500 hover:underline"
                      disabled={deleteClient.isPending}
                    >
                      {tCommon('delete')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <ClientModal
          clientId={editId}
          onClose={() => {
            setModalOpen(false)
            setEditId(null)
          }}
        />
      )}

      {detailId && <ClientDetail clientId={detailId} onClose={() => setDetailId(null)} />}

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteClient.mutateAsync(deleteId!)}
        title={t('deleteConfirm')}
        description="Warning: this will also delete all contacts linked to this client."
        confirmLabel={tCommon('delete')}
        variant="danger"
        requireTyping="delete"
      />
    </div>
  )
}
