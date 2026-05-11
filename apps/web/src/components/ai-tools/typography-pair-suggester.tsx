'use client'

import { useState } from 'react'
import { AiToolPanel } from './ai-tool-panel'

const PAIR_CATEGORIES = [
  'serifSans',
  'sansSerif',
  'displayScript',
  'modernPair',
  'traditionalPair',
] as const

interface Props {
  t: (key: string) => string
}

export function TypographyPairSuggester({ t }: Props) {
  const [brandName, setBrandName] = useState('')
  const [industry, setIndustry] = useState('')
  const [personality, setPersonality] = useState('')
  const [category, setCategory] = useState('')

  return (
    <AiToolPanel title="typography_pair_suggester" icon="🔤">
      {({ output, busy, error, generate, reset }) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('brandName')}</label>
              <input
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('industry')}</label>
              <input
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('brandPersonality')}</label>
              <input
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
                placeholder={t('personalityPlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('styleCategory')}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">{t('anyStyle')}</option>
                {PAIR_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {t(`pairCategory_${c}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                generate(
                  `Brand: ${brandName}\nIndustry: ${industry}\nPersonality: ${personality}\nStyle preference: ${category || 'any'}\nSuggest typography pairs.`,
                  'You are a typography expert. Suggest 2-3 font pairings (headline + body). For each include: font names, why they work together, recommended weights, and usage guidelines. Consider Arabic/Latin compatibility.',
                )
              }
              disabled={busy || !brandName}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? t('generating') : t('generate')}
            </button>
            {output && (
              <button
                onClick={reset}
                className="rounded-md border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                {t('reset')}
              </button>
            )}
          </div>
          {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {output && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <pre className="whitespace-pre-wrap text-sm text-gray-800">{output}</pre>
            </div>
          )}
        </div>
      )}
    </AiToolPanel>
  )
}
