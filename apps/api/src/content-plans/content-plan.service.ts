import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { AiGenerationService } from '../ai/ai-generation.service'
import type {
  CreateContentPlanDto,
  UpdateContentPlanDto,
  UpdateStatusDto,
  GenerateIdeasDto,
  FinalizePlanDto,
  ContentPlanQueryDto,
} from './content-plan.dto'

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ['IN_REVIEW', 'CANCELLED'],
  IN_REVIEW: ['APPROVED', 'DRAFT', 'CANCELLED'],
  APPROVED: ['ACTIVE', 'DRAFT', 'CANCELLED'],
  ACTIVE: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
}

@Injectable()
export class ContentPlanService {
  private readonly logger = new Logger(ContentPlanService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiGenerationService,
  ) {}

  async findAll(companyId: string, query?: ContentPlanQueryDto) {
    const where: Record<string, unknown> = { companyId, deletedAt: null }
    if (query?.clientId) where['clientId'] = query.clientId
    if (query?.month) where['month'] = query.month
    if (query?.year) where['year'] = query.year
    if (query?.status) where['status'] = query.status

    return this.prisma.tenant.contentPlan.findMany({
      where: where as never,
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
        campaign: { select: { id: true, name: true } },
        _count: { select: { pieces: true } },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    })
  }

  async findOne(companyId: string, id: string) {
    const plan = await this.prisma.tenant.contentPlan.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
        campaign: { select: { id: true, name: true } },
        pieces: {
          where: { deletedAt: null },
          orderBy: { scheduledAt: 'asc' },
          include: {
            pillar: { select: { id: true, nameAr: true, nameEn: true, color: true } },
          },
        },
      },
    })
    if (!plan) throw new NotFoundException('Content plan not found')
    return plan
  }

  async create(companyId: string, userId: string, dto: CreateContentPlanDto) {
    const existing = await this.prisma.tenant.contentPlan.findFirst({
      where: {
        companyId,
        clientId: dto.clientId,
        year: dto.year,
        month: dto.month,
        deletedAt: null,
      },
      select: { id: true },
    })
    if (existing) {
      throw new ConflictException('A plan already exists for this client and month')
    }

    if (dto.campaignId) {
      const campaign = await this.prisma.tenant.campaign.findFirst({
        where: { id: dto.campaignId, companyId, deletedAt: null },
      })
      if (!campaign) throw new NotFoundException('Campaign not found')
    }

    const plan = await this.prisma.tenant.contentPlan.create({
      data: {
        companyId,
        clientId: dto.clientId,
        campaignId: dto.campaignId ?? null,
        month: dto.month,
        year: dto.year,
        title: dto.title ?? `${dto.month}/${dto.year}`,
        createdBy: userId,
      },
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
      },
    })

    this.logger.log(`Content plan created: ${plan.id} "${plan.title}"`)
    return plan
  }

  async update(companyId: string, id: string, userId: string, dto: UpdateContentPlanDto) {
    await this.findOne(companyId, id)

    const updateData: Record<string, unknown> = { updatedBy: userId }
    if (dto.title) updateData['title'] = dto.title
    if (dto.campaignId !== undefined) updateData['campaignId'] = dto.campaignId
    if (dto.status) updateData['status'] = dto.status
    if (dto.monthlyObjectives !== undefined) updateData['monthlyObjectives'] = dto.monthlyObjectives
    if (dto.pillarDistribution !== undefined)
      updateData['pillarDistribution'] = dto.pillarDistribution
    if (dto.contentTypeDistribution !== undefined)
      updateData['contentTypeDistribution'] = dto.contentTypeDistribution

    const updated = await this.prisma.tenant.contentPlan.update({
      where: { id },
      data: updateData,
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
      },
    })

    this.logger.log(`Content plan updated: ${id}`)
    return updated
  }

  async updateStatus(companyId: string, id: string, userId: string, dto: UpdateStatusDto) {
    const plan = await this.findOne(companyId, id)

    const allowed = VALID_TRANSITIONS[plan.status]
    if (!allowed || !allowed.includes(dto.status)) {
      throw new BadRequestException(
        `Cannot transition from ${plan.status} to ${dto.status}. Allowed: ${(allowed ?? []).join(', ') || 'none'}`,
      )
    }

    const updated = await this.prisma.tenant.contentPlan.update({
      where: { id },
      data: { status: dto.status as never, updatedBy: userId },
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
      },
    })

    this.logger.log(`Content plan ${id} → ${dto.status}`)
    return updated
  }

  async remove(companyId: string, id: string, userId: string) {
    await this.findOne(companyId, id)
    await this.prisma.tenant.contentPlan.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
    this.logger.log(`Content plan deleted: ${id}`)
  }

  async generateIdeas(companyId: string, id: string, dto: GenerateIdeasDto) {
    const plan = await this.findOne(companyId, id)

    const client = plan.client
    const direction = dto.direction ?? ''

    const ideasResult = await this.ai.generate(companyId, 'ai-system', {
      toolType: 'big_idea_generator',
      prompt: `Client: ${client.name}\nMonth: ${plan.month}/${plan.year}\nDirection: ${direction}\nGenerate ${dto.count} content ideas. Return as JSON array with fields: title, type (REEL|STORY|STATIC_DESIGN|CAROUSEL|VIDEO_LONG), pillarIndex (0-based), description.`,
      frameworkUsed: 'big_idea_generator',
    })

    let ideas: unknown[]
    try {
      ideas = JSON.parse(ideasResult.content)
      if (!Array.isArray(ideas)) ideas = []
    } catch {
      ideas = [{ title: ideasResult.content, type: 'REEL', pillarIndex: 0 }]
    }

    return {
      ideas,
      tokensInput: ideasResult.tokensInput,
      tokensOutput: ideasResult.tokensOutput,
      costEstimateUsd: ideasResult.costEstimateUsd,
    }
  }

  async finalize(companyId: string, id: string, userId: string, dto: FinalizePlanDto) {
    const plan = await this.findOne(companyId, id)

    const daysInMonth = new Date(plan.year, plan.month, 0).getDate()

    const pieces = dto.pieces.map((p) => {
      if (p.scheduledDay < 1 || p.scheduledDay > daysInMonth) {
        throw new BadRequestException(
          `Invalid day ${p.scheduledDay} for month with ${daysInMonth} days`,
        )
      }

      return {
        companyId,
        contentPlanId: id,
        clientId: plan.clientId,
        pillarId: p.pillarId ?? null,
        title: p.title,
        type: p.type as never,
        platforms: p.platforms,
        bigIdea: p.bigIdea ?? null,
        stage: 'IDEA' as never,
        scheduledAt: new Date(plan.year, plan.month - 1, p.scheduledDay),
        createdBy: userId,
      }
    })

    await this.prisma.tenant.contentPlan.update({
      where: { id },
      data: {
        totalPiecesPlanned: pieces.length,
        updatedBy: userId,
      },
    })

    await this.prisma.tenant.contentPiece.createMany({
      data: pieces,
    })

    const created = await this.prisma.tenant.contentPiece.findMany({
      where: { contentPlanId: id, deletedAt: null },
      orderBy: { scheduledAt: 'asc' },
    })

    this.logger.log(`Content plan ${id} finalized with ${pieces.length} pieces`)
    return created
  }
}
