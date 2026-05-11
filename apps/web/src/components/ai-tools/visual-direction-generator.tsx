'use client'

import { useState } from 'react'
import { AiToolPanel } from './ai-tool-panel'

interface Props {
  t: (key: string) => string
}

export function VisualDirectionGenerator({ t }: Props) {
  const [brandName, setBrandName] = useState('')
  const [concept, setConcept] = useState('')
  const [mood, setMood] = useState('')
  const [format, setFormat] = useState('')

  return (
    <AiToolPanel title="visual_direction_generator" icon="🎨">
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
              <label className="text-sm font-medium text-gray-700">{t('format')}</label>
              <input
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
                placeholder={t('formatPlaceholder')}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{t('conceptBrief')}</label>
            <textarea
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{t('mood')}</label>
            <input
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
              placeholder={t('moodPlaceholder')}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                generate(
                  `Brand: ${brandName}\nConcept: ${concept}\nMood: ${mood}\nFormat: ${format}\nCreate visual direction.`,
                  'You are a creative director. Write comprehensive visual direction covering: color palette, typography, imagery style, composition approach, lighting, and mood references.',
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
