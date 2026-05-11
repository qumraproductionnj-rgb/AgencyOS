'use client'

import { useState } from 'react'
import { AiToolPanel } from './ai-tool-panel'

interface Props {
  t: (key: string) => string
}

const HOOK_PATTERNS = [
  'patternInterrupt',
  'boldClaim',
  'curiosityGap',
  'visualSurprise',
  'directQuestion',
  'numberTease',
] as const

export function HookLab({ t }: Props) {
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('')
  const [platform, setPlatform] = useState('')
  const [pattern, setPattern] = useState('')

  return (
    <AiToolPanel title="hook_lab" icon="🪝">
      {({ output, busy, error, generate, reset }) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('topic')}</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('tone')}</label>
              <input
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('platform')}</label>
              <input
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('hookPattern')}</label>
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">{t('anyPattern')}</option>
                {HOOK_PATTERNS.map((p) => (
                  <option key={p} value={p}>
                    {t(`hookPattern_${p}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                generate(
                  `Topic: ${topic}\nTone: ${tone}\nPlatform: ${platform}\nHook pattern: ${pattern || 'any'}\nGenerate 5 attention-grabbing hooks.`,
                  'You are a copywriting expert specializing in hooks that stop the scroll. For each hook, explain why it works.',
                )
              }
              disabled={busy || !topic}
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
