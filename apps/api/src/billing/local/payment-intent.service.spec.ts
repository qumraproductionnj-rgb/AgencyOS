import { Test } from '@nestjs/testing'
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PaymentIntentService, VALID_PAYMENT_TRANSITIONS } from './payment-intent.service'
import { GatewayRegistryService } from './gateways/gateway-registry.service'
import { SubscriptionService } from '../../subscriptions/subscription.service'
import { PrismaService } from '../../database/prisma.service'

const mockPlan = {
  id: 'plan-pro',
  key: 'professional',
  nameAr: 'احترافي',
  nameEn: 'Professional',
  priceMonthlyIqd: 65000n,
  priceYearlyIqd: 650000n,
  gatewayProductRefs: { fib: 'fib_prod_pro' },
}

function mockPrisma() {
  return {
    system: {
      paymentIntent: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
    },
  }
}

function mockGatewayRegistry(mode: 'fib' | 'unknown' = 'fib') {
  const fibGateway = {
    code: 'fib',
    isImplemented: true,
    createPaymentIntent: jest.fn().mockResolvedValue({
      providerRef: 'fib_mock_xyz',
      qrCode: 'data:image/png;base64,iVBOR...',
      redirectUrl: 'fib://payment?ref=xyz',
      expiresAt: new Date('2026-05-13T13:00:00Z'),
    }),
  }
  return {
    get: jest.fn((code: string) => {
      if (code === 'fib') return fibGateway
      if (mode === 'unknown') {
        throw new NotFoundException(`Unknown gateway: ${code}`)
      }
      return fibGateway
    }),
    _fib: fibGateway,
  }
}

function mockSubscriptions() {
  return {
    findPlanByKey: jest.fn().mockResolvedValue(mockPlan),
    findPlanById: jest.fn().mockResolvedValue(mockPlan),
    getCurrentSubscription: jest.fn(),
  }
}

function mockConfig() {
  return {
    get: jest.fn((key: string) => {
      const map: Record<string, unknown> = {
        PAYMENT_INTENT_TTL_MINUTES: 30,
        MANUAL_BANK_NAME: 'Test Bank',
        MANUAL_BANK_ACCOUNT_NUMBER: '0000-0000',
        MANUAL_BANK_IBAN: 'IQ00 0000',
        MANUAL_BANK_SWIFT: 'TESTBANK',
      }
      return map[key]
    }),
  }
}

describe('PaymentIntentService', () => {
  let service: PaymentIntentService
  let prisma: ReturnType<typeof mockPrisma>
  let gateways: ReturnType<typeof mockGatewayRegistry>
  let subs: ReturnType<typeof mockSubscriptions>

  beforeEach(async () => {
    prisma = mockPrisma()
    gateways = mockGatewayRegistry()
    subs = mockSubscriptions()

    const module = await Test.createTestingModule({
      providers: [
        PaymentIntentService,
        { provide: PrismaService, useValue: prisma },
        { provide: GatewayRegistryService, useValue: gateways },
        { provide: SubscriptionService, useValue: subs },
        { provide: ConfigService, useValue: mockConfig() },
      ],
    }).compile()
    service = module.get(PaymentIntentService)
  })

  describe('VALID_PAYMENT_TRANSITIONS', () => {
    it('PENDING can transition to AWAITING_VERIFICATION, PAID, FAILED, EXPIRED, CANCELLED', () => {
      expect(VALID_PAYMENT_TRANSITIONS.PENDING).toEqual(
        expect.arrayContaining(['AWAITING_VERIFICATION', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED']),
      )
    })

    it('AWAITING_VERIFICATION can only transition to PAID, REJECTED, CANCELLED', () => {
      expect(VALID_PAYMENT_TRANSITIONS.AWAITING_VERIFICATION).toEqual([
        'PAID',
        'REJECTED',
        'CANCELLED',
      ])
    })

    it('all terminal states have no outgoing transitions', () => {
      expect(VALID_PAYMENT_TRANSITIONS.PAID).toEqual([])
      expect(VALID_PAYMENT_TRANSITIONS.FAILED).toEqual([])
      expect(VALID_PAYMENT_TRANSITIONS.EXPIRED).toEqual([])
      expect(VALID_PAYMENT_TRANSITIONS.CANCELLED).toEqual([])
      expect(VALID_PAYMENT_TRANSITIONS.REJECTED).toEqual([])
    })
  })

  describe('create — manual bank transfer', () => {
    it('creates a PENDING intent with bank details and no provider call', async () => {
      prisma.system.paymentIntent.create.mockResolvedValue({
        id: 'intent-1',
        provider: 'manual_bank_transfer',
        amount: 65000n,
      })
      const res = await service.create({
        companyId: 'c1',
        userId: 'u1',
        planKey: 'professional',
        interval: 'month',
        provider: 'manual_bank_transfer',
        callbackUrl: 'http://localhost/cb',
      })
      expect(res.bankDetails).toEqual({
        bankName: 'Test Bank',
        accountNumber: '0000-0000',
        iban: 'IQ00 0000',
        swift: 'TESTBANK',
      })
      expect(res.qrCode).toBeNull()
      expect(res.amount).toBe('65000')
      expect(gateways._fib.createPaymentIntent).not.toHaveBeenCalled()
    })

    it('rejects when plan has no IQD price for the interval', async () => {
      subs.findPlanByKey.mockResolvedValue({ ...mockPlan, priceMonthlyIqd: 0n })
      await expect(
        service.create({
          companyId: 'c1',
          userId: 'u1',
          planKey: 'professional',
          interval: 'month',
          provider: 'manual_bank_transfer',
          callbackUrl: 'http://localhost/cb',
        }),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('create — FIB gateway', () => {
    it('creates intent → calls FIB → updates with providerRef/qr/redirect', async () => {
      prisma.system.paymentIntent.create.mockResolvedValue({ id: 'intent-fib-1' })
      prisma.system.paymentIntent.update.mockResolvedValue({
        id: 'intent-fib-1',
        provider: 'fib',
        qrCode: 'data:image/png;base64,iVBOR...',
        redirectUrl: 'fib://payment?ref=xyz',
        expiresAt: new Date('2026-05-13T13:00:00Z'),
      })

      const res = await service.create({
        companyId: 'c1',
        userId: 'u1',
        planKey: 'professional',
        interval: 'month',
        provider: 'fib',
        callbackUrl: 'http://localhost/cb',
      })

      expect(gateways._fib.createPaymentIntent).toHaveBeenCalledWith({
        intentId: 'intent-fib-1',
        amountFils: 65000n,
        description: 'AgencyOS Professional (monthly)',
        callbackUrl: 'http://localhost/cb',
      })
      expect(res.qrCode).toContain('data:image/png;base64')
      expect(res.redirectUrl).toContain('fib://')
    })

    it('uses yearly price for interval=year', async () => {
      prisma.system.paymentIntent.create.mockResolvedValue({ id: 'intent-fib-2' })
      prisma.system.paymentIntent.update.mockResolvedValue({ id: 'intent-fib-2' })
      await service.create({
        companyId: 'c1',
        userId: 'u1',
        planKey: 'professional',
        interval: 'year',
        provider: 'fib',
        callbackUrl: 'http://localhost/cb',
      })
      expect(gateways._fib.createPaymentIntent).toHaveBeenCalledWith(
        expect.objectContaining({ amountFils: 650000n }),
      )
    })
  })

  describe('findById', () => {
    it('returns intent when belongs to caller company', async () => {
      prisma.system.paymentIntent.findUnique.mockResolvedValue({
        id: 'i1',
        companyId: 'c1',
        deletedAt: null,
      })
      const res = await service.findById('i1', 'c1')
      expect(res.id).toBe('i1')
    })

    it('throws Forbidden when intent belongs to another company', async () => {
      prisma.system.paymentIntent.findUnique.mockResolvedValue({
        id: 'i1',
        companyId: 'c2',
        deletedAt: null,
      })
      await expect(service.findById('i1', 'c1')).rejects.toThrow(ForbiddenException)
    })

    it('throws NotFound when intent is missing', async () => {
      prisma.system.paymentIntent.findUnique.mockResolvedValue(null)
      await expect(service.findById('i1', 'c1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('transition', () => {
    it('allows PENDING → PAID', async () => {
      prisma.system.paymentIntent.findUnique.mockResolvedValue({ id: 'i1', status: 'PENDING' })
      prisma.system.paymentIntent.update.mockResolvedValue({ id: 'i1', status: 'PAID' })
      const res = await service.transition('i1', 'PAID')
      expect(res.status).toBe('PAID')
    })

    it('rejects PAID → CANCELLED (terminal state)', async () => {
      prisma.system.paymentIntent.findUnique.mockResolvedValue({ id: 'i1', status: 'PAID' })
      await expect(service.transition('i1', 'CANCELLED')).rejects.toThrow(BadRequestException)
    })

    it('rejects PENDING → REJECTED (invalid transition; must go via AWAITING_VERIFICATION)', async () => {
      prisma.system.paymentIntent.findUnique.mockResolvedValue({ id: 'i1', status: 'PENDING' })
      await expect(service.transition('i1', 'REJECTED')).rejects.toThrow(BadRequestException)
    })
  })

  describe('expireOverdue', () => {
    it('marks PENDING and AWAITING_VERIFICATION intents past TTL as EXPIRED', async () => {
      prisma.system.paymentIntent.updateMany.mockResolvedValue({ count: 3 })
      const count = await service.expireOverdue()
      expect(count).toBe(3)
      expect(prisma.system.paymentIntent.updateMany).toHaveBeenCalledWith({
        where: {
          status: { in: ['PENDING', 'AWAITING_VERIFICATION'] },
          expiresAt: { lt: expect.any(Date) },
          deletedAt: null,
        },
        data: { status: 'EXPIRED' },
      })
    })
  })
})
