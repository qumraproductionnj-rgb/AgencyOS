'use client'

import { useState } from 'react'
import { AiToolPanel } from './ai-tool-panel'

interface Props {
  t: (key: string) => string
}

export function StorySequenceBuilder({ t }: Props) {
  const [title, setTitle] = useState('')
  const [bigIdea, setBigIdea] = useState('')
  const [frameCount, setFrameCount] = useState(5)
  const [platform, setPlatform] = useState('')

  return (
    <AiToolPanel title="story_sequence_builder" icon="📖">
      {({ output, busy, error, generate, reset }) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('title')}</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('frameCount')}</label>
              <input
                type="number"
                min={3}
                max={10}
                value={frameCount}
                onChange={(e) => setFrameCount(parseInt(e.target.value, 10) || 5)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{t('bigIdea')}</label>
            <textarea
              value={bigIdea}
              onChange={(e) => setBigIdea(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{t('platform')}</label>
            <input
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
              placeholder={t('platformPlaceholder')}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                generate(
                  `Title: ${title}\nBig Idea: ${bigIdea}\nPlatform: ${platform || 'social media'}\nFrames: ${frameCount}\nCreate a story sequence.`,
                  'You are a social media story creator. Create an engaging frame-by-frame story sequence. For each frame include: visual description, text overlay, and engagement element. First frame is hook, last frame is CTA.',
                )
              }
              disabled={busy || !title}
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
