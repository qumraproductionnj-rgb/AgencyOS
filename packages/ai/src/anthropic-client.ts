import Anthropic from '@anthropic-ai/sdk'
import type { AiModel, GenerateOptions, GenerateResult } from './types'
import { calculateCost } from './cost-calculator'

export class AnthropicClient {
  private client: Anthropic
  private defaultModel: AiModel
  private premiumModel: AiModel

  constructor() {
    const apiKey = process.env['ANTHROPIC_API_KEY']
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }
    this.client = new Anthropic({ apiKey })
    this.defaultModel = (process.env['ANTHROPIC_MODEL_DEFAULT'] as AiModel) ?? 'claude-sonnet-4-6'
    this.premiumModel = (process.env['ANTHROPIC_MODEL_PREMIUM'] as AiModel) ?? 'claude-opus-4-7'
  }

  getDefaultModel(): AiModel {
    return this.defaultModel
  }

  getPremiumModel(): AiModel {
    return this.premiumModel
  }

  async generate(userPrompt: string, options?: GenerateOptions): Promise<GenerateResult> {
    const model = options?.model ?? this.defaultModel
    const systemPrompt = options?.systemPrompt

    const params: Record<string, unknown> = {
      model,
      max_tokens: options?.maxTokens ?? 2000,
      messages: [{ role: 'user', content: userPrompt }],
    }
    if (options?.temperature !== undefined) params['temperature'] = options.temperature
    if (systemPrompt) params['system'] = systemPrompt

    const message = await this.client.messages.create(params as never)

    const content = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as Anthropic.TextBlock).text)
      .join('\n')

    const tokensInput = message.usage?.input_tokens ?? 0
    const tokensOutput = message.usage?.output_tokens ?? 0
    const costEstimateUsd = calculateCost(model, tokensInput, tokensOutput)

    return {
      content,
      model,
      tokensInput,
      tokensOutput,
      costEstimateUsd,
    }
  }
}
