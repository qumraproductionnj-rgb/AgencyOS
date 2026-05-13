'use client'

import { useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { PortalLayout } from '@/components/portal-layout'
import { apiClient } from '@/lib/api'
import { cn } from '@/lib/utils'

interface PortalInvoice {
  id: string
  number: string
  total: number
  currency: string
  status: string
  dueDate: string
  issuedDate: string
  payments: { id: string; amount: number; currency: string; method: string; paidAt: string }[]
}

export default function InvoicesPage() {
  const t = useTranslations('invoices')
  const { data: invoices, isLoading } = useQuery<PortalInvoice[]>({
    queryKey: ['portal-invoices'],
    queryFn: () => apiClient('/portal/invoices'),
  })

  const statusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-700'
      case 'OVERDUE':
        return 'bg-red-100 text-red-700'
      case 'SENT':
        return 'bg-blue-100 text-blue-700'
      case 'PARTIALLY_PAID':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <PortalLayout>
      <h1 className="mb-6 text-2xl font-bold">{t('title')}</h1>
      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {!isLoading && invoices?.length === 0 && (
        <p className="text-muted-foreground">{t('noInvoices')}</p>
      )}
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left font-medium">{t('number')}</th>
              <th className="p-3 text-left font-medium">{t('total')}</th>
              <th className="p-3 text-left font-medium">{t('status')}</th>
              <th className="p-3 text-left font-medium">{t('dueDate')}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {invoices?.map((inv) => (
              <tr key={inv.id} className="hover:bg-muted/30">
                <td className="p-3">{inv.number}</td>
                <td className="p-3">
                  {inv.currency} {Number(inv.total).toLocaleString()}
                </td>
                <td className="p-3">
                  <span className={cn('rounded-full px-2 py-0.5 text-xs', statusColor(inv.status))}>
                    {inv.status}
                  </span>
                </td>
                <td className="p-3">{new Date(inv.dueDate).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PortalLayout>
  )
}
