'use client'

import { useState } from 'react'
import { AiToolPanel } from './ai-tool-panel'

const FRAMEWORKS = [
  'aida',
  'pas',
  'hook_story_offer',
  'before_after_bridge',
  'problem_agitate_solution',
  'features_advantages_benefits',
  'storytelling',
  'educational',
] as const

interface Props {
  t: (key: string) => string
}

export function ScriptWriter({ t }: Props) {
  const [topic, setTopic] = useState('')
  const [duration, setDuration] = useState(30)
  const [tone, setTone] = useState('')
  const [hook, setHook] = useState('')
  const [framework, setFramework] = useState('aida')

  return (
    <AiToolPanel title="script_writer" icon="📜">
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
              <label className="text-sm font-medium text-gray-700">{t('durationSeconds')}</label>
              <input
                type="number"
                min={5}
                max={300}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10) || 30)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('tone')}</label>
              <input
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('framework')}</label>
              <select
                value={framework}
                onChange={(e) => setFramework(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                {FRAMEWORKS.map((f) => (
                  <option key={f} value={f}>
                    {t(`framework_${f}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{t('hookText')}</label>
            <input
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                generate(
                  `Topic: ${topic}\nDuration: ${duration}s\nTone: ${tone}\nFramework: ${framework}\nHook: ${hook || 'none'}\nWrite a complete script.`,
                  'You are a professional scriptwriter. Write a structured script with scenes/timings using the selected framework.',
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
