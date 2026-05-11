'use client'

import { useState, useCallback } from 'react'
import { api } from '@/lib/api'

export interface AiGenerateParams {
  toolType: string
  prompt: string
  systemPrompt?: string | undefined
}

export function useAiTool() {
  const [output, setOutput] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (params: AiGenerateParams) => {
    setBusy(true)
    setError(null)
    setOutput(null)
    try {
      const res = await api.post<{ content: string }>('/v1/ai/generate', {
        toolType: params.toolType,
        prompt: params.prompt,
        systemPrompt: params.systemPrompt,
      })
      setOutput(res.content)
      return res.content
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Generation failed'
      setError(msg)
      return null
    } finally {
      setBusy(false)
    }
  }, [])

  const reset = useCallback(() => {
    setOutput(null)
    setError(null)
  }, [])

  return { output, busy, error, generate, reset } as const
}
