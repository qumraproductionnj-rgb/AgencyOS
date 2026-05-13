import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { PaymentIntentService } from './payment-intent.service'
import { SubscriptionService } from '../../subscriptions/subscription.service'

/**
 * Manual bank transfer flow:
 *   1. User creates a PENDING intent via PaymentIntentService.create({ provider: 'manual_bank_transfer' })
 *   2. User submits receipt + reference → status moves PENDING → AWAITING_VERIFICATION
 *   3. PLATFORM_ADMIN reviews → approve (→ PAID, activates subscription) or reject (→ REJECTED, with reason)
 *
 * Activation is invoked by the orchestrator (BillingActivationService) so PaymentIntentService
 * has no dependency on subscription writes.
 */
@Injectable()
export class ManualPaymentService {
  private readonly logger = new Logger(ManualPaymentService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly intents: PaymentIntentService,
    private readonly subscriptions: SubscriptionService,
  ) {}

  async submitReceipt(input: {
    intentId: string
    companyId: string
    userId: string
    receiptFileId: string
    bankReference: string
  }) {
    const intent = await this.intents.findById(input.intentId, input.companyId)
    if (intent.provider !== 'manual_bank_transfer') {
      throw new BadRequestException('This payment intent is not a manual bank transfer')
    }
    if (intent.status !== 'PENDING') {
      throw new BadRequestException(
        `Cannot submit receipt for intent in status ${intent.status}; expected PENDING`,
      )
    }
    return this.intents.transition(input.intentId, 'AWAITING_VERIFICATION', {
      actorId: input.userId,
      extra: {
        receiptFileId: input.receiptFileId,
        bankReference: input.bankReference,
      },
    })
  }

  async approve(input: { intentId: string; adminUserId: string }) {
    const intent = await this.prisma.system.paymentIntent.findUnique({
      where: { id: input.intentId },
    })
    if (!intent) throw new NotFoundException('Payment intent not found')
    if (intent.provider !== 'manual_bank_transfer') {
      throw new BadRequestException('This intent is not a manual bank transfer')
    }
    if (intent.status !== 'AWAITING_VERIFICATION') {
      throw new BadRequestException(
        `Cannot approve intent in status ${intent.status}; expected AWAITING_VERIFICATION`,
      )
    }

    const transitioned = await this.intents.transition(input.intentId, 'PAID', {
      actorId: input.adminUserId,
      extra: {
        verifiedById: input.adminUserId,
        verifiedAt: new Date(),
      },
    })

    await this.activateSubscriptionFromIntent(transitioned.id)
    return transitioned
  }

  async reject(input: { intentId: string; adminUserId: string; reason: string }) {
    if (!input.reason || input.reason.trim().length < 3) {
      throw new BadRequestException('Rejection reason is required (min 3 chars)')
    }
    const intent = await this.prisma.system.paymentIntent.findUnique({
      where: { id: input.intentId },
    })
    if (!intent) throw new NotFoundException('Payment intent not found')
    if (intent.status !== 'AWAITING_VERIFICATION') {
      throw new BadRequestException(
        `Cannot reject intent in status ${intent.status}; expected AWAITING_VERIFICATION`,
      )
    }
    return this.intents.transition(input.intentId, 'REJECTED', {
      actorId: input.adminUserId,
      extra: {
        rejectionReason: input.reason.trim(),
        verifiedById: input.adminUserId,
        verifiedAt: new Date(),
      },
    })
  }

  /**
   * Upsert the company's subscription to ACTIVE on the intent's plan + interval.
   * Called after PAID transition (both manual and gateway-driven flows).
   * Idempotent: re-running on an already-active subscription does not duplicate state.
   */
  async activateSubscriptionFromIntent(intentId: string): Promise<void> {
    const intent = await this.prisma.system.paymentIntent.findUnique({ where: { id: intentId } })
    if (!intent || intent.status !== 'PAID') {
      this.logger.warn(`Skipping activation: intent ${intentId} is not PAID`)
      return
    }
    const plan = await this.subscriptions.findPlanById(intent.planId)
    const existing = await this.subscriptions.getCurrentSubscription(intent.companyId)
    const now = new Date()
    const periodEnd = new Date(
      now.getTime() + (intent.interval === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000,
    )

    if (!existing) {
      await this.prisma.system.subscription.create({
        data: {
          companyId: intent.companyId,
          planId: plan.id,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          billingInterval: intent.interval,
          createdBy: intent.createdBy,
          updatedBy: intent.createdBy,
        },
      })
    } else {
      await this.prisma.system.subscription.update({
        where: { companyId: intent.companyId },
        data: {
          planId: plan.id,
          status: 'ACTIVE',
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          billingInterval: intent.interval,
          cancelAtPeriodEnd: false,
          cancelledAt: null,
          ...(intent.createdBy ? { updatedBy: intent.createdBy } : {}),
        },
      })
    }

    const finalSub = await this.subscriptions.getCurrentSubscription(intent.companyId)
    if (finalSub) {
      await this.prisma.system.paymentIntent.update({
        where: { id: intentId },
        data: { subscriptionId: finalSub.id },
      })
    }
  }
}
