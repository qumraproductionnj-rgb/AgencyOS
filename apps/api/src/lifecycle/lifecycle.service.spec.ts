import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { LifecycleService } from './lifecycle.service'
import { PrismaService } from '../database/prisma.service'
import { EmailService } from '../auth/services/email.service'
import { NotificationService } from '../notifications/notification.service'

function mockPrisma() {
  return {
    system: {
      subscription: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
      company: { update: jest.fn().mockResolvedValue({}) },
      user: { findMany: jest.fn().mockResolvedValue([]), update: jest.fn().mockResolvedValue({}) },
      notification: { create: jest.fn().mockResolvedValue({}) },
    },
  }
}

const mockConfig = {
  get: jest.fn((key: string) => {
    const map: Record<string, unknown> = {
      LIFECYCLE_GRACE_PAST_DUE_DAYS: 7,
      LIFECYCLE_GRACE_READ_ONLY_DAYS: 14,
      LIFECYCLE_GRACE_SUSPENDED_DAYS: 90,
      LIFECYCLE_CRON_ENABLED: true,
    }
    return map[key]
  }),
}

const mockEmail = { send: jest.fn().mockResolvedValue(undefined) }
const mockNotifications = { create: jest.fn() }

describe('LifecycleService', () => {
  let service: LifecycleService
  let prisma: ReturnType<typeof mockPrisma>

  beforeEach(async () => {
    prisma = mockPrisma()
    const module = await Test.createTestingModule({
      providers: [
        LifecycleService,
        { provide: PrismaService, useValue: prisma },
        { provide: EmailService, useValue: mockEmail },
        { provide: NotificationService, useValue: mockNotifications },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile()
    service = module.get(LifecycleService)
    jest.clearAllMocks()
  })

  describe('sendTrialWarnings', () => {
    it('sends 3-day warning for trial ending in 3 days', async () => {
      prisma.system.subscription.findMany.mockResolvedValue([
        {
          id: 's1',
          companyId: 'c1',
          trialEndsAt: new Date(Date.now() + 2.5 * 86400000),
          lastWarningStage: null,
          company: { id: 'c1', name: "Ru'ya", nameEn: 'Ruya' },
        },
      ])
      prisma.system.user.findMany.mockResolvedValue([{ id: 'u1', email: 'owner@x.com' }])
      const sent = await service.sendTrialWarnings()
      expect(sent).toBe(1)
      expect(prisma.system.subscription.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { lastWarningStage: 3 },
      })
      expect(mockEmail.send).toHaveBeenCalled()
    })

    it('does not re-send the same warning stage', async () => {
      prisma.system.subscription.findMany.mockResolvedValue([
        {
          id: 's1',
          companyId: 'c1',
          trialEndsAt: new Date(Date.now() + 2.5 * 86400000),
          lastWarningStage: 3,
          company: { id: 'c1', name: 'X', nameEn: 'X' },
        },
      ])
      expect(await service.sendTrialWarnings()).toBe(0)
      expect(prisma.system.subscription.update).not.toHaveBeenCalled()
    })

    it('escalates from 3-day to 1-day warning', async () => {
      prisma.system.subscription.findMany.mockResolvedValue([
        {
          id: 's1',
          companyId: 'c1',
          trialEndsAt: new Date(Date.now() + 0.5 * 86400000),
          lastWarningStage: 3,
          company: { id: 'c1', name: 'X', nameEn: 'X' },
        },
      ])
      prisma.system.user.findMany.mockResolvedValue([{ id: 'u1', email: 'o@x.com' }])
      expect(await service.sendTrialWarnings()).toBe(1)
      expect(prisma.system.subscription.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { lastWarningStage: 1 },
      })
    })

    it('sends expired warning (stage 0) for trials past end date', async () => {
      prisma.system.subscription.findMany.mockResolvedValue([
        {
          id: 's1',
          companyId: 'c1',
          trialEndsAt: new Date(Date.now() - 86400000),
          lastWarningStage: 1,
          company: { id: 'c1', name: 'X', nameEn: 'X' },
        },
      ])
      prisma.system.user.findMany.mockResolvedValue([{ id: 'u1', email: 'o@x.com' }])
      expect(await service.sendTrialWarnings()).toBe(1)
      expect(prisma.system.subscription.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { lastWarningStage: 0 },
      })
    })
  })

  describe('transitionExpiredToPastDue', () => {
    it('moves TRIAL/ACTIVE with expired period to PAST_DUE', async () => {
      prisma.system.subscription.findMany.mockResolvedValue([
        { id: 's1', companyId: 'c1', company: {} },
        { id: 's2', companyId: 'c2', company: {} },
      ])
      prisma.system.user.findMany.mockResolvedValue([])
      expect(await service.transitionExpiredToPastDue()).toBe(2)
      expect(prisma.system.subscription.update).toHaveBeenCalledTimes(2)
      expect(prisma.system.subscription.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { status: 'PAST_DUE' },
      })
    })
  })

  describe('transitionPastDueToReadOnly', () => {
    it('moves PAST_DUE older than grace period to READ_ONLY with timestamp', async () => {
      prisma.system.subscription.findMany.mockResolvedValue([{ id: 's1', companyId: 'c1' }])
      prisma.system.user.findMany.mockResolvedValue([])
      expect(await service.transitionPastDueToReadOnly()).toBe(1)
      expect(prisma.system.subscription.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { status: 'READ_ONLY', readOnlyAt: expect.any(Date) },
      })
    })
  })

  describe('transitionReadOnlyToSuspended', () => {
    it('moves READ_ONLY older than grace to SUSPENDED', async () => {
      prisma.system.subscription.findMany.mockResolvedValue([{ id: 's1', companyId: 'c1' }])
      prisma.system.user.findMany.mockResolvedValue([])
      expect(await service.transitionReadOnlyToSuspended()).toBe(1)
      expect(prisma.system.subscription.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { status: 'SUSPENDED', suspendedAt: expect.any(Date) },
      })
    })
  })

  describe('transitionSuspendedToAnonymized', () => {
    it('anonymizes SUSPENDED older than grace + sets status ANONYMIZED', async () => {
      prisma.system.subscription.findMany.mockResolvedValue([{ id: 's1', companyId: 'c1' }])
      prisma.system.user.findMany.mockResolvedValue([{ id: 'u1' }])
      expect(await service.transitionSuspendedToAnonymized()).toBe(1)
      expect(prisma.system.company.update).toHaveBeenCalledWith({
        where: { id: 'c1' },
        data: expect.objectContaining({
          name: expect.stringContaining('anonymized'),
          phone: null,
          website: null,
        }),
      })
      expect(prisma.system.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: expect.objectContaining({
          passwordHash: 'ANONYMIZED',
          isActive: false,
        }),
      })
      expect(prisma.system.subscription.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { status: 'ANONYMIZED', anonymizedAt: expect.any(Date) },
      })
    })
  })

  describe('manual admin overrides', () => {
    it('extendTrial pushes trialEndsAt forward and resets warning stage', async () => {
      const base = new Date('2026-05-13T00:00:00Z')
      prisma.system.subscription.findUnique.mockResolvedValue({
        id: 's1',
        trialEndsAt: base,
      })
      prisma.system.subscription.update.mockResolvedValue({ id: 's1' })
      await service.extendTrial({ companyId: 'c1', days: 7, adminUserId: 'admin' })
      expect(prisma.system.subscription.update).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: expect.objectContaining({
          status: 'TRIAL',
          lastWarningStage: null,
          updatedBy: 'admin',
        }),
      })
    })

    it('extendTrial rejects bad day counts', async () => {
      await expect(
        service.extendTrial({ companyId: 'c1', days: 0, adminUserId: 'a' }),
      ).rejects.toThrow()
      await expect(
        service.extendTrial({ companyId: 'c1', days: 200, adminUserId: 'a' }),
      ).rejects.toThrow()
    })

    it('suspend sets SUSPENDED + timestamp', async () => {
      prisma.system.subscription.update.mockResolvedValue({ id: 's1' })
      await service.suspend('c1', 'admin')
      expect(prisma.system.subscription.update).toHaveBeenCalledWith({
        where: { companyId: 'c1' },
        data: expect.objectContaining({
          status: 'SUSPENDED',
          suspendedAt: expect.any(Date),
        }),
      })
    })

    it('reactivate restores ACTIVE and clears lifecycle timestamps', async () => {
      prisma.system.subscription.update.mockResolvedValue({ id: 's1' })
      await service.reactivate('c1', 'admin')
      expect(prisma.system.subscription.update).toHaveBeenCalledWith({
        where: { companyId: 'c1' },
        data: expect.objectContaining({
          status: 'ACTIVE',
          readOnlyAt: null,
          suspendedAt: null,
          lastWarningStage: null,
        }),
      })
    })
  })

  describe('runDailySweep', () => {
    it('skips when cron is disabled', async () => {
      mockConfig.get.mockImplementation((key: string) =>
        key === 'LIFECYCLE_CRON_ENABLED' ? false : undefined,
      )
      const module = await Test.createTestingModule({
        providers: [
          LifecycleService,
          { provide: PrismaService, useValue: prisma },
          { provide: EmailService, useValue: mockEmail },
          { provide: NotificationService, useValue: mockNotifications },
          { provide: ConfigService, useValue: mockConfig },
        ],
      }).compile()
      const svc = module.get(LifecycleService)
      await svc.runDailySweep()
      expect(prisma.system.subscription.findMany).not.toHaveBeenCalled()
    })
  })
})
