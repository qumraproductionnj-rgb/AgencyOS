import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name)

  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    companyId?: string
    userId?: string
    action: string
    entityType?: string
    entityId?: string
    changes?: Record<string, unknown>
    ipAddress?: string
    userAgent?: string
    metadata?: Record<string, unknown>
  }) {
    try {
      await this.prisma.system.auditLog.create({ data: params as never })
    } catch (err) {
      this.logger.error(`Failed to write audit log: ${(err as Error).message}`)
    }
  }

  async findAll(
    companyId: string,
    filters?: { entityType?: string; userId?: string; limit?: number; cursor?: string },
  ) {
    const where: Record<string, unknown> = { companyId }
    if (filters?.entityType) where['entityType'] = filters.entityType
    if (filters?.userId) where['userId'] = filters.userId

    const take = Math.min(filters?.limit ?? 50, 200)
    const query: Record<string, unknown> = {
      where,
      orderBy: { createdAt: 'desc' as const },
      take: take + 1,
      include: { user: { select: { id: true, email: true } } },
    }
    if (filters?.cursor) query['cursor'] = { id: filters.cursor }
    if (filters?.cursor) query['skip'] = 1

    const items = await this.prisma.system.auditLog.findMany(query as never)
    const hasMore = items.length > take
    if (hasMore) items.pop()

    return { items, nextCursor: hasMore ? items[items.length - 1]?.id : null }
  }
}
