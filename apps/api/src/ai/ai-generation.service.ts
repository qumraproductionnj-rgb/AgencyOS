import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  Inject,
  Optional,
} from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { AnthropicClient, PromptRegistry } from '@agencyos/ai'
import type { GenerateDto, GenerateResponseDto } from './ai.dto'

const MONTHLY_GENERATION_LIMIT = 1000

@Injectable()
export class AiGenerationService {
  private readonly logger = new Logger(AiGenerationService.name)
  private client: AnthropicClient
  private registry: PromptRegistry

  constructor(
    private readonly prisma: PrismaService,
    @Optional() @Inject('ANTHROPIC_CLIENT') client?: AnthropicClient,
    @Optional() @Inject('PROMPT_REGISTRY') registry?: PromptRegistry,
  ) {
    this.client = client ?? new AnthropicClient()
    this.registry = registry ?? new PromptRegistry()
  }

  async generate(
    companyId: string,
    userId: string,
    dto: GenerateDto,
  ): Promise<GenerateResponseDto> {
    await this.checkRateLimit(companyId)

    const inputData = { prompt: dto.prompt, systemPrompt: dto.systemPrompt, toolType: dto.toolType }
    const model =
      dto.model ?? this.registry.get(dto.toolType)?.model ?? this.client.getDefaultModel()
    const systemPrompt = dto.systemPrompt ?? this.registry.get(dto.toolType)?.systemPrompt
    const maxTokens = dto.maxTokens ?? this.registry.get(dto.toolType)?.maxTokens ?? 2000
    const temperature = dto.temperature ?? this.registry.get(dto.toolType)?.temperature ?? 0.7

    let result: {
      content: string
      model: string
      tokensInput: number
      tokensOutput: number
      costEstimateUsd: number
    }
    try {
      result = await this.client.generate(dto.prompt, {
        model,
        ...(systemPrompt ? { systemPrompt } : {}),
        maxTokens,
        temperature,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown AI generation error'
      this.logger.error(`AI generation failed for tool ${dto.toolType}: ${errorMessage}`)

      await this.prisma.tenant.aiGeneration.create({
        data: {
          companyId,
          userId,
          contentPieceId: dto.contentPieceId ?? null,
          toolType: dto.toolType,
          frameworkUsed: dto.frameworkUsed ?? null,
          inputData: inputData as never,
          outputData: { error: errorMessage } as never,
          modelUsed: model,
          tokensInput: 0,
          tokensOutput: 0,
          costEstimateUsd: 0,
          wasUsed: false,
        },
      })

      throw error
    }

    const generation = await this.prisma.tenant.aiGeneration.create({
      data: {
        companyId,
        userId,
        contentPieceId: dto.contentPieceId ?? null,
        toolType: dto.toolType,
        frameworkUsed: dto.frameworkUsed ?? null,
        inputData: inputData as never,
        outputData: { content: result.content } as never,
        modelUsed: result.model,
        tokensInput: result.tokensInput,
        tokensOutput: result.tokensOutput,
        costEstimateUsd: result.costEstimateUsd,
        wasUsed: false,
      },
    })

    this.logger.log(
      `AI generation: tool=${dto.toolType} model=${result.model} ` +
        `tokens=${result.tokensInput}+${result.tokensOutput} cost=$${result.costEstimateUsd}`,
    )

    return {
      id: generation.id,
      content: result.content,
      model: result.model,
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      costEstimateUsd: result.costEstimateUsd,
      toolType: dto.toolType,
    }
  }

  async getHistory(companyId: string, limit = 20, cursor?: string) {
    const items = await this.prisma.tenant.aiGeneration.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: {
        id: true,
        toolType: true,
        modelUsed: true,
        tokensInput: true,
        tokensOutput: true,
        costEstimateUsd: true,
        wasUsed: true,
        createdAt: true,
        userId: true,
      },
    })

    const hasMore = items.length > limit
    const data = hasMore ? items.slice(0, limit) : items

    return {
      data,
      nextCursor: hasMore ? data[data.length - 1]?.id : null,
    }
  }

  async markUsed(companyId: string, generationId: string, rating?: number) {
    const gen = await this.prisma.tenant.aiGeneration.findFirst({
      where: { id: generationId, companyId, deletedAt: null },
    })
    if (!gen) throw new NotFoundException('AI generation not found')

    const updateData: Record<string, unknown> = { wasUsed: true }
    if (rating !== undefined) updateData['userRating'] = rating

    return this.prisma.tenant.aiGeneration.update({
      where: { id: generationId },
      data: updateData,
    })
  }

  private async checkRateLimit(companyId: string): Promise<void> {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const count = await this.prisma.tenant.aiGeneration.count({
      where: {
        companyId,
        createdAt: { gte: startOfMonth },
      },
    })

    if (count >= MONTHLY_GENERATION_LIMIT) {
      throw new ForbiddenException({
        statusCode: 403,
        error: 'PLAN_LIMIT_EXCEEDED',
        message: `Monthly AI generation limit (${MONTHLY_GENERATION_LIMIT}) reached. Upgrade your plan for more.`,
      })
    }
  }
}
