'use client'

import { useState } from 'react'
import { AiToolPanel } from './ai-tool-panel'

interface Props {
  t: (key: string) => string
}

export function CtaGenerator({ t }: Props) {
  const [offer, setOffer] = useState('')
  const [audience, setAudience] = useState('')
  const [platform, setPlatform] = useState('')
  const [goal, setGoal] = useState('')

  return (
    <AiToolPanel title="cta_generator" icon="🎯">
      {({ output, busy, error, generate, reset }) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('offer')}</label>
              <input
                value={offer}
                onChange={(e) => setOffer(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('targetAudience')}</label>
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
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
              <label className="text-sm font-medium text-gray-700">{t('ctaGoal')}</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">{t('selectGoal')}</option>
                <option value="click">{t('goalClick')}</option>
                <option value="buy">{t('goalBuy')}</option>
                <option value="signup">{t('goalSignup')}</option>
                <option value="download">{t('goalDownload')}</option>
                <option value="share">{t('goalShare')}</option>
                <option value="comment">{t('goalComment')}</option>
                <option value="visit">{t('goalVisit')}</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                generate(
                  `Offer: ${offer}\nAudience: ${audience}\nPlatform: ${platform}\nGoal: ${goal || 'engagement'}\nGenerate CTAs.`,
                  'You are a conversion copywriter. Generate 5 compelling CTAs for the offer. Vary by: urgency level, benefit focus, action verb, and tone. Explain which works best for the platform and audience.',
                )
              }
              disabled={busy || !offer}
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
