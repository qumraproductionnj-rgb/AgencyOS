import { Injectable, Logger } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../database/prisma.service'
import { NotificationGateway } from './notification.gateway'

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationGateway,
  ) {}

  async findAll(
    companyId: string,
    userId: string,
    options?: { unreadOnly?: boolean; limit?: number; cursor?: string },
  ) {
    const take = Math.min(options?.limit ?? 50, 100)
    const where: Record<string, unknown> = { companyId, userId }
    if (options?.unreadOnly) where['isRead'] = false
    if (options?.cursor) where['id'] = { lt: options.cursor }

    const notifications = await this.prisma.tenant.notification.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
      take: take + 1,
    })

    const hasMore = notifications.length > take
    const items = hasMore ? notifications.slice(0, take) : notifications
    const nextCursor = hasMore ? items[items.length - 1]!.id : null

    return { items, nextCursor }
  }

  async getUnreadCount(companyId: string, userId: string) {
    return this.prisma.tenant.notification.count({
      where: { companyId, userId, isRead: false },
    })
  }

  async create(
    companyId: string,
    dto: {
      userId: string
      type: string
      title: string
      body?: string
      data?: Record<string, unknown>
    },
  ) {
    const notification = await this.prisma.tenant.notification.create({
      data: {
        companyId,
        userId: dto.userId,
        type: dto.type as never,
        title: dto.title,
        body: dto.body ?? null,
        data: (dto.data ?? Prisma.DbNull) as never,
      },
    })

    this.gateway.sendToUser(dto.userId, 'notification', notification)
    this.logger.log(`Notification created: ${notification.id} (${dto.type}) for user ${dto.userId}`)
    return notification
  }

  async markRead(companyId: string, userId: string, ids: string[]) {
    await this.prisma.tenant.notification.updateMany({
      where: { id: { in: ids }, companyId, userId },
      data: { isRead: true, readAt: new Date() },
    })
    this.logger.log(`Marked ${ids.length} notifications as read for user ${userId}`)
  }

  async markAllRead(companyId: string, userId: string) {
    const result = await this.prisma.tenant.notification.updateMany({
      where: { companyId, userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })
    this.logger.log(`Marked all (${result.count}) notifications as read for user ${userId}`)
  }

  async remove(companyId: string, userId: string, id: string) {
    return this.prisma.tenant.notification.delete({
      where: { id },
    })
  }
}
