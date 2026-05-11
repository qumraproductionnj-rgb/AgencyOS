'use client'

import { useState } from 'react'
import { AiToolPanel } from './ai-tool-panel'

interface Props {
  t: (key: string) => string
}

export function ToneChecker({ t }: Props) {
  const [text, setText] = useState('')
  const [targetTone, setTargetTone] = useState('')
  const [brandVoice, setBrandVoice] = useState('')

  return (
    <AiToolPanel title="tone_checker" icon="📐">
      {({ output, busy, error, generate, reset }) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('targetTone')}</label>
              <input
                value={targetTone}
                onChange={(e) => setTargetTone(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
                placeholder={t('targetTonePlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('brandVoiceRef')}</label>
              <input
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
                placeholder={t('brandVoicePlaceholder')}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{t('textToCheck')}</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
              placeholder={t('textToCheckPlaceholder')}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                generate(
                  `Text to analyze:\n${text}\n\nTarget tone: ${targetTone}\nBrand voice guidelines: ${brandVoice || 'Not specified'}\n\nAnalyze the tone of this text.`,
                  'You are a brand voice expert. Analyze the text tone and provide: 1) Current tone assessment 2) Alignment score (1-10) with target tone 3) Specific sentences that are off-tone 4) Suggested rewrites for misaligned parts 5) Overall recommendations.',
                )
              }
              disabled={busy || !text.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? t('checking') : t('checkTone')}
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
