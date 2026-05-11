'use client'

import { useState } from 'react'
import { AiToolPanel } from './ai-tool-panel'

interface Props {
  t: (key: string) => string
}

export function MusicMoodSuggester({ t }: Props) {
  const [contentType, setContentType] = useState('')
  const [mood, setMood] = useState('')
  const [pace, setPace] = useState('')
  const [duration, setDuration] = useState(30)

  return (
    <AiToolPanel title="music_mood_suggester" icon="🎵">
      {({ output, busy, error, generate, reset }) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('contentType')}</label>
              <input
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
                placeholder={t('contentTypePlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('mood')}</label>
              <input
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('pace')}</label>
              <input
                value={pace}
                onChange={(e) => setPace(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
                placeholder={t('pacePlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('durationSeconds')}</label>
              <input
                type="number"
                min={5}
                max={600}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10) || 30)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                generate(
                  `Content type: ${contentType}\nDesired mood: ${mood}\nPace: ${pace}\nDuration: ${duration}s\nSuggest background music tracks.`,
                  'You are a music supervisor. Suggest 3-5 music tracks with: track name, artist, genre, mood match, recommended section of video. Explain why each fits.',
                )
              }
              disabled={busy || !contentType}
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
