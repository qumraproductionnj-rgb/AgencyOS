import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import type Stripe from 'stripe'
import { BillingService } from './billing.service'
import { StripeService } from './stripe.service'
import { SubscriptionService } from '../subscriptions/subscription.service'
import { PrismaService } from '../database/prisma.service'

const mockPlanPro = {
  id: 'plan-pro',
  key: 'professional',
  stripeProductId: 'prod_pro',
  stripePriceIdMonthly: 'price_pro_monthly',
  stripePriceIdYearly: 'price_pro_yearly',
}

const mockPlanStarter = {
  ...mockPlanPro,
  id: 'plan-starter',
  key: 'starter',
  stripeProductId: 'prod_starter',
  stripePriceIdMonthly: 'price_starter_monthly',
  stripePriceIdYearly: 'price_starter_yearly',
}

function mockStripeService(mockMode = true) {
  return {
    mockMode,
    ensureCustomer: jest.fn().mockResolvedValue('cus_mock_abc'),
    createCheckoutSession: jest.fn().mockResolvedValue({
      id: 'cs_mock_1',
      url: 'http://localhost:3000/return?session_id=cs_mock_1',
    }),
    createBillingPortalSession: jest.fn().mockResolvedValue({
      url: 'http://localhost:3000/settings/billing?portal=mock',
    }),
    updateSubscriptionPrice: jest.fn().mockResolvedValue({ id: 'sub_mock', mock: true }),
    cancelSubscription: jest.fn().mockResolvedValue({ id: 'sub_mock', mock: true }),
    listInvoices: jest.fn().mockResolvedValue([]),
    constructEvent: jest.fn(),
  }
}

function mockSubscriptionService() {
  return {
    findPlanByKey: jest.fn(),
    getCurrentSubscription: jest.fn(),
    getCurrentPlan: jest.fn(),
  }
}

function mockPrisma() {
  return {
    system: {
      company: { findUnique: jest.fn() },
      user: { findUnique: jest.fn(), count: jest.fn() },
      client: { count: jest.fn() },
      project: { count: jest.fn() },
      aiGeneration: { count: jest.fn() },
      file: { aggregate: jest.fn() },
      paymentIntent: { findMany: jest.fn() },
      subscription: {
        update: jest.fn(),
        updateMany: jest.fn(),
        upsert: jest.fn(),
      },
      webhookEvent: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    },
  }
}

function mockConfig() {
  const map: Record<string, string> = {
    STRIPE_CHECKOUT_SUCCESS_URL:
      'http://localhost:3000/return?status=success&session_id={CHECKOUT_SESSION_ID}',
    STRIPE_CHECKOUT_CANCEL_URL: 'http://localhost:3000/return?status=cancelled',
    STRIPE_BILLING_PORTAL_RETURN_URL: 'http://localhost:3000/settings/billing',
  }
  return { get: jest.fn((k: string) => map[k]) }
}

describe('BillingService', () => {
  let service: BillingService
  let stripe: ReturnType<typeof mockStripeService>
  let subs: ReturnType<typeof mockSubscriptionService>
  let prisma: ReturnType<typeof mockPrisma>

  beforeEach(async () => {
    stripe = mockStripeService()
    subs = mockSubscriptionService()
    prisma = mockPrisma()
    const module = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: StripeService, useValue: stripe },
        { provide: SubscriptionService, useValue: subs },
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: mockConfig() },
      ],
    }).compile()
    service = module.get(BillingService)
  })

  describe('startCheckout', () => {
    it('creates a checkout session for a valid plan + monthly interval', async () => {
      subs.findPlanByKey.mockResolvedValue(mockPlanPro)
      prisma.system.company.findUnique.mockResolvedValue({ name: "Ru'ya", nameEn: 'Ruya' })
      prisma.system.user.findUnique.mockResolvedValue({ email: 'owner@ruya.iq' })
      subs.getCurrentSubscription.mockResolvedValue(null)

      const res = await service.startCheckout({
        companyId: 'c1',
        userId: 'u1',
        planKey: 'professional',
        interval: 'month',
      })

      expect(res.checkoutUrl).toContain('session_id=cs_mock_1')
      expect(stripe.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          priceId: 'price_pro_monthly',
          planKey: 'professional',
        }),
      )
    })

    it('uses yearly price when interval=year', async () => {
      subs.findPlanByKey.mockResolvedValue(mockPlanPro)
      prisma.system.company.findUnique.mockResolvedValue({ name: 'X', nameEn: null })
      prisma.system.user.findUnique.mockResolvedValue({ email: 'a@b.com' })
      subs.getCurrentSubscription.mockResolvedValue(null)

      await service.startCheckout({
        companyId: 'c1',
        userId: 'u1',
        planKey: 'professional',
        interval: 'year',
      })

      expect(stripe.createCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({ priceId: 'price_pro_yearly' }),
      )
    })

    it('throws when plan has no Stripe price for the interval', async () => {
      subs.findPlanByKey.mockResolvedValue({
        ...mockPlanPro,
        stripePriceIdMonthly: null,
        stripePriceIdYearly: null,
      })
      prisma.system.company.findUnique.mockResolvedValue({ name: 'X', nameEn: 'X' })
      prisma.system.user.findUnique.mockResolvedValue({ email: 'a@b.com' })
      await expect(
        service.startCheckout({
          companyId: 'c1',
          userId: 'u1',
          planKey: 'professional',
          interval: 'month',
        }),
      ).rejects.toThrow(BadRequestException)
    })

    it('throws NotFound when company is missing', async () => {
      subs.findPlanByKey.mockResolvedValue(mockPlanPro)
      prisma.system.company.findUnique.mockResolvedValue(null)
      await expect(
        service.startCheckout({
          companyId: 'c1',
          userId: 'u1',
          planKey: 'professional',
          interval: 'month',
        }),
      ).rejects.toThrow(NotFoundException)
    })

    it('persists customer ID early if existing subscription has none', async () => {
      subs.findPlanByKey.mockResolvedValue(mockPlanPro)
      prisma.system.company.findUnique.mockResolvedValue({ name: 'X', nameEn: 'X' })
      prisma.system.user.findUnique.mockResolvedValue({ email: 'a@b.com' })
      subs.getCurrentSubscription.mockResolvedValue({
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      })

      await service.startCheckout({
        companyId: 'c1',
        userId: 'u1',
        planKey: 'professional',
        interval: 'month',
      })

      expect(prisma.system.subscription.update).toHaveBeenCalledWith({
        where: { companyId: 'c1' },
        data: { stripeCustomerId: 'cus_mock_abc', updatedBy: 'u1' },
      })
    })
  })

  describe('openBillingPortal', () => {
    it('opens the portal when a stripe customer exists', async () => {
      subs.getCurrentSubscription.mockResolvedValue({ stripeCustomerId: 'cus_mock_abc' })
      const res = await service.openBillingPortal('c1')
      expect(res.url).toContain('portal=mock')
    })

    it('throws when no customer is linked', async () => {
      subs.getCurrentSubscription.mockResolvedValue(null)
      await expect(service.openBillingPortal('c1')).rejects.toThrow(BadRequestException)
    })
  })

  describe('changeBillingPlan', () => {
    it('swaps the price and updates local plan', async () => {
      subs.getCurrentSubscription.mockResolvedValue({ stripeSubscriptionId: 'sub_live' })
      subs.findPlanByKey.mockResolvedValue(mockPlanStarter)

      const res = await service.changeBillingPlan({
        companyId: 'c1',
        userId: 'u1',
        planKey: 'starter',
        interval: 'month',
      })

      expect(stripe.updateSubscriptionPrice).toHaveBeenCalledWith({
        stripeSubscriptionId: 'sub_live',
        newPriceId: 'price_starter_monthly',
      })
      expect(prisma.system.subscription.update).toHaveBeenCalledWith({
        where: { companyId: 'c1' },
        data: expect.objectContaining({
          planId: 'plan-starter',
          stripePriceId: 'price_starter_monthly',
          billingInterval: 'month',
        }),
      })
      expect(res).toEqual({ ok: true })
    })

    it('throws when no active Stripe subscription', async () => {
      subs.getCurrentSubscription.mockResolvedValue({ stripeSubscriptionId: null })
      await expect(
        service.changeBillingPlan({
          companyId: 'c1',
          userId: 'u1',
          planKey: 'starter',
          interval: 'month',
        }),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('cancelBilling', () => {
    it('cancels at period end and marks local state', async () => {
      subs.getCurrentSubscription.mockResolvedValue({ stripeSubscriptionId: 'sub_live' })
      await service.cancelBilling({ companyId: 'c1', userId: 'u1', atPeriodEnd: true })
      expect(stripe.cancelSubscription).toHaveBeenCalledWith({
        stripeSubscriptionId: 'sub_live',
        atPeriodEnd: true,
      })
      expect(prisma.system.subscription.update).toHaveBeenCalledWith({
        where: { companyId: 'c1' },
        data: expect.objectContaining({ cancelAtPeriodEnd: true }),
      })
    })

    it('cancels immediately and sets status=CANCELLED', async () => {
      subs.getCurrentSubscription.mockResolvedValue({ stripeSubscriptionId: 'sub_live' })
      await service.cancelBilling({ companyId: 'c1', userId: 'u1', atPeriodEnd: false })
      expect(prisma.system.subscription.update).toHaveBeenCalledWith({
        where: { companyId: 'c1' },
        data: expect.objectContaining({
          cancelAtPeriodEnd: false,
          status: 'CANCELLED',
        }),
      })
    })
  })

  describe('handleWebhook — idempotency', () => {
    it('skips events that have already been processed', async () => {
      prisma.system.webhookEvent.findUnique.mockResolvedValue({ id: 'wh_1' })
      const event = {
        id: 'evt_1',
        type: 'checkout.session.completed',
        data: { object: {} },
      } as unknown as Stripe.Event
      const res = await service.handleWebhook(event)
      expect(res.replayed).toBe(true)
      expect(prisma.system.webhookEvent.create).not.toHaveBeenCalled()
    })

    it('persists event before processing', async () => {
      prisma.system.webhookEvent.findUnique.mockResolvedValue(null)
      const event = {
        id: 'evt_x',
        type: 'unhandled.event.type',
        data: { object: {} },
      } as unknown as Stripe.Event
      await service.handleWebhook(event)
      expect(prisma.system.webhookEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ eventId: 'evt_x', eventType: 'unhandled.event.type' }),
      })
    })
  })

  describe('handleWebhook — checkout.session.completed', () => {
    it('activates subscription with plan + customer + subscription IDs', async () => {
      prisma.system.webhookEvent.findUnique.mockResolvedValue(null)
      subs.findPlanByKey.mockResolvedValue(mockPlanPro)
      const event = {
        id: 'evt_1',
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_1',
            metadata: { companyId: 'c1', userId: 'u1', planKey: 'professional' },
            customer: 'cus_x',
            subscription: 'sub_x',
          },
        },
      } as unknown as Stripe.Event
      await service.handleWebhook(event)
      expect(prisma.system.subscription.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: 'c1' },
          create: expect.objectContaining({
            companyId: 'c1',
            planId: 'plan-pro',
            status: 'ACTIVE',
            stripeCustomerId: 'cus_x',
            stripeSubscriptionId: 'sub_x',
          }),
        }),
      )
    })

    it('logs and skips if metadata is missing', async () => {
      prisma.system.webhookEvent.findUnique.mockResolvedValue(null)
      const event = {
        id: 'evt_1',
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_1', metadata: {} } },
      } as unknown as Stripe.Event
      await service.handleWebhook(event)
      expect(prisma.system.subscription.upsert).not.toHaveBeenCalled()
    })
  })

  describe('handleWebhook — customer.subscription.updated', () => {
    it('reconciles status, period, and price', async () => {
      prisma.system.webhookEvent.findUnique.mockResolvedValue(null)
      const event = {
        id: 'evt_2',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_x',
            status: 'active',
            metadata: { companyId: 'c1' },
            customer: 'cus_x',
            cancel_at_period_end: false,
            current_period_start: 1715000000,
            current_period_end: 1717000000,
            items: {
              data: [{ price: { id: 'price_pro_monthly', recurring: { interval: 'month' } } }],
            },
          },
        },
      } as unknown as Stripe.Event
      await service.handleWebhook(event)
      expect(prisma.system.subscription.updateMany).toHaveBeenCalledWith({
        where: { companyId: 'c1' },
        data: expect.objectContaining({
          status: 'ACTIVE',
          stripeSubscriptionId: 'sub_x',
          stripePriceId: 'price_pro_monthly',
          billingInterval: 'month',
        }),
      })
    })

    it('maps Stripe past_due to PAST_DUE', async () => {
      prisma.system.webhookEvent.findUnique.mockResolvedValue(null)
      const event = {
        id: 'evt_3',
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: 'sub_x',
            status: 'past_due',
            metadata: { companyId: 'c1' },
            customer: 'cus_x',
            cancel_at_period_end: false,
            current_period_start: 1715000000,
            current_period_end: 1717000000,
            items: { data: [{ price: { id: 'p1', recurring: { interval: 'month' } } }] },
          },
        },
      } as unknown as Stripe.Event
      await service.handleWebhook(event)
      expect(prisma.system.subscription.updateMany).toHaveBeenCalledWith({
        where: { companyId: 'c1' },
        data: expect.objectContaining({ status: 'PAST_DUE' }),
      })
    })
  })

  describe('handleWebhook — invoice events', () => {
    it('invoice.paid sets ACTIVE', async () => {
      prisma.system.webhookEvent.findUnique.mockResolvedValue(null)
      const event = {
        id: 'evt_4',
        type: 'invoice.paid',
        data: { object: { subscription: 'sub_x' } },
      } as unknown as Stripe.Event
      await service.handleWebhook(event)
      expect(prisma.system.subscription.updateMany).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: 'sub_x' },
        data: { status: 'ACTIVE' },
      })
    })

    it('invoice.payment_failed sets PAST_DUE', async () => {
      prisma.system.webhookEvent.findUnique.mockResolvedValue(null)
      const event = {
        id: 'evt_5',
        type: 'invoice.payment_failed',
        data: { object: { subscription: 'sub_x' } },
      } as unknown as Stripe.Event
      await service.handleWebhook(event)
      expect(prisma.system.subscription.updateMany).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: 'sub_x' },
        data: { status: 'PAST_DUE' },
      })
    })
  })

  describe('getUsage', () => {
    it('aggregates counts and storage with percentages', async () => {
      subs.getCurrentPlan = jest.fn().mockResolvedValue({
        key: 'professional',
        nameEn: 'Pro',
        maxUsers: 20,
        maxClients: 50,
        maxProjects: 100,
        maxAiGenerationsPerMonth: 50,
        maxStorageMb: 102400,
      })
      prisma.system.user.count.mockResolvedValue(10)
      prisma.system.client.count.mockResolvedValue(25)
      prisma.system.project.count.mockResolvedValue(40)
      prisma.system.aiGeneration.count.mockResolvedValue(10)
      prisma.system.file.aggregate.mockResolvedValue({
        _sum: { sizeBytes: BigInt(50 * 1024 * 1024) },
      })
      const res = await service.getUsage('c1')
      expect(res.plan.key).toBe('professional')
      expect(res.metrics['users']).toEqual({ current: 10, limit: 20, percent: 50 })
      expect(res.metrics['clients']!.percent).toBe(50)
      expect(res.metrics['storageMb']!.current).toBe(50)
    })
  })

  describe('listInvoices', () => {
    it('merges Stripe + paid IQD intents sorted by paidAt desc', async () => {
      subs.getCurrentSubscription.mockResolvedValue({ stripeCustomerId: 'cus_x' })
      stripe.listInvoices.mockResolvedValue([
        {
          id: 'in_1',
          source: 'stripe',
          amount: 4900,
          currency: 'usd',
          status: 'paid',
          paidAt: new Date('2026-04-01'),
          hostedUrl: 'url1',
          pdfUrl: null,
        },
      ])
      prisma.system.paymentIntent.findMany.mockResolvedValue([
        {
          id: 'p1',
          amount: 65000n,
          currency: 'IQD',
          verifiedAt: new Date('2026-05-01'),
          updatedAt: new Date('2026-05-01'),
        },
      ])
      const res = await service.listInvoices('c1')
      expect(res).toHaveLength(2)
      expect(res[0]!.source).toBe('iqd')
      expect(res[1]!.source).toBe('stripe')
    })

    it('returns only IQD intents when no Stripe customer exists', async () => {
      subs.getCurrentSubscription.mockResolvedValue({ stripeCustomerId: null })
      prisma.system.paymentIntent.findMany.mockResolvedValue([])
      const res = await service.listInvoices('c1')
      expect(res).toEqual([])
      expect(stripe.listInvoices).not.toHaveBeenCalled()
    })
  })

  describe('handleWebhook — subscription deleted', () => {
    it('marks subscription CANCELLED', async () => {
      prisma.system.webhookEvent.findUnique.mockResolvedValue(null)
      const event = {
        id: 'evt_6',
        type: 'customer.subscription.deleted',
        data: { object: { id: 'sub_x', metadata: { companyId: 'c1' }, canceled_at: 1715500000 } },
      } as unknown as Stripe.Event
      await service.handleWebhook(event)
      expect(prisma.system.subscription.updateMany).toHaveBeenCalledWith({
        where: { companyId: 'c1' },
        data: expect.objectContaining({ status: 'CANCELLED' }),
      })
    })
  })
})
