'use client'

import { useState } from 'react'
import { AiToolPanel } from './ai-tool-panel'

interface Props {
  t: (key: string) => string
}

export function HeadlineTester({ t }: Props) {
  const [headline, setHeadline] = useState('')
  const [context, setContext] = useState('')

  return (
    <AiToolPanel title="headline_tester" icon="📝">
      {({ output, busy, error, generate, reset }) => (
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{t('headline')}</label>
            <textarea
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
              placeholder={t('headlinePlaceholder')}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{t('context')}</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
              placeholder={t('contextPlaceholder')}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                generate(
                  `Headlines to test:\n${headline}\n\nContext:\n${context || 'Not provided'}\n\nScore each headline (1-10) for engagement, clarity, and emotional impact. Suggest improvements.`,
                  'You are a headline specialist and copywriter. Analyze each headline, provide a score breakdown, and suggest specific improvements.',
                )
              }
              disabled={busy || !headline.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? t('generating') : t('testHeadlines')}
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
