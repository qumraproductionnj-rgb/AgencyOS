'use client'

import { useState } from 'react'
import { AiToolPanel } from './ai-tool-panel'

interface Props {
  t: (key: string) => string
}

export function CarouselOutliner({ t }: Props) {
  const [topic, setTopic] = useState('')
  const [slideCount, setSlideCount] = useState(7)
  const [audience, setAudience] = useState('')
  const [goal, setGoal] = useState('')

  return (
    <AiToolPanel title="carousel_outliner" icon="🔄">
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
              <label className="text-sm font-medium text-gray-700">{t('slideCountLabel')}</label>
              <input
                type="number"
                min={3}
                max={15}
                value={slideCount}
                onChange={(e) => setSlideCount(parseInt(e.target.value, 10) || 7)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('targetAudience')}</label>
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('goal')}</label>
              <input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                generate(
                  `Topic: ${topic}\nSlides: ${slideCount}\nTarget audience: ${audience}\nGoal: ${goal}\nCreate a carousel outline.`,
                  'You are a social media carousel expert. Create a slide-by-slide outline. Slide 1 is Hook, slides 2-N-1 are value/educational content, last slide is CTA. For each slide: headline, 2-3 bullet points, visual note.',
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
