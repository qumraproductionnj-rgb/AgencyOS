export type AiModel = 'claude-sonnet-4-6' | 'claude-opus-4-7'

export interface GenerateOptions {
  model?: AiModel
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
}

export interface GenerateResult {
  content: string
  model: AiModel
  tokensInput: number
  tokensOutput: number
  costEstimateUsd: number
}

export interface PromptTemplate {
  toolType: string
  systemPrompt: string
  userPromptTemplate: string
  model: AiModel
  temperature: number
  maxTokens: number
}

export const MODEL_PRICING: Record<AiModel, { inputPerMillion: number; outputPerMillion: number }> =
  {
    'claude-sonnet-4-6': { inputPerMillion: 3, outputPerMillion: 15 },
    'claude-opus-4-7': { inputPerMillion: 15, outputPerMillion: 75 },
  }
