import { Test } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ManualPaymentService } from './manual-payment.service'
import { PaymentIntentService } from './payment-intent.service'
import { SubscriptionService } from '../../subscriptions/subscription.service'
import { PrismaService } from '../../database/prisma.service'

function mockPrisma() {
  return {
    system: {
      paymentIntent: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      subscription: {
        create: jest.fn(),
        update: jest.fn(),
      },
    },
  }
}

function mockIntents() {
  return {
    findById: jest.fn(),
    transition: jest.fn(),
  }
}

function mockSubs() {
  return {
    findPlanById: jest.fn().mockResolvedValue({ id: 'plan-pro', key: 'professional' }),
    getCurrentSubscription: jest.fn(),
  }
}

describe('ManualPaymentService', () => {
  let service: ManualPaymentService
  let prisma: ReturnType<typeof mockPrisma>
  let intents: ReturnType<typeof mockIntents>
  let subs: ReturnType<typeof mockSubs>

  beforeEach(async () => {
    prisma = mockPrisma()
    intents = mockIntents()
    subs = mockSubs()
    const module = await Test.createTestingModule({
      providers: [
        ManualPaymentService,
        { provide: PrismaService, useValue: prisma },
        { provide: PaymentIntentService, useValue: intents },
        { provide: SubscriptionService, useValue: subs },
      ],
    }).compile()
    service = module.get(ManualPaymentService)
  })

  describe('submitReceipt', () => {
    it('transitions PENDING → AWAITING_VERIFICATION with receipt + bank ref', async () => {
      intents.findById.mockResolvedValue({
        id: 'i1',
        provider: 'manual_bank_transfer',
        status: 'PENDING',
      })
      intents.transition.mockResolvedValue({ id: 'i1', status: 'AWAITING_VERIFICATION' })

      await service.submitReceipt({
        intentId: 'i1',
        companyId: 'c1',
        userId: 'u1',
        receiptFileId: 'file-1',
        bankReference: 'TXN-12345',
      })

      expect(intents.transition).toHaveBeenCalledWith('i1', 'AWAITING_VERIFICATION', {
        actorId: 'u1',
        extra: {
          receiptFileId: 'file-1',
          bankReference: 'TXN-12345',
        },
      })
    })

    it('rejects when intent is not a manual transfer', async () => {
      intents.findById.mockResolvedValue({ id: 'i1', provider: 'fib', status: 'PENDING' })
      await expect(
        service.submitReceipt({
          intentId: 'i1',
          companyId: 'c1',
          userId: 'u1',
          receiptFileId: 'f',
          bankReference: 'r',
        }),
      ).rejects.toThrow(BadRequestException)
    })

    it('rejects when intent is not PENDING (e.g. already AWAITING_VERIFICATION)', async () => {
      intents.findById.mockResolvedValue({
        id: 'i1',
        provider: 'manual_bank_transfer',
        status: 'AWAITING_VERIFICATION',
      })
      await expect(
        service.submitReceipt({
          intentId: 'i1',
          companyId: 'c1',
          userId: 'u1',
          receiptFileId: 'f',
          bankReference: 'r',
        }),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('approve', () => {
    it('transitions AWAITING_VERIFICATION → PAID and activates subscription', async () => {
      prisma.system.paymentIntent.findUnique
        .mockResolvedValueOnce({
          id: 'i1',
          provider: 'manual_bank_transfer',
          status: 'AWAITING_VERIFICATION',
        })
        // Second call from activateSubscriptionFromIntent
        .mockResolvedValueOnce({
          id: 'i1',
          companyId: 'c1',
          planId: 'plan-pro',
          status: 'PAID',
          interval: 'month',
          createdBy: 'u1',
        })
      intents.transition.mockResolvedValue({ id: 'i1', status: 'PAID' })
      subs.getCurrentSubscription
        .mockResolvedValueOnce(null) // no existing — branches to create
        .mockResolvedValueOnce({ id: 'sub-new' }) // for backlink

      await service.approve({ intentId: 'i1', adminUserId: 'admin-1' })

      expect(intents.transition).toHaveBeenCalledWith('i1', 'PAID', {
        actorId: 'admin-1',
        extra: expect.objectContaining({
          verifiedById: 'admin-1',
        }),
      })
      expect(prisma.system.subscription.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          companyId: 'c1',
          planId: 'plan-pro',
          status: 'ACTIVE',
          billingInterval: 'month',
        }),
      })
    })

    it('updates existing subscription on approve when one already exists', async () => {
      prisma.system.paymentIntent.findUnique
        .mockResolvedValueOnce({
          id: 'i1',
          provider: 'manual_bank_transfer',
          status: 'AWAITING_VERIFICATION',
        })
        .mockResolvedValueOnce({
          id: 'i1',
          companyId: 'c1',
          planId: 'plan-pro',
          status: 'PAID',
          interval: 'month',
          createdBy: 'u1',
        })
      intents.transition.mockResolvedValue({ id: 'i1', status: 'PAID' })
      subs.getCurrentSubscription
        .mockResolvedValueOnce({ id: 'sub-existing' })
        .mockResolvedValueOnce({ id: 'sub-existing' })

      await service.approve({ intentId: 'i1', adminUserId: 'admin-1' })

      expect(prisma.system.subscription.update).toHaveBeenCalledWith({
        where: { companyId: 'c1' },
        data: expect.objectContaining({ status: 'ACTIVE' }),
      })
    })

    it('rejects approving a non-manual intent', async () => {
      prisma.system.paymentIntent.findUnique.mockResolvedValue({
        id: 'i1',
        provider: 'fib',
        status: 'AWAITING_VERIFICATION',
      })
      await expect(service.approve({ intentId: 'i1', adminUserId: 'admin-1' })).rejects.toThrow(
        BadRequestException,
      )
    })

    it('rejects approving an intent not in AWAITING_VERIFICATION', async () => {
      prisma.system.paymentIntent.findUnique.mockResolvedValue({
        id: 'i1',
        provider: 'manual_bank_transfer',
        status: 'PENDING',
      })
      await expect(service.approve({ intentId: 'i1', adminUserId: 'admin-1' })).rejects.toThrow(
        BadRequestException,
      )
    })

    it('throws NotFound for missing intent', async () => {
      prisma.system.paymentIntent.findUnique.mockResolvedValue(null)
      await expect(
        service.approve({ intentId: 'missing', adminUserId: 'admin-1' }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('reject', () => {
    it('transitions AWAITING_VERIFICATION → REJECTED with reason', async () => {
      prisma.system.paymentIntent.findUnique.mockResolvedValue({
        id: 'i1',
        status: 'AWAITING_VERIFICATION',
      })
      intents.transition.mockResolvedValue({ id: 'i1', status: 'REJECTED' })

      await service.reject({
        intentId: 'i1',
        adminUserId: 'admin-1',
        reason: 'Receipt mismatch',
      })

      expect(intents.transition).toHaveBeenCalledWith('i1', 'REJECTED', {
        actorId: 'admin-1',
        extra: expect.objectContaining({
          rejectionReason: 'Receipt mismatch',
          verifiedById: 'admin-1',
        }),
      })
    })

    it('rejects empty / too-short reason', async () => {
      prisma.system.paymentIntent.findUnique.mockResolvedValue({
        id: 'i1',
        status: 'AWAITING_VERIFICATION',
      })
      await expect(
        service.reject({ intentId: 'i1', adminUserId: 'admin-1', reason: 'x' }),
      ).rejects.toThrow(BadRequestException)
    })

    it('rejects rejection when status is wrong', async () => {
      prisma.system.paymentIntent.findUnique.mockResolvedValue({
        id: 'i1',
        status: 'PENDING',
      })
      await expect(
        service.reject({ intentId: 'i1', adminUserId: 'admin-1', reason: 'invalid receipt' }),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('activateSubscriptionFromIntent', () => {
    it('skips activation if intent is not PAID', async () => {
      prisma.system.paymentIntent.findUnique.mockResolvedValue({
        id: 'i1',
        status: 'PENDING',
      })
      await service.activateSubscriptionFromIntent('i1')
      expect(prisma.system.subscription.create).not.toHaveBeenCalled()
      expect(prisma.system.subscription.update).not.toHaveBeenCalled()
    })
  })
})
