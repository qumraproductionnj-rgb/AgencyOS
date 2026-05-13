import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { PaymentIntentStatus } from '@prisma/client'
import { PrismaService } from '../../database/prisma.service'
import { SubscriptionService } from '../../subscriptions/subscription.service'
import { GatewayRegistryService } from './gateways/gateway-registry.service'
import type { LocalGatewayCode } from './gateways/local-gateway.interface'
import type { Env } from '../../config/env.validation'

/**
 * Allowed PaymentIntent state transitions. Terminal states (PAID/FAILED/EXPIRED/CANCELLED/REJECTED)
 * cannot transition further. Any attempt is rejected with a BadRequestException so we surface
 * programming errors instead of silently corrupting payment records.
 */
export const VALID_PAYMENT_TRANSITIONS: Record<PaymentIntentStatus, PaymentIntentStatus[]> = {
  PENDING: ['AWAITING_VERIFICATION', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED'],
  AWAITING_VERIFICATION: ['PAID', 'REJECTED', 'CANCELLED'],
  PAID: [],
  FAILED: [],
  EXPIRED: [],
  CANCELLED: [],
  REJECTED: [],
}

export interface CreateIntentInput {
  companyId: string
  userId: string
  planKey: 'starter' | 'professional' | 'agency'
  interval: 'month' | 'year'
  provider: LocalGatewayCode | 'manual_bank_transfer'
  callbackUrl: string
}

@Injectable()
export class PaymentIntentService {
  private readonly logger = new Logger(PaymentIntentService.name)
  private readonly ttlMinutes: number

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateways: GatewayRegistryService,
    private readonly subscriptions: SubscriptionService,
    private readonly config: ConfigService<Env, true>,
  ) {
    this.ttlMinutes = this.config.get('PAYMENT_INTENT_TTL_MINUTES', { infer: true })
  }

  async create(input: CreateIntentInput): Promise<{
    id: string
    provider: string
    qrCode: string | null
    redirectUrl: string | null
    bankDetails: BankDetails | null
    amount: string
    expiresAt: Date | null
  }> {
    const plan = await this.subscriptions.findPlanByKey(input.planKey)
    const amount = input.interval === 'year' ? plan.priceYearlyIqd : plan.priceMonthlyIqd
    if (amount <= 0n) {
      throw new BadRequestException(
        `Plan "${plan.key}" has no IQD price for interval "${input.interval}"`,
      )
    }

    const expiresAt = new Date(Date.now() + this.ttlMinutes * 60 * 1000)

    if (input.provider === 'manual_bank_transfer') {
      const intent = await this.prisma.system.paymentIntent.create({
        data: {
          companyId: input.companyId,
          planId: plan.id,
          provider: 'manual_bank_transfer',
          amount,
          currency: 'IQD',
          interval: input.interval,
          status: 'PENDING',
          expiresAt,
          createdBy: input.userId,
          updatedBy: input.userId,
        },
      })
      return {
        id: intent.id,
        provider: intent.provider,
        qrCode: null,
        redirectUrl: null,
        bankDetails: this.buildBankDetails(),
        amount: amount.toString(),
        expiresAt,
      }
    }

    const gateway = this.gateways.get(input.provider)
    // Create the local row first so the provider can use its ID as merchant reference.
    const draft = await this.prisma.system.paymentIntent.create({
      data: {
        companyId: input.companyId,
        planId: plan.id,
        provider: gateway.code,
        amount,
        currency: 'IQD',
        interval: input.interval,
        status: 'PENDING',
        expiresAt,
        createdBy: input.userId,
        updatedBy: input.userId,
      },
    })

    const providerResult = await gateway.createPaymentIntent({
      intentId: draft.id,
      amountFils: amount,
      description: `AgencyOS ${plan.nameEn} (${input.interval}ly)`,
      callbackUrl: input.callbackUrl,
    })

    const intent = await this.prisma.system.paymentIntent.update({
      where: { id: draft.id },
      data: {
        providerRef: providerResult.providerRef,
        qrCode: providerResult.qrCode,
        redirectUrl: providerResult.redirectUrl,
        ...(providerResult.expiresAt ? { expiresAt: providerResult.expiresAt } : {}),
      },
    })

    return {
      id: intent.id,
      provider: intent.provider,
      qrCode: intent.qrCode,
      redirectUrl: intent.redirectUrl,
      bankDetails: null,
      amount: amount.toString(),
      expiresAt: intent.expiresAt,
    }
  }

  async findById(id: string, companyId: string) {
    const intent = await this.prisma.system.paymentIntent.findUnique({ where: { id } })
    if (!intent || intent.deletedAt) throw new NotFoundException('Payment intent not found')
    if (intent.companyId !== companyId) {
      throw new ForbiddenException('You cannot access this payment intent')
    }
    return intent
  }

  async listAwaitingVerification(limit = 50) {
    return this.prisma.system.paymentIntent.findMany({
      where: { status: 'AWAITING_VERIFICATION', deletedAt: null },
      orderBy: { createdAt: 'asc' },
      take: Math.min(Math.max(limit, 1), 200),
    })
  }

  async findByProviderRef(provider: string, providerRef: string) {
    return this.prisma.system.paymentIntent.findFirst({
      where: { provider, providerRef, deletedAt: null },
    })
  }

  /**
   * Transition a payment intent. Throws if the transition is not allowed.
   * Refuses to mutate terminal states. Updates `updatedBy` if provided.
   */
  async transition(
    id: string,
    next: PaymentIntentStatus,
    options: { actorId?: string; extra?: Record<string, unknown> } = {},
  ) {
    const current = await this.prisma.system.paymentIntent.findUnique({ where: { id } })
    if (!current) throw new NotFoundException('Payment intent not found')
    const allowed = VALID_PAYMENT_TRANSITIONS[current.status]
    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Cannot transition payment intent from ${current.status} to ${next}`,
      )
    }
    return this.prisma.system.paymentIntent.update({
      where: { id },
      data: {
        status: next,
        ...(options.actorId ? { updatedBy: options.actorId } : {}),
        ...options.extra,
      },
    })
  }

  /**
   * Sweep PENDING intents past their TTL and mark them EXPIRED.
   * Intended for a scheduled job; safe to call ad-hoc.
   */
  async expireOverdue(): Promise<number> {
    const now = new Date()
    const result = await this.prisma.system.paymentIntent.updateMany({
      where: {
        status: { in: ['PENDING', 'AWAITING_VERIFICATION'] },
        expiresAt: { lt: now },
        deletedAt: null,
      },
      data: { status: 'EXPIRED' },
    })
    return result.count
  }

  private buildBankDetails(): BankDetails {
    return {
      bankName: this.config.get('MANUAL_BANK_NAME', { infer: true }),
      accountNumber: this.config.get('MANUAL_BANK_ACCOUNT_NUMBER', { infer: true }),
      iban: this.config.get('MANUAL_BANK_IBAN', { infer: true }),
      swift: this.config.get('MANUAL_BANK_SWIFT', { infer: true }),
    }
  }
}

export interface BankDetails {
  bankName: string
  accountNumber: string
  iban: string
  swift: string
}
