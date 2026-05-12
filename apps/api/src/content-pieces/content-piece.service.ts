import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import type {
  UpdateContentPieceDto,
  UpdateStageDto,
  CreateRevisionDto,
  UpdateRevisionDto,
} from './content-piece.dto'
import { VALID_CONTENT_STAGE_TRANSITIONS } from './content-piece.dto'
import { IntegrationService } from '../integrations/integration.service'

@Injectable()
export class ContentPieceService {
  private readonly logger = new Logger(ContentPieceService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly integration: IntegrationService,
  ) {}

  async findOne(companyId: string, id: string) {
    const piece = await this.prisma.tenant.contentPiece.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        plan: { select: { id: true, month: true, year: true, title: true } },
        client: { select: { id: true, name: true, nameEn: true } },
        pillar: { select: { id: true, nameAr: true, nameEn: true, color: true } },
        project: { select: { id: true, name: true } },
        revisions: { where: { deletedAt: null }, orderBy: { roundNumber: 'desc' } },
      },
    })
    if (!piece) throw new NotFoundException('Content piece not found')
    return piece
  }

  async update(companyId: string, id: string, userId: string, dto: UpdateContentPieceDto) {
    await this.findOne(companyId, id)

    const updateData: Record<string, unknown> = { updatedBy: userId }
    if (dto.title) updateData['title'] = dto.title
    if (dto.bigIdea !== undefined) updateData['bigIdea'] = dto.bigIdea
    if (dto.frameworkUsed !== undefined) updateData['frameworkUsed'] = dto.frameworkUsed
    if (dto.frameworkData !== undefined) updateData['frameworkData'] = dto.frameworkData
    if (dto.components !== undefined) updateData['components'] = dto.components
    if (dto.captionAr !== undefined) updateData['captionAr'] = dto.captionAr
    if (dto.captionEn !== undefined) updateData['captionEn'] = dto.captionEn
    if (dto.hashtags !== undefined) updateData['hashtags'] = dto.hashtags
    if (dto.ctaText !== undefined) updateData['ctaText'] = dto.ctaText
    if (dto.ctaLink !== undefined) updateData['ctaLink'] = dto.ctaLink
    if (dto.linkedAssets !== undefined) updateData['linkedAssets'] = dto.linkedAssets
    if (dto.inspirationRefs !== undefined) updateData['inspirationRefs'] = dto.inspirationRefs
    if (dto.scheduledAt !== undefined) updateData['scheduledAt'] = dto.scheduledAt
    if (dto.platforms !== undefined) updateData['platforms'] = dto.platforms

    const updated = await this.prisma.tenant.contentPiece.update({
      where: { id },
      data: updateData,
      include: {
        plan: { select: { id: true, month: true, year: true, title: true } },
        client: { select: { id: true, name: true, nameEn: true } },
        pillar: { select: { id: true, nameAr: true, nameEn: true, color: true } },
      },
    })

    this.logger.log(`Content piece updated: ${id}`)
    return updated
  }

  async updateStage(companyId: string, id: string, userId: string, dto: UpdateStageDto) {
    const piece = await this.findOne(companyId, id)
    const currentStage = piece.stage
    const targetStage = dto.stage

    if (currentStage === targetStage) return piece

    const allowed = VALID_CONTENT_STAGE_TRANSITIONS[currentStage] ?? []
    if (!allowed.includes(targetStage)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStage} to ${targetStage}. Allowed transitions: ${allowed.join(', ')}`,
      )
    }

    const updateData: Record<string, unknown> = {
      stage: targetStage,
      updatedBy: userId,
    }

    if (targetStage === 'APPROVED') {
      updateData['internalApprovedAt'] = new Date()
      updateData['internalApproverId'] = userId
    }

    const updated = await this.prisma.tenant.contentPiece.update({
      where: { id },
      data: updateData,
    })

    this.logger.log(`Content piece ${id} stage: ${currentStage} → ${targetStage}`)

    if (targetStage === 'APPROVED') {
      this.integration.onPieceApproved(companyId, id, userId).catch((err) => {
        this.logger.error(`Integration hook failed for piece ${id}: ${(err as Error).message}`)
      })
    }

    if (targetStage === 'SCHEDULED') {
      this.integration.onPieceScheduled(companyId, id, userId).catch((err) => {
        this.logger.error(`Integration hook failed for piece ${id}: ${(err as Error).message}`)
      })
    }

    return updated
  }

  // ─── Revisions ─────────────────────────────────────

  async findRevisions(companyId: string, pieceId: string) {
    await this.findOne(companyId, pieceId)
    return this.prisma.tenant.contentRevision.findMany({
      where: { contentPieceId: pieceId, deletedAt: null },
      orderBy: { roundNumber: 'desc' },
      include: {
        requester: {
          select: {
            id: true,
            email: true,
            employee: { select: { fullNameAr: true, fullNameEn: true } },
          },
        },
        resolver: {
          select: {
            id: true,
            email: true,
            employee: { select: { fullNameAr: true, fullNameEn: true } },
          },
        },
      },
    })
  }

  async createRevision(companyId: string, pieceId: string, userId: string, dto: CreateRevisionDto) {
    await this.findOne(companyId, pieceId)

    const revision = await this.prisma.tenant.contentRevision.create({
      data: {
        companyId,
        contentPieceId: pieceId,
        roundNumber: dto.roundNumber,
        requestedBy: userId,
        feedbackText: dto.feedbackText ?? null,
        feedbackAnnotations: (dto.feedbackAnnotations ?? undefined) as never,
        attachedFiles: dto.attachedFiles ?? [],
        status: 'PENDING' as never,
        createdBy: userId,
      },
      include: {
        requester: {
          select: {
            id: true,
            email: true,
            employee: { select: { fullNameAr: true, fullNameEn: true } },
          },
        },
      },
    })

    this.logger.log(`Revision #${dto.roundNumber} created for piece ${pieceId}`)
    return revision
  }

  async updateRevision(
    companyId: string,
    pieceId: string,
    revisionId: string,
    userId: string,
    dto: UpdateRevisionDto,
  ) {
    await this.findOne(companyId, pieceId)

    const existing = await this.prisma.tenant.contentRevision.findFirst({
      where: { id: revisionId, contentPieceId: pieceId, deletedAt: null },
    })
    if (!existing) throw new NotFoundException('Revision not found')

    const updated = await this.prisma.tenant.contentRevision.update({
      where: { id: revisionId },
      data: {
        updatedBy: userId,
        ...(dto.feedbackText !== undefined ? { feedbackText: dto.feedbackText } : {}),
        ...(dto.feedbackAnnotations !== undefined
          ? { feedbackAnnotations: dto.feedbackAnnotations as never }
          : {}),
        ...(dto.status !== undefined ? { status: dto.status as never } : {}),
        ...(dto.status === 'COMPLETED' ? { resolvedBy: userId, resolvedAt: new Date() } : {}),
      },
    })

    this.logger.log(`Revision ${revisionId} updated`)
    return updated
  }
}
