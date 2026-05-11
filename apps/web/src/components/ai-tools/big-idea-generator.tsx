'use client'

import { useState } from 'react'
import { AiToolPanel } from './ai-tool-panel'

interface Props {
  t: (key: string) => string
}

export function BigIdeaGenerator({ t }: Props) {
  const [brandName, setBrandName] = useState('')
  const [objective, setObjective] = useState('')
  const [pillar, setPillar] = useState('')
  const [count, setCount] = useState(5)

  return (
    <AiToolPanel title="big_idea_generator" icon="💡">
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
              <label className="text-sm font-medium text-gray-700">{t('count')}</label>
              <input
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10) || 5)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{t('objective')}</label>
            <input
              value={objective}
              onChange={(e) => setObjective(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{t('pillar')}</label>
            <input
              value={pillar}
              onChange={(e) => setPillar(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                generate(
                  `Brand: ${brandName}\nObjective: ${objective}\nPillar: ${pillar}\nGenerate ${count} creative content ideas.`,
                  'You are a creative strategist for a marketing agency. Generate big, innovative content ideas that align with brand and objective.',
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
