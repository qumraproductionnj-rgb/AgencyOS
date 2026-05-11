import type { AiModel } from './types'
import { MODEL_PRICING } from './types'

export function calculateCost(model: AiModel, tokensInput: number, tokensOutput: number): number {
  const pricing = MODEL_PRICING[model]
  if (!pricing) return 0

  const inputCost = (tokensInput / 1_000_000) * pricing.inputPerMillion
  const outputCost = (tokensOutput / 1_000_000) * pricing.outputPerMillion

  return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000
}
