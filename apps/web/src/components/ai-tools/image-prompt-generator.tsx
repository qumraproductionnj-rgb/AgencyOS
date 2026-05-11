'use client'

import { useState } from 'react'
import { AiToolPanel } from './ai-tool-panel'

interface Props {
  t: (key: string) => string
}

export function ImagePromptGenerator({ t }: Props) {
  const [concept, setConcept] = useState('')
  const [style, setStyle] = useState('')
  const [mood, setMood] = useState('')
  const [aspectRatio, setAspectRatio] = useState('')

  return (
    <AiToolPanel title="image_prompt_generator" icon="🖌️">
      {({ output, busy, error, generate, reset }) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('conceptBrief')}</label>
              <input
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('style')}</label>
              <input
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
                placeholder={t('imageStylePlaceholder')}
              />
            </div>
          </div>
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
              <label className="text-sm font-medium text-gray-700">{t('aspectRatio')}</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">{t('selectRatio')}</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="4:5">4:5 (Portrait)</option>
                <option value="16:9">16:9 (Landscape)</option>
                <option value="9:16">9:16 (Story/Reel)</option>
                <option value="3:2">3:2</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                generate(
                  `Concept: ${concept}\nStyle: ${style || 'realistic'}\nMood: ${mood}\nAspect ratio: ${aspectRatio || 'not specified'}\nGenerate an optimized image generation prompt.`,
                  'You are a visual creative director. Generate a detailed, optimized English prompt for AI image generation (Midjourney/DALL-E). Include: subject, environment, lighting, color palette, composition, camera details, and style references.',
                )
              }
              disabled={busy || !concept.trim()}
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
