import { Test } from '@nestjs/testing'
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common'
import { SubscriptionService } from './subscription.service'
import { PrismaService } from '../database/prisma.service'

const mockPlan = {
  id: 'plan-pro',
  key: 'professional',
  nameAr: 'احترافي',
  nameEn: 'Professional',
  description: null,
  maxUsers: 20,
  maxStorageMb: 102400,
  maxAiGenerationsPerMonth: 50,
  maxClients: 50,
  maxProjects: 100,
  features: { ai: true, equipment: false, exhibitions: false },
  priceMonthly: 99900n,
  priceYearly: 999000n,
  currency: 'USD',
  sortOrder: 1,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockStarterPlan = {
  ...mockPlan,
  id: 'plan-starter',
  key: 'starter',
  nameAr: 'ستارتر',
  nameEn: 'Starter',
  maxUsers: 5,
  maxAiGenerationsPerMonth: 0,
  features: { ai: false, equipment: false, exhibitions: false },
  sortOrder: 0,
}

const mockSubscription = {
  id: 'sub-1',
  companyId: 'company-1',
  planId: 'plan-pro',
  status: 'TRIAL' as const,
  trialEndsAt: new Date(Date.now() + 14 * 86400000),
  currentPeriodStart: new Date(),
  currentPeriodEnd: new Date(Date.now() + 14 * 86400000),
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  cancelledAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-1',
  updatedBy: 'user-1',
}

function mockPrisma() {
  const system = {
    subscriptionPlan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  }
  const tenant = {
    subscription: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  }
  return { system, tenant }
}

describe('SubscriptionService', () => {
  let service: SubscriptionService
  let prisma: ReturnType<typeof mockPrisma>

  beforeEach(async () => {
    prisma = mockPrisma()
    const module = await Test.createTestingModule({
      providers: [SubscriptionService, { provide: PrismaService, useValue: prisma }],
    }).compile()
    service = module.get<SubscriptionService>(SubscriptionService)
  })

  describe('findAllPlans', () => {
    it('should return all active plans sorted by sortOrder', async () => {
      prisma.system.subscriptionPlan.findMany.mockResolvedValue([mockStarterPlan, mockPlan])
      const result = await service.findAllPlans()
      expect(result).toHaveLength(2)
      expect(prisma.system.subscriptionPlan.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      })
    })
  })

  describe('findPlanById', () => {
    it('should return plan when found', async () => {
      prisma.system.subscriptionPlan.findUnique.mockResolvedValue(mockPlan)
      const result = await service.findPlanById('plan-pro')
      expect(result.id).toBe('plan-pro')
    })

    it('should throw NotFoundException when not found', async () => {
      prisma.system.subscriptionPlan.findUnique.mockResolvedValue(null)
      await expect(service.findPlanById('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('findPlanByKey', () => {
    it('should return plan by key', async () => {
      prisma.system.subscriptionPlan.findUnique.mockResolvedValue(mockPlan)
      const result = await service.findPlanByKey('professional')
      expect(result.key).toBe('professional')
    })

    it('should throw NotFoundException when key not found', async () => {
      prisma.system.subscriptionPlan.findUnique.mockResolvedValue(null)
      await expect(service.findPlanByKey('nonexistent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('getCurrentSubscription', () => {
    it('should return subscription with plan', async () => {
      prisma.tenant.subscription.findUnique.mockResolvedValue({
        ...mockSubscription,
        plan: mockPlan,
      })
      const result = await service.getCurrentSubscription('company-1')
      expect(result).toBeDefined()
      expect(result!.plan.id).toBe('plan-pro')
    })

    it('should return null when no subscription exists', async () => {
      prisma.tenant.subscription.findUnique.mockResolvedValue(null)
      const result = await service.getCurrentSubscription('company-1')
      expect(result).toBeNull()
    })
  })

  describe('getCurrentPlan', () => {
    it('should return plan from subscription', async () => {
      prisma.tenant.subscription.findUnique.mockResolvedValue({
        ...mockSubscription,
        plan: mockPlan,
      })
      const result = await service.getCurrentPlan('company-1')
      expect(result.id).toBe('plan-pro')
    })

    it('should return default professional plan when no subscription', async () => {
      prisma.tenant.subscription.findUnique.mockResolvedValue(null)
      prisma.system.subscriptionPlan.findUnique.mockResolvedValue(mockPlan)
      const result = await service.getCurrentPlan('company-1')
      expect(result.key).toBe('professional')
    })
  })

  describe('createTrialSubscription', () => {
    it('should create trial subscription', async () => {
      prisma.system.subscriptionPlan.findUnique.mockResolvedValue(mockPlan)
      prisma.tenant.subscription.findUnique.mockResolvedValue(null)
      prisma.tenant.subscription.create.mockResolvedValue({ ...mockSubscription, plan: mockPlan })

      const result = await service.createTrialSubscription('company-1', 'user-1')
      expect(result.plan.id).toBe('plan-pro')
      expect(result.plan.key).toBe('professional')
    })

    it('should throw BadRequestException when subscription exists', async () => {
      prisma.system.subscriptionPlan.findUnique.mockResolvedValue(mockPlan)
      prisma.tenant.subscription.findUnique.mockResolvedValue(mockSubscription)
      await expect(service.createTrialSubscription('company-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('changePlan', () => {
    it('should change subscription plan', async () => {
      prisma.system.subscriptionPlan.findUnique.mockResolvedValue(mockStarterPlan)
      prisma.tenant.subscription.findUnique.mockResolvedValue(mockSubscription)
      prisma.tenant.subscription.update.mockResolvedValue({
        ...mockSubscription,
        planId: 'plan-starter',
        plan: mockStarterPlan,
      })

      const result = await service.changePlan('company-1', 'plan-starter', 'user-1')
      expect(result.planId).toBe('plan-starter')
    })

    it('should throw NotFoundException when no subscription', async () => {
      prisma.system.subscriptionPlan.findUnique.mockResolvedValue(mockStarterPlan)
      prisma.tenant.subscription.findUnique.mockResolvedValue(null)
      await expect(service.changePlan('company-1', 'plan-starter', 'user-1')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('updateStatus', () => {
    it('should update subscription status', async () => {
      prisma.tenant.subscription.findUnique.mockResolvedValue(mockSubscription)
      prisma.tenant.subscription.update.mockResolvedValue({
        ...mockSubscription,
        status: 'ACTIVE',
        plan: mockPlan,
      })

      const result = await service.updateStatus('company-1', 'ACTIVE', 'user-1')
      expect(result.status).toBe('ACTIVE')
    })

    it('should set cancelledAt when cancelling', async () => {
      prisma.tenant.subscription.findUnique.mockResolvedValue(mockSubscription)
      prisma.tenant.subscription.update.mockResolvedValue({
        ...mockSubscription,
        status: 'CANCELLED',
        cancelledAt: new Date(),
        plan: mockPlan,
      })

      const result = await service.updateStatus('company-1', 'CANCELLED', 'user-1')
      expect(result.status).toBe('CANCELLED')
    })
  })

  describe('checkFeatureAccess', () => {
    it('should return true when feature is enabled in plan', async () => {
      prisma.tenant.subscription.findUnique.mockResolvedValue({
        ...mockSubscription,
        plan: mockPlan,
      })
      const result = await service.checkFeatureAccess('company-1', 'ai')
      expect(result).toBe(true)
    })

    it('should return false when feature is disabled', async () => {
      prisma.tenant.subscription.findUnique.mockResolvedValue({
        ...mockSubscription,
        plan: mockPlan,
      })
      const result = await service.checkFeatureAccess('company-1', 'equipment')
      expect(result).toBe(false)
    })
  })

  describe('requireFeatureAccess', () => {
    it('should pass when feature is accessible', async () => {
      prisma.tenant.subscription.findUnique.mockResolvedValue({
        ...mockSubscription,
        plan: mockPlan,
      })
      await expect(service.requireFeatureAccess('company-1', 'ai', 'AI')).resolves.toBeUndefined()
    })

    it('should throw ForbiddenException when feature is locked', async () => {
      prisma.tenant.subscription.findUnique.mockResolvedValue({
        ...mockSubscription,
        plan: mockPlan,
      })
      await expect(
        service.requireFeatureAccess('company-1', 'equipment', 'Equipment'),
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe('checkNumericLimit', () => {
    it('should allow when under limit', async () => {
      prisma.tenant.subscription.findUnique.mockResolvedValue({
        ...mockSubscription,
        plan: mockPlan,
      })
      const result = await service.checkNumericLimit('company-1', 5, 'maxUsers')
      expect(result.allowed).toBe(true)
      expect(result.limit).toBe(20)
      expect(result.current).toBe(5)
    })

    it('should block when at limit', async () => {
      prisma.tenant.subscription.findUnique.mockResolvedValue({
        ...mockSubscription,
        plan: mockPlan,
      })
      const result = await service.checkNumericLimit('company-1', 20, 'maxUsers')
      expect(result.allowed).toBe(false)
      expect(result.limit).toBe(20)
      expect(result.current).toBe(20)
    })
  })

  describe('requireNumericLimit', () => {
    it('should pass when under limit', async () => {
      prisma.tenant.subscription.findUnique.mockResolvedValue({
        ...mockSubscription,
        plan: mockPlan,
      })
      await expect(
        service.requireNumericLimit('company-1', 3, 'maxUsers', 'Employee'),
      ).resolves.toBeUndefined()
    })

    it('should throw ForbiddenException when at limit', async () => {
      prisma.tenant.subscription.findUnique.mockResolvedValue({
        ...mockSubscription,
        plan: mockPlan,
      })
      await expect(
        service.requireNumericLimit('company-1', 20, 'maxUsers', 'Employee'),
      ).rejects.toThrow(ForbiddenException)
    })
  })
})
