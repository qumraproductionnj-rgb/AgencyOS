'use client'

import { type ReactNode } from 'react'
import { useAiTool } from '@/hooks/use-ai-tool'

interface Props {
  title: string
  icon?: string
  children: (args: {
    output: string | null
    busy: boolean
    error: string | null
    generate: (prompt: string, systemPrompt?: string) => void
    reset: () => void
  }) => ReactNode
}

export function AiToolPanel({ title, icon, children }: Props) {
  const { output, busy, error, generate: apiGenerate, reset: apiReset } = useAiTool()

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b px-5 py-3">
        {icon && <span className="text-lg">{icon}</span>}
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="p-5">
        {children({
          output,
          busy,
          error,
          generate: (prompt, systemPrompt) => {
            apiGenerate({
              toolType: title.toLowerCase().replace(/\s+/g, '_'),
              prompt,
              systemPrompt,
            })
          },
          reset: apiReset,
        })}
      </div>
    </div>
  )
}
