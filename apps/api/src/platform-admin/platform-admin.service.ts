import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

/**
 * Cross-tenant aggregations and administration for PLATFORM_ADMIN tier.
 *
 * Uses `prisma.system` exclusively — bypasses RLS by design. Every endpoint that
 * delegates here must be tier-guarded at the controller layer.
 */
@Injectable()
export class PlatformAdminService {
  private readonly logger = new Logger(PlatformAdminService.name)

  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const now = new Date()
    const monthAgo = new Date(now.getTime() - 30 * 86400000)

    const [totalTenants, byStatus, activeUsers, paidSubs] = await Promise.all([
      this.prisma.system.company.count({ where: { deletedAt: null } }),
      this.prisma.system.subscription.groupBy({
        by: ['status'],
        _count: { _all: true },
        where: { deletedAt: null },
      }),
      this.prisma.system.user.count({
        where: { isActive: true, lastLoginAt: { gte: monthAgo }, tier: 'TENANT' },
      }),
      this.prisma.system.subscription.findMany({
        where: { status: 'ACTIVE', deletedAt: null },
        include: { plan: { select: { priceMonthly: true, priceYearly: true } } },
      }),
    ])

    // MRR in USD cents — yearly subs contribute price_yearly/12.
    let mrrCents = 0
    for (const sub of paidSubs) {
      const monthly =
        sub.billingInterval === 'year'
          ? Number(sub.plan.priceYearly) / 12
          : Number(sub.plan.priceMonthly)
      mrrCents += Math.round(monthly)
    }

    // Churn = subs cancelled or terminal in last 30 days / paying base 30 days ago.
    const churnedRecently = await this.prisma.system.subscription.count({
      where: {
        status: { in: ['CANCELLED', 'SUSPENDED', 'EXPIRED', 'ANONYMIZED'] },
        cancelledAt: { gte: monthAgo },
      },
    })
    const churnRate =
      paidSubs.length === 0 ? 0 : churnedRecently / (paidSubs.length + churnedRecently)

    const statusBreakdown: Record<string, number> = {}
    for (const row of byStatus) statusBreakdown[row.status] = row._count._all

    return {
      totalTenants,
      activeUsersLast30d: activeUsers,
      paidSubscriptions: paidSubs.length,
      mrrCents,
      mrrUsd: Math.round(mrrCents / 100),
      churnRatePct: Math.round(churnRate * 10000) / 100,
      churnedLast30d: churnedRecently,
      statusBreakdown,
    }
  }

  async listTenants(options: {
    cursor?: string
    limit?: number
    status?: string
    search?: string
  }) {
    const take = Math.min(options.limit ?? 50, 200)
    const where: Record<string, unknown> = { deletedAt: null }
    if (options.search) {
      where['OR'] = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { nameEn: { contains: options.search, mode: 'insensitive' } },
        { slug: { contains: options.search, mode: 'insensitive' } },
      ]
    }

    const tenants = await this.prisma.system.company.findMany({
      where: where as never,
      include: {
        subscription: { include: { plan: { select: { key: true, nameEn: true } } } },
        _count: { select: { users: true, projects: true, clients: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: take + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
    })

    const filtered = options.status
      ? tenants.filter((t) => t.subscription?.status === options.status)
      : tenants
    const hasMore = filtered.length > take
    const items = hasMore ? filtered.slice(0, take) : filtered
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1]!.id : null
    return { items, nextCursor }
  }

  async getTenantDetail(companyId: string) {
    const company = await this.prisma.system.company.findUnique({
      where: { id: companyId },
      include: {
        subscription: { include: { plan: true } },
        _count: {
          select: {
            users: true,
            projects: true,
            clients: true,
            tasks: true,
            invoices: true,
            files: true,
          },
        },
      },
    })
    if (!company) throw new NotFoundException('Tenant not found')

    const recentPayments = await this.prisma.system.paymentIntent.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    return {
      company,
      recentPayments,
    }
  }

  async listPlatformAdmins() {
    return this.prisma.system.user.findMany({
      where: { tier: 'PLATFORM_ADMIN', deletedAt: null },
      select: {
        id: true,
        email: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
