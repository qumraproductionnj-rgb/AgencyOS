import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { NotificationService } from '../notifications/notification.service'

const LEAD_TIME_DAYS: Record<string, number> = {
  VIDEO_LONG: 14,
  REEL: 5,
  STORY: 1,
  STATIC_DESIGN: 3,
  CAROUSEL: 4,
  GIF: 1,
  PODCAST: 7,
  BLOG_POST: 3,
}

const PIECE_TYPE_TO_ASSET_TYPE: Record<string, string> = {
  VIDEO_LONG: 'VIDEO',
  REEL: 'VIDEO',
  STORY: 'IMAGE',
  STATIC_DESIGN: 'IMAGE',
  CAROUSEL: 'IMAGE',
  GIF: 'IMAGE',
  PODCAST: 'DOCUMENT',
  BLOG_POST: 'DOCUMENT',
}

const PIECE_TASK_TEMPLATES: Record<
  string,
  { titleSuffix: string; roleHint: string; priority: string; leadTimeShare: number }[]
> = {
  REEL: [
    { titleSuffix: 'Script Writing', roleHint: 'writer', priority: 'HIGH', leadTimeShare: 0.4 },
    { titleSuffix: 'Shooting', roleHint: 'video_editor', priority: 'HIGH', leadTimeShare: 0.25 },
    {
      titleSuffix: 'Editing & Post-production',
      roleHint: 'video_editor',
      priority: 'HIGH',
      leadTimeShare: 0.2,
    },
    {
      titleSuffix: 'Caption & Hashtags',
      roleHint: 'writer',
      priority: 'MEDIUM',
      leadTimeShare: 0.15,
    },
  ],
  STATIC_DESIGN: [
    {
      titleSuffix: 'Text & Copywriting',
      roleHint: 'writer',
      priority: 'MEDIUM',
      leadTimeShare: 0.5,
    },
    {
      titleSuffix: 'Design Execution',
      roleHint: 'designer',
      priority: 'MEDIUM',
      leadTimeShare: 0.5,
    },
  ],
  STORY: [
    { titleSuffix: 'Full Execution', roleHint: 'designer', priority: 'MEDIUM', leadTimeShare: 1.0 },
  ],
  CAROUSEL: [
    { titleSuffix: 'Content & Copy', roleHint: 'writer', priority: 'MEDIUM', leadTimeShare: 0.4 },
    { titleSuffix: 'Design', roleHint: 'designer', priority: 'MEDIUM', leadTimeShare: 0.35 },
    {
      titleSuffix: 'Review & Polish',
      roleHint: 'creative_director',
      priority: 'MEDIUM',
      leadTimeShare: 0.25,
    },
  ],
  VIDEO_LONG: [
    { titleSuffix: 'Script & Concept', roleHint: 'writer', priority: 'HIGH', leadTimeShare: 0.3 },
    {
      titleSuffix: 'Pre-production Planning',
      roleHint: 'project_manager',
      priority: 'HIGH',
      leadTimeShare: 0.2,
    },
    { titleSuffix: 'Shooting', roleHint: 'video_editor', priority: 'URGENT', leadTimeShare: 0.25 },
    {
      titleSuffix: 'Post-production & Editing',
      roleHint: 'video_editor',
      priority: 'HIGH',
      leadTimeShare: 0.15,
    },
    {
      titleSuffix: 'Review & Final Touches',
      roleHint: 'creative_director',
      priority: 'MEDIUM',
      leadTimeShare: 0.1,
    },
  ],
  GIF: [
    {
      titleSuffix: 'Design & Animation',
      roleHint: 'designer',
      priority: 'LOW',
      leadTimeShare: 1.0,
    },
  ],
  PODCAST: [
    { titleSuffix: 'Script & Outline', roleHint: 'writer', priority: 'MEDIUM', leadTimeShare: 0.3 },
    { titleSuffix: 'Recording', roleHint: 'video_editor', priority: 'MEDIUM', leadTimeShare: 0.4 },
    {
      titleSuffix: 'Editing & Post-production',
      roleHint: 'video_editor',
      priority: 'MEDIUM',
      leadTimeShare: 0.3,
    },
  ],
  BLOG_POST: [
    {
      titleSuffix: 'Writing & Research',
      roleHint: 'writer',
      priority: 'MEDIUM',
      leadTimeShare: 0.6,
    },
    {
      titleSuffix: 'Editing & SEO',
      roleHint: 'creative_director',
      priority: 'MEDIUM',
      leadTimeShare: 0.4,
    },
  ],
}

const EQUIPMENT_SUGGESTIONS: Record<string, { name: string; reason: string }[]> = {
  VIDEO_LONG: [
    { name: 'Sony FX6 / FX9 Camera Kit', reason: 'Primary cinema camera for long-form video' },
    { name: 'Sennheiser MKH416 Shotgun Mic', reason: 'Professional audio capture' },
    { name: 'Aputure 600d Pro Light Kit', reason: 'Key lighting for interview/talking head' },
    { name: 'DJI RS 3 Pro Gimbal', reason: 'Stabilized movement shots' },
    { name: 'Tripod + Fluid Head', reason: 'Stable locked-off shots' },
  ],
  REEL: [
    { name: 'Sony A7S III / FX3', reason: 'Compact high-quality camera for social content' },
    { name: 'DJI Mic 2 Wireless', reason: 'Quick wireless audio for reels' },
    { name: 'SmallRGB Pocket Light', reason: 'Portable fill light for quick setups' },
    { name: 'GorillaPod Flex Tripod', reason: 'Versatile tabletop/outdoor mounting' },
  ],
}

@Injectable()
export class IntegrationService {
  private readonly logger = new Logger(IntegrationService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationService,
  ) {}

  async onPlanActivated(companyId: string, planId: string, userId: string) {
    this.logger.log(`Integration: Plan ${planId} activated — creating tasks per piece`)

    const plan = await this.prisma.tenant.contentPlan.findFirst({
      where: { id: planId, companyId, deletedAt: null },
      include: {
        pieces: { where: { deletedAt: null } },
        client: { select: { id: true, name: true } },
      },
    })
    if (!plan) return

    let totalCreated = 0
    for (const piece of plan.pieces) {
      const templates = PIECE_TASK_TEMPLATES[piece.type]
      if (!templates || templates.length === 0) continue

      const totalLeadDays = LEAD_TIME_DAYS[piece.type] ?? 7

      for (const tmpl of templates) {
        const leadOffset = Math.round(totalLeadDays * tmpl.leadTimeShare)
        const dueDate = piece.scheduledAt
          ? new Date(piece.scheduledAt.getTime() - leadOffset * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + leadOffset * 24 * 60 * 60 * 1000)

        try {
          await this.prisma.tenant.task.create({
            data: {
              companyId,
              title: `[${piece.type}] ${piece.title} - ${tmpl.titleSuffix}`,
              description:
                `Auto-created from content plan "${plan.title ?? ''}" (${plan.month}/${plan.year})\n` +
                `Content Piece: ${piece.id}\n` +
                `Client: ${plan.client.name ?? ''}\n` +
                `Type: ${piece.type}\n` +
                `Task: ${tmpl.titleSuffix}\n` +
                `Suggested Role: ${tmpl.roleHint}\n` +
                `Scheduled: ${piece.scheduledAt ? piece.scheduledAt.toISOString().split('T')[0] : 'Not set'}`,
              status: 'TODO' as never,
              priority: tmpl.priority as never,
              dueDate,
              createdBy: userId,
            },
          })
          totalCreated++
        } catch (err) {
          this.logger.error(
            `Failed to create task for piece ${piece.id} (${tmpl.titleSuffix}): ${(err as Error).message}`,
          )
        }
      }
    }

    this.logger.log(`Integration: ${totalCreated} tasks created for plan ${planId}`)

    if (totalCreated > 0) {
      await this.sendNotification(
        companyId,
        userId,
        'TASK_ASSIGNED',
        `Content Plan activated: ${totalCreated} tasks created`,
        `Tasks were auto-created from content plan "${plan.title ?? ''}" for client ${plan.client.name ?? ''}. Please review and assign team members.`,
        { planId, taskCount: totalCreated, type: 'plan_tasks_created' },
      )
    }
  }

  async onPieceApproved(companyId: string, pieceId: string, userId: string) {
    this.logger.log(`Integration: Piece ${pieceId} approved — creating asset reference`)

    const piece = await this.prisma.tenant.contentPiece.findFirst({
      where: { id: pieceId, companyId, deletedAt: null },
      include: {
        client: { select: { id: true, name: true } },
        plan: { select: { title: true } },
      },
    })
    if (!piece) return

    const assetType = (PIECE_TYPE_TO_ASSET_TYPE[piece.type] ?? 'DOCUMENT') as never

    try {
      await this.prisma.tenant.asset.create({
        data: {
          companyId,
          folderId: null,
          name: `${piece.title} (${piece.type})`,
          type: assetType,
          description: `Approved content piece. Big idea: ${piece.bigIdea ?? 'N/A'}. Plan: ${piece.plan?.title ?? 'N/A'}.`,
          tags: [piece.type, 'approved', 'auto-created'],
          linkedClientIds: [piece.clientId],
          linkedProjectIds: piece.projectId ? [piece.projectId] : [],
          createdBy: userId,
        },
      })

      this.logger.log(`Integration: Asset created for approved piece ${pieceId}`)
    } catch (err) {
      this.logger.error(`Failed to create asset for piece ${pieceId}: ${(err as Error).message}`)
    }
  }

  async onPieceScheduled(companyId: string, pieceId: string, _userId: string) {
    this.logger.log(`Integration: Piece ${pieceId} scheduled`)

    const piece = await this.prisma.tenant.contentPiece.findFirst({
      where: { id: pieceId, companyId, deletedAt: null },
      include: {
        client: { select: { name: true } },
        plan: { select: { title: true } },
      },
    })
    if (!piece) return

    const scheduleDate = piece.scheduledAt ? piece.scheduledAt.toISOString().split('T')[0] : 'TBD'

    const accountManagers = await this.prisma.tenant.userRole.findMany({
      where: {
        companyId,
        role: { name: 'account_manager' },
        user: { employee: { deletedAt: null } },
      },
      select: { userId: true },
    })

    const notified = new Set<string>()
    for (const am of accountManagers) {
      if (notified.has(am.userId)) continue
      notified.add(am.userId)

      await this.sendNotification(
        companyId,
        am.userId,
        'GENERAL',
        `Content scheduled: ${piece.title}`,
        `"${piece.title}" is scheduled for ${scheduleDate}. Platform: ${(piece.platforms as string[] | null)?.join(', ') ?? 'Not set'}`,
        { pieceId, scheduleDate, type: 'content_scheduled' },
      )
    }
  }

  async getCalendar(companyId: string, month?: number, year?: number) {
    const now = new Date()
    const targetMonth = month ?? now.getMonth() + 1
    const targetYear = year ?? now.getFullYear()

    const pieces = await this.prisma.tenant.contentPiece.findMany({
      where: {
        companyId,
        deletedAt: null,
        scheduledAt: {
          gte: new Date(targetYear, targetMonth - 1, 1),
          lt: new Date(targetYear, targetMonth, 1),
        },
      },
      include: {
        client: { select: { id: true, name: true, nameEn: true } },
        pillar: { select: { id: true, nameAr: true, color: true } },
        plan: { select: { id: true, title: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    })

    const grouped: Record<number, typeof pieces> = {}
    for (const piece of pieces) {
      const day = piece.scheduledAt ? piece.scheduledAt.getDate() : 0
      if (!grouped[day]) grouped[day] = []
      grouped[day]!.push(piece)
    }

    return {
      month: targetMonth,
      year: targetYear,
      totalPieces: pieces.length,
      days: grouped,
      pieces,
    }
  }

  async getEquipmentSuggestions(contentType: string) {
    const suggestions = EQUIPMENT_SUGGESTIONS[contentType] ?? []
    if (suggestions.length === 0) {
      return { suggested: false, message: `No equipment suggestions for ${contentType}`, items: [] }
    }
    return { suggested: true, contentType, items: suggestions }
  }

  async getPieceEquipmentSuggestions(companyId: string, pieceId: string) {
    const piece = await this.prisma.tenant.contentPiece.findFirst({
      where: { id: pieceId, companyId, deletedAt: null },
      select: { id: true, type: true, title: true },
    })
    if (!piece) {
      return { found: false, items: [], message: 'Content piece not found' }
    }

    const suggestions = EQUIPMENT_SUGGESTIONS[piece.type] ?? []
    if (suggestions.length === 0) {
      return {
        found: true,
        pieceId,
        title: piece.title,
        type: piece.type,
        suggested: false,
        items: [],
      }
    }

    return {
      found: true,
      pieceId,
      title: piece.title,
      type: piece.type,
      suggested: true,
      items: suggestions,
    }
  }

  private async sendNotification(
    companyId: string,
    userId: string,
    type: string,
    title: string,
    body?: string,
    data?: Record<string, unknown>,
  ) {
    try {
      await this.notificationService.create(companyId, {
        userId,
        type,
        title,
        ...(body !== undefined ? { body } : {}),
        ...(data !== undefined ? { data } : {}),
      })
    } catch (err) {
      this.logger.error(`Failed to send notification to user ${userId}: ${(err as Error).message}`)
    }
  }
}
