import { z } from 'zod'

export const GenerateSchema = z.object({
  toolType: z.string().min(1).max(100),
  prompt: z.string().min(1).max(10000),
  systemPrompt: z.string().max(5000).optional(),
  model: z.enum(['claude-sonnet-4-6', 'claude-opus-4-7']).optional(),
  maxTokens: z.number().int().min(1).max(32000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  contentPieceId: z.string().uuid().optional(),
  frameworkUsed: z.string().max(100).optional(),
})

export type GenerateDto = z.infer<typeof GenerateSchema>

export interface GenerateResponseDto {
  id: string
  content: string
  model: string
  tokensInput: number
  tokensOutput: number
  costEstimateUsd: number
  toolType: string
}
