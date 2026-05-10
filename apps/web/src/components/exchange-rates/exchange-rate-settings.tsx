'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  useExchangeRates,
  useSetRate,
  useDeleteRate,
  useCurrentRate,
} from '@/hooks/use-exchange-rates'

const CURRENCY_PAIRS = [
  { from: 'USD', to: 'IQD', label: 'USD → IQD' },
  { from: 'USD', to: 'EUR', label: 'USD → EUR' },
  { from: 'EUR', to: 'IQD', label: 'EUR → IQD' },
]

export function ExchangeRateSettings() {
  const t = useTranslations('exchangeRates')
  const [selectedPair, setSelectedPair] = useState('USD_IQD')
  const [rateInput, setRateInput] = useState('')
  const { data: rates } = useExchangeRates()
  const parts = selectedPair.split('_') as [string, string]
  const { data: current } = useCurrentRate(parts[0], parts[1])
  const setRate = useSetRate()
  const deleteRate = useDeleteRate()

  const filteredRates = rates?.filter((r) => `${r.fromCurrency}_${r.toCurrency}` === selectedPair)

  const handleSetRate = () => {
    const p = selectedPair.split('_') as [string, string]
    const rate = parseFloat(rateInput)
    if (isNaN(rate) || rate <= 0) return
    setRate.mutate({ fromCurrency: p[0], toCurrency: p[1], rate })
    setRateInput('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{t('description')}</p>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="mb-3 text-lg font-semibold">{t('currentRate')}</h2>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">{t('currencyPair')}</label>
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="border-border rounded-md border px-3 py-2 text-sm"
            >
              {CURRENCY_PAIRS.map((pair) => (
                <option key={`${pair.from}_${pair.to}`} value={`${pair.from}_${pair.to}`}>
                  {pair.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">{t('rate')}</label>
            <input
              type="number"
              step="0.001"
              value={rateInput}
              onChange={(e) => setRateInput(e.target.value)}
              placeholder={current?.rate?.toString() ?? ''}
              className="border-border rounded-md border px-3 py-2 text-sm"
            />
          </div>

          <button
            onClick={handleSetRate}
            disabled={setRate.isPending || !rateInput}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {setRate.isPending ? t('setting') : t('setRate')}
          </button>
        </div>

        {current?.rate &&
          (() => {
            const c = selectedPair.split('_') as [string, string]
            return (
              <p className="mt-3 text-sm text-green-600">
                {t('currentLabel')}: {current.rate} {c[1]}
                {' / '}
                {c[0]}
              </p>
            )
          })()}
      </div>

      <div className="rounded-lg border">
        <div className="border-b px-4 py-3">
          <h2 className="text-lg font-semibold">{t('history')}</h2>
        </div>
        <div className="divide-y">
          {!filteredRates || filteredRates.length === 0 ? (
            <p className="p-6 text-center text-sm text-gray-400">{t('noRates')}</p>
          ) : (
            filteredRates.map((rate) => (
              <div key={rate.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <span className="font-medium">
                    {rate.fromCurrency} → {rate.toCurrency}
                  </span>
                  <span className="ml-3 text-gray-600">{rate.rate}</span>
                  {rate.isManual && (
                    <span className="ml-2 rounded bg-yellow-100 px-1.5 py-0.5 text-[10px] text-yellow-800">
                      {t('manual')}
                    </span>
                  )}
                  <p className="mt-0.5 text-xs text-gray-400">
                    {new Date(rate.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => deleteRate.mutate(rate.id)}
                    disabled={deleteRate.isPending}
                    className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
