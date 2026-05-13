import { Test } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { PlatformAdminService } from './platform-admin.service'
import { PrismaService } from '../database/prisma.service'

function mockPrisma() {
  return {
    system: {
      company: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
      subscription: { groupBy: jest.fn(), findMany: jest.fn(), count: jest.fn() },
      user: { count: jest.fn(), findMany: jest.fn() },
      paymentIntent: { findMany: jest.fn().mockResolvedValue([]) },
    },
  }
}

describe('PlatformAdminService', () => {
  let service: PlatformAdminService
  let prisma: ReturnType<typeof mockPrisma>

  beforeEach(async () => {
    prisma = mockPrisma()
    const module = await Test.createTestingModule({
      providers: [PlatformAdminService, { provide: PrismaService, useValue: prisma }],
    }).compile()
    service = module.get(PlatformAdminService)
  })

  describe('getStats', () => {
    it('aggregates totals, status breakdown, MRR (yearly /12), and churn rate', async () => {
      prisma.system.company.count.mockResolvedValue(10)
      prisma.system.subscription.groupBy.mockResolvedValue([
        { status: 'ACTIVE', _count: { _all: 5 } },
        { status: 'TRIAL', _count: { _all: 3 } },
      ])
      prisma.system.user.count.mockResolvedValue(42)
      prisma.system.subscription.findMany.mockResolvedValue([
        { billingInterval: 'month', plan: { priceMonthly: 4900n, priceYearly: 49000n } },
        { billingInterval: 'year', plan: { priceMonthly: 14900n, priceYearly: 149000n } },
      ])
      prisma.system.subscription.count.mockResolvedValue(1)

      const stats = await service.getStats()
      expect(stats.totalTenants).toBe(10)
      expect(stats.activeUsersLast30d).toBe(42)
      expect(stats.paidSubscriptions).toBe(2)
      // 4900 (monthly) + 149000/12 = 4900 + 12417 = 17317
      expect(stats.mrrCents).toBe(4900 + Math.round(149000 / 12))
      expect(stats.statusBreakdown).toEqual({ ACTIVE: 5, TRIAL: 3 })
      // churn 1 / (2 + 1) = 33.33%
      expect(stats.churnRatePct).toBe(33.33)
    })

    it('returns 0 churn when no paying subs exist', async () => {
      prisma.system.company.count.mockResolvedValue(0)
      prisma.system.subscription.groupBy.mockResolvedValue([])
      prisma.system.user.count.mockResolvedValue(0)
      prisma.system.subscription.findMany.mockResolvedValue([])
      prisma.system.subscription.count.mockResolvedValue(0)
      const stats = await service.getStats()
      expect(stats.churnRatePct).toBe(0)
      expect(stats.mrrCents).toBe(0)
    })
  })

  describe('listTenants', () => {
    it('returns items + cursor with default limit and search filter', async () => {
      const make = (id: string) => ({
        id,
        name: 'X',
        subscription: { status: 'ACTIVE', plan: { key: 'professional', nameEn: 'Pro' } },
        _count: { users: 5, projects: 2, clients: 1 },
      })
      prisma.system.company.findMany.mockResolvedValue([make('c1'), make('c2')])
      const res = await service.listTenants({ search: 'ru', limit: 50 })
      expect(res.items).toHaveLength(2)
      expect(res.nextCursor).toBeNull()
    })

    it('filters by status when provided', async () => {
      const make = (id: string, status: string) => ({
        id,
        subscription: { status, plan: { key: 'p', nameEn: 'P' } },
        _count: { users: 0, projects: 0, clients: 0 },
      })
      prisma.system.company.findMany.mockResolvedValue([make('c1', 'ACTIVE'), make('c2', 'TRIAL')])
      const res = await service.listTenants({ status: 'TRIAL' })
      expect(res.items).toHaveLength(1)
      expect(res.items[0]!.subscription!.status).toBe('TRIAL')
    })
  })

  describe('getTenantDetail', () => {
    it('returns company + counts + recent payments', async () => {
      prisma.system.company.findUnique.mockResolvedValue({
        id: 'c1',
        name: 'X',
        subscription: { status: 'ACTIVE', plan: { key: 'p' } },
        _count: { users: 5, projects: 2, clients: 1, tasks: 7, invoices: 3, files: 12 },
      })
      const res = await service.getTenantDetail('c1')
      expect(res.company.id).toBe('c1')
      expect(res.recentPayments).toEqual([])
    })

    it('throws NotFound for missing company', async () => {
      prisma.system.company.findUnique.mockResolvedValue(null)
      await expect(service.getTenantDetail('missing')).rejects.toThrow(NotFoundException)
    })
  })

  describe('listPlatformAdmins', () => {
    it('returns active and inactive PLATFORM_ADMIN users', async () => {
      prisma.system.user.findMany.mockResolvedValue([
        {
          id: 'u1',
          email: 'a@x.com',
          isActive: true,
          lastLoginAt: new Date(),
          createdAt: new Date(),
        },
      ])
      const res = await service.listPlatformAdmins()
      expect(res).toHaveLength(1)
    })
  })
})
