'use client'

import { useState } from 'react'
import { AiToolPanel } from './ai-tool-panel'

interface Props {
  t: (key: string) => string
}

export function CulturalSensitivityCheck({ t }: Props) {
  const [content, setContent] = useState('')
  const [market, setMarket] = useState('')
  const [targetAudience, setTargetAudience] = useState('')

  return (
    <AiToolPanel title="cultural_sensitivity_check" icon="🌍">
      {({ output, busy, error, generate, reset }) => (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('market')}</label>
              <input
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
                placeholder={t('marketPlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">{t('targetAudience')}</label>
              <input
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                dir="auto"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">{t('contentToReview')}</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              dir="auto"
              placeholder={t('contentToReviewPlaceholder')}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() =>
                generate(
                  `Content to review:\n${content}\n\nTarget market: ${market || 'Iraq/Arab world'}\nTarget audience: ${targetAudience || 'General'}\n\nReview for cultural sensitivity.`,
                  'You are a cultural sensitivity expert for the Iraqi and Arab market. Review the content for: 1) Cultural taboos or sensitive topics 2) Religious appropriateness during religious seasons 3) Local customs and traditions 4) Language and dialect considerations 5) Political sensitivities 6) Recommended modifications. Be specific and constructive.',
                )
              }
              disabled={busy || !content.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {busy ? t('reviewing') : t('reviewContent')}
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
