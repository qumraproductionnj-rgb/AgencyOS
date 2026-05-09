'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuditLogs } from '@/hooks/use-audit-logs'

export default function AuditLogsPage() {
  const t = useTranslations('auditLogs')
  const tCommon = useTranslations('common')
  const [typeFilter, setTypeFilter] = useState('')
  const { data, isLoading } = useAuditLogs({
    ...(typeFilter ? { entityType: typeFilter } : {}),
    limit: 100,
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <input
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          placeholder={t('filterEntity')}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground p-4">{tCommon('loading')}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">{t('time')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('user')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('action')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('entity')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('ip')}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data?.items.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{log.user?.email ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${log.action.includes('_failed') ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="text-muted-foreground px-4 py-3">{log.entityType ?? '—'}</td>
                  <td className="px-4 py-3 font-mono text-xs">{log.ipAddress ?? '—'}</td>
                </tr>
              ))}
              {!data?.items.length && (
                <tr>
                  <td colSpan={5} className="text-muted-foreground px-4 py-8 text-center">
                    {t('noLogs')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
