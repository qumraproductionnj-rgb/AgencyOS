'use client'

import { useState } from 'react'
import { AiToolPanel } from './ai-tool-panel'

interface Props {
  t: (key: string) => string
}

export function StoryboardBuilder({ t }: Props) {
  const [script, setScript] = useState('')
  const [mood, setMood] = useState('')
  const [shotCount, setShotCount] = useState(8)

  return (
    <AiToolPanel title="storyboard_builder" icon="🎬">
      {({ output, busy, error, generate, reset }) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('mood')}</label>
              <input
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('shotCount')}</label>
              <input
                type="number"
                min={3}
                max={30}
                value={shotCount}
                onChange={(e) => setShotCount(parseInt(e.target.value, 10) || 8)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{t('script')}</label>
            <textarea
              value={script}
              onChange={(e) => setScript(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                generate(
                  `Script:\n${script || 'No script provided'}\n\nMood/style: ${mood}\nNumber of shots: ${shotCount}\nCreate a detailed shot-by-shot storyboard.`,
                  'You are a video director. Create a detailed storyboard with shot type, duration, camera movement, description, and notes for each shot.',
                )
              }
              disabled={busy}
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
