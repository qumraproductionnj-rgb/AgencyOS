'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import {
  useExhibition,
  useUpdateExhibitionStatus,
  useCreateSettlement,
} from '@/hooks/use-exhibitions'
import { BoothSection } from './booth-section'
import { FinancialSection } from './financial-section'
import { format } from 'date-fns'

interface Props {
  id: string
}

const STATUS_COLORS: Record<string, string> = {
  PLANNING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  CONCLUDED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  SETTLED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  PLANNING: ['ACTIVE'],
  ACTIVE: ['CONCLUDED'],
  CONCLUDED: ['SETTLED'],
}

export function ExhibitionDetail({ id }: Props) {
  const t = useTranslations('exhibitions')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const { data: item, isLoading } = useExhibition(id)
  const updateStatus = useUpdateExhibitionStatus()
  const createSettlement = useCreateSettlement()
  const [activeTab, setActiveTab] = useState('overview')

  if (isLoading) return <p className="text-muted-foreground p-4">{tCommon('loading')}</p>
  if (!item) return <p className="p-4 text-red-600">{t('notFound')}</p>

  const nextStatuses = STATUS_TRANSITIONS[item.status] ?? []

  const handleSettle = async () => {
    if (window.confirm(t('settleConfirm'))) {
      await createSettlement.mutateAsync(id)
    }
  }

  const tabs = [
    { key: 'overview', label: t('tabOverview') },
    { key: 'booths', label: t('tabBooths') },
    { key: 'financials', label: t('tabFinancials') },
    { key: 'settlement', label: t('tabSettlement') },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">
        &larr; {tCommon('back')}
      </button>

      {/* Header */}
      <div className="bg-card rounded-lg border p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{item.name}</h1>
            <p className="text-muted-foreground">
              {item.city}
              {item.country ? `, ${item.country}` : ''}
              {item.locationAddress && ` — ${item.locationAddress}`}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[item.status] ?? ''}`}
          >
            {t(`status_${item.status}`)}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground text-xs">{t('startDate')}</p>
            <p className="font-medium">{format(new Date(item.startDate), 'yyyy-MM-dd')}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">{t('endDate')}</p>
            <p className="font-medium">{format(new Date(item.endDate), 'yyyy-MM-dd')}</p>
          </div>
          {item.manager?.employee?.fullNameAr && (
            <div>
              <p className="text-muted-foreground text-xs">{t('manager')}</p>
              <p className="font-medium">{item.manager.employee.fullNameAr}</p>
            </div>
          )}
          <div>
            <p className="text-muted-foreground text-xs">{t('booths')}</p>
            <p className="font-medium">{item.booths?.length ?? 0}</p>
          </div>
        </div>

        {/* Status transitions */}
        {nextStatuses.length > 0 && (
          <div className="mt-4 flex gap-2 border-t pt-4">
            {nextStatuses.map((nextStatus) => (
              <button
                key={nextStatus}
                onClick={() => updateStatus.mutate({ id, status: nextStatus })}
                disabled={updateStatus.isPending}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {nextStatus === 'SETTLED' ? t('settle') : t(`transitionTo_${nextStatus}`)}
              </button>
            ))}
            {item.status === 'CONCLUDED' && (
              <button
                onClick={handleSettle}
                disabled={createSettlement.isPending}
                className="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700 disabled:opacity-50"
              >
                {t('generateSettlement')}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'text-muted-foreground hover:text-foreground border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="bg-card space-y-4 rounded-lg border p-6">
          <h2 className="text-lg font-semibold">{t('overview')}</h2>
          {item.settlement && (
            <div className="rounded-lg border bg-green-50 p-4 dark:bg-green-900/20">
              <p className="font-medium text-green-800 dark:text-green-200">{t('settled')}</p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {t('netProfit')}: {formatCurrency(item.settlement.netProfitIqd, 'IQD')} /{' '}
                {formatCurrency(item.settlement.netProfitUsd, 'USD')}
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-sm">{t('booths')}</p>
              <p className="text-lg font-semibold">{item.booths?.length ?? 0}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">{t('entries')}</p>
              <p className="text-lg font-semibold">{item.financials?.length ?? 0}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'booths' && <BoothSection exhibitionId={id} />}
      {activeTab === 'financials' && <FinancialSection exhibitionId={id} />}

      {activeTab === 'settlement' && (
        <div className="bg-card space-y-4 rounded-lg border p-6">
          {item.settlement ? (
            <SettlementView settlement={item.settlement} t={t} />
          ) : (
            <div>
              <p className="text-muted-foreground">{t('noSettlement')}</p>
              {item.status === 'CONCLUDED' && (
                <button
                  onClick={handleSettle}
                  disabled={createSettlement.isPending}
                  className="mt-4 rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {t('generateSettlement')}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function formatCurrency(amount: number, currency: string) {
  const value = Number(amount) / 1000
  return `${value.toFixed(1)}K ${currency}`
}

function SettlementView({
  settlement,
  t,
}: {
  settlement: {
    totalIncomeIqd: number
    totalIncomeUsd: number
    totalExpenseIqd: number
    totalExpenseUsd: number
    netProfitIqd: number
    netProfitUsd: number
    settledAt: string
  }
  t: (key: string) => string
}) {
  return (
    <>
      <h2 className="text-lg font-semibold">{t('settlementReport')}</h2>
      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-green-600">{t('income')}</h3>
          <p className="mt-2 text-lg font-bold">
            {formatCurrency(settlement.totalIncomeIqd, 'IQD')}
          </p>
          <p className="text-muted-foreground text-sm">
            {formatCurrency(settlement.totalIncomeUsd, 'USD')}
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium text-red-600">{t('expenses')}</h3>
          <p className="mt-2 text-lg font-bold">
            {formatCurrency(settlement.totalExpenseIqd, 'IQD')}
          </p>
          <p className="text-muted-foreground text-sm">
            {formatCurrency(settlement.totalExpenseUsd, 'USD')}
          </p>
        </div>
      </div>
      <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800/50">
        <h3 className="text-sm font-medium">{t('netProfit')}</h3>
        <p className="mt-2 text-xl font-bold">{formatCurrency(settlement.netProfitIqd, 'IQD')}</p>
        <p className="text-muted-foreground text-sm">
          {formatCurrency(settlement.netProfitUsd, 'USD')}
        </p>
      </div>
      <p className="text-muted-foreground text-xs">
        {t('settledOn')}: {format(new Date(settlement.settledAt), 'yyyy-MM-dd HH:mm')}
      </p>
    </>
  )
}
