import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type Stripe from 'stripe'
import { PrismaService } from '../database/prisma.service'
import { StripeService, type NormalizedInvoice } from './stripe.service'
import { SubscriptionService } from '../subscriptions/subscription.service'
import type { Env } from '../config/env.validation'

type BillingInterval = 'month' | 'year'

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly subscriptions: SubscriptionService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  /** Start a Stripe Checkout to upgrade/start a paid subscription. */
  async startCheckout(params: {
    companyId: string
    userId: string
    planKey: 'starter' | 'professional' | 'agency'
    interval: BillingInterval
  }): Promise<{ checkoutUrl: string; sessionId: string }> {
    const plan = await this.subscriptions.findPlanByKey(params.planKey)
    const priceId =
      params.interval === 'year' ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly
    if (!priceId) {
      throw new BadRequestException(
        `Plan "${plan.key}" has no Stripe price for interval "${params.interval}"`,
      )
    }

    const company = await this.prisma.system.company.findUnique({
      where: { id: params.companyId },
      select: { name: true, nameEn: true },
    })
    if (!company) throw new NotFoundException('Company not found')

    const user = await this.prisma.system.user.findUnique({
      where: { id: params.userId },
      select: { email: true },
    })
    if (!user) throw new NotFoundException('User not found')

    const existingSub = await this.subscriptions.getCurrentSubscription(params.companyId)

    const customerId = await this.stripe.ensureCustomer({
      companyId: params.companyId,
      email: user.email,
      name: company.nameEn ?? company.name,
      existingStripeCustomerId: existingSub?.stripeCustomerId ?? null,
    })

    // Persist customer ID early so webhooks can correlate even if the user abandons checkout.
    if (existingSub && !existingSub.stripeCustomerId) {
      await this.prisma.system.subscription.update({
        where: { companyId: params.companyId },
        data: { stripeCustomerId: customerId, updatedBy: params.userId },
      })
    }

    const successUrl = this.config.get('STRIPE_CHECKOUT_SUCCESS_URL', { infer: true })
    const cancelUrl = this.config.get('STRIPE_CHECKOUT_CANCEL_URL', { infer: true })

    const session = await this.stripe.createCheckoutSession({
      customerId,
      priceId,
      companyId: params.companyId,
      userId: params.userId,
      planKey: plan.key,
      successUrl,
      cancelUrl,
    })

    return { checkoutUrl: session.url, sessionId: session.id }
  }

  /** Open the Stripe Billing Portal to manage payment methods / invoices. */
  async openBillingPortal(companyId: string): Promise<{ url: string }> {
    const sub = await this.subscriptions.getCurrentSubscription(companyId)
    if (!sub?.stripeCustomerId) {
      throw new BadRequestException('No Stripe customer linked. Start a subscription first.')
    }
    const returnUrl = this.config.get('STRIPE_BILLING_PORTAL_RETURN_URL', { infer: true })
    return this.stripe.createBillingPortalSession({
      customerId: sub.stripeCustomerId,
      returnUrl,
    })
  }

  /** Change plan: swap the Stripe price (proration). */
  async changeBillingPlan(params: {
    companyId: string
    userId: string
    planKey: 'starter' | 'professional' | 'agency'
    interval: BillingInterval
  }): Promise<{ ok: true }> {
    const sub = await this.subscriptions.getCurrentSubscription(params.companyId)
    if (!sub?.stripeSubscriptionId) {
      throw new BadRequestException('No active Stripe subscription to change. Use checkout first.')
    }
    const plan = await this.subscriptions.findPlanByKey(params.planKey)
    const newPriceId =
      params.interval === 'year' ? plan.stripePriceIdYearly : plan.stripePriceIdMonthly
    if (!newPriceId) {
      throw new BadRequestException(
        `Plan "${plan.key}" has no Stripe price for interval "${params.interval}"`,
      )
    }

    await this.stripe.updateSubscriptionPrice({
      stripeSubscriptionId: sub.stripeSubscriptionId,
      newPriceId,
    })

    // Locally record the intent; the webhook will reconcile authoritative state.
    await this.prisma.system.subscription.update({
      where: { companyId: params.companyId },
      data: {
        planId: plan.id,
        stripePriceId: newPriceId,
        billingInterval: params.interval,
        updatedBy: params.userId,
      },
    })
    return { ok: true }
  }

  /** Aggregated usage vs plan limits for the company. */
  async getUsage(companyId: string): Promise<{
    plan: { key: string; nameEn: string }
    metrics: Record<string, { current: number; limit: number; percent: number }>
  }> {
    const plan = await this.subscriptions.getCurrentPlan(companyId)
    const [users, clients, projects, aiMonth, storage] = await Promise.all([
      this.prisma.system.user.count({ where: { companyId, isActive: true, deletedAt: null } }),
      this.prisma.system.client.count({ where: { companyId, deletedAt: null } }),
      this.prisma.system.project.count({ where: { companyId, deletedAt: null } }),
      this.prisma.system.aiGeneration.count({
        where: {
          companyId,
          createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
      this.prisma.system.file.aggregate({
        where: { companyId, deletedAt: null },
        _sum: { sizeBytes: true },
      }),
    ])
    const storageBytes = Number(storage._sum.sizeBytes ?? 0n)
    const storageMb = Math.round(storageBytes / (1024 * 1024))

    const metric = (current: number, limit: number) => ({
      current,
      limit,
      percent: limit > 0 ? Math.min(100, Math.round((current / limit) * 100)) : 0,
    })

    return {
      plan: { key: plan.key, nameEn: plan.nameEn },
      metrics: {
        users: metric(users, plan.maxUsers),
        clients: metric(clients, plan.maxClients),
        projects: metric(projects, plan.maxProjects),
        aiGenerations: metric(aiMonth, plan.maxAiGenerationsPerMonth),
        storageMb: metric(storageMb, plan.maxStorageMb),
      },
    }
  }

  /** Unified invoice history: Stripe invoices + paid local IQD payment intents. */
  async listInvoices(companyId: string): Promise<NormalizedInvoice[]> {
    const sub = await this.subscriptions.getCurrentSubscription(companyId)
    const stripeInvoices = sub?.stripeCustomerId
      ? await this.stripe.listInvoices(sub.stripeCustomerId)
      : []
    const paidIntents = await this.prisma.system.paymentIntent.findMany({
      where: { companyId, status: 'PAID', deletedAt: null },
      orderBy: { verifiedAt: 'desc' },
      take: 50,
    })
    const iqdInvoices: NormalizedInvoice[] = paidIntents.map((p) => ({
      id: p.id,
      source: 'iqd',
      amount: Number(p.amount),
      currency: p.currency.toLowerCase(),
      status: 'paid',
      paidAt: p.verifiedAt ?? p.updatedAt,
      hostedUrl: null,
      pdfUrl: null,
    }))
    return [...stripeInvoices, ...iqdInvoices].sort(
      (a, b) => (b.paidAt?.getTime() ?? 0) - (a.paidAt?.getTime() ?? 0),
    )
  }

  /** Cancel a subscription (defaults to at-period-end). */
  async cancelBilling(params: {
    companyId: string
    userId: string
    atPeriodEnd: boolean
  }): Promise<{ ok: true }> {
    const sub = await this.subscriptions.getCurrentSubscription(params.companyId)
    if (!sub?.stripeSubscriptionId) {
      throw new BadRequestException('No active Stripe subscription to cancel.')
    }
    await this.stripe.cancelSubscription({
      stripeSubscriptionId: sub.stripeSubscriptionId,
      atPeriodEnd: params.atPeriodEnd,
    })
    await this.prisma.system.subscription.update({
      where: { companyId: params.companyId },
      data: {
        cancelAtPeriodEnd: params.atPeriodEnd,
        ...(params.atPeriodEnd ? {} : { status: 'CANCELLED', cancelledAt: new Date() }),
        updatedBy: params.userId,
      },
    })
    return { ok: true }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Webhook handler — reconciles Stripe state into our subscription record.
  // Idempotent: every event is stored in `webhook_events` keyed by Stripe's
  // event ID before any DB mutation. Replays exit early.
  // ──────────────────────────────────────────────────────────────────────────

  async handleWebhook(event: Stripe.Event): Promise<{ ok: true; replayed?: boolean }> {
    const existing = await this.prisma.system.webhookEvent.findUnique({
      where: { uniq_webhook_provider_event: { provider: 'stripe', eventId: event.id } },
    })
    if (existing) {
      this.logger.warn(`Stripe event ${event.id} (${event.type}) already processed — skipping`)
      return { ok: true, replayed: true }
    }

    await this.prisma.system.webhookEvent.create({
      data: {
        provider: 'stripe',
        eventId: event.id,
        eventType: event.type,
        payload: event as unknown as object,
      },
    })

    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.onCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
          break
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await this.onSubscriptionUpserted(event.data.object as Stripe.Subscription)
          break
        case 'customer.subscription.deleted':
          await this.onSubscriptionDeleted(event.data.object as Stripe.Subscription)
          break
        case 'invoice.paid':
          await this.onInvoicePaid(event.data.object as Stripe.Invoice)
          break
        case 'invoice.payment_failed':
          await this.onInvoiceFailed(event.data.object as Stripe.Invoice)
          break
        case 'customer.subscription.trial_will_end':
          this.logger.log(
            `Trial ending soon for sub ${(event.data.object as Stripe.Subscription).id}`,
          )
          break
        default:
          this.logger.debug(`Unhandled Stripe event type: ${event.type}`)
      }
    } catch (err) {
      this.logger.error(`Failed to process ${event.type}: ${(err as Error).message}`)
      throw err
    }
    return { ok: true }
  }

  private async onCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const companyId = session.metadata?.['companyId']
    const planKey = session.metadata?.['planKey']
    const userId = session.metadata?.['userId']
    if (!companyId || !planKey) {
      this.logger.warn(`checkout.session.completed missing metadata: ${session.id}`)
      return
    }
    const plan = await this.subscriptions.findPlanByKey(planKey)
    const subscriptionId =
      typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
    const customerId =
      typeof session.customer === 'string' ? session.customer : session.customer?.id

    await this.prisma.system.subscription.upsert({
      where: { companyId },
      create: {
        companyId,
        planId: plan.id,
        status: 'ACTIVE',
        stripeCustomerId: customerId ?? null,
        stripeSubscriptionId: subscriptionId ?? null,
        createdBy: userId ?? null,
        updatedBy: userId ?? null,
      },
      update: {
        planId: plan.id,
        status: 'ACTIVE',
        cancelAtPeriodEnd: false,
        cancelledAt: null,
        ...(customerId ? { stripeCustomerId: customerId } : {}),
        ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
        ...(userId ? { updatedBy: userId } : {}),
      },
    })
    this.logger.log(`Subscription activated for company ${companyId} on plan ${planKey}`)
  }

  private async onSubscriptionUpserted(sub: Stripe.Subscription): Promise<void> {
    const companyId = sub.metadata?.['companyId']
    if (!companyId) {
      this.logger.warn(`Stripe subscription ${sub.id} has no companyId metadata`)
      return
    }
    const item = sub.items.data[0]
    const priceId = item?.price.id
    const interval = item?.price.recurring?.interval ?? null

    const status = mapStripeStatus(sub.status)
    const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id

    await this.prisma.system.subscription.updateMany({
      where: { companyId },
      data: {
        status,
        stripeCustomerId: customerId,
        stripeSubscriptionId: sub.id,
        stripePriceId: priceId ?? null,
        billingInterval: interval,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        currentPeriodStart: new Date(sub.current_period_start * 1000),
        currentPeriodEnd: new Date(sub.current_period_end * 1000),
        ...(sub.canceled_at ? { cancelledAt: new Date(sub.canceled_at * 1000) } : {}),
      },
    })
  }

  private async onSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
    const companyId = sub.metadata?.['companyId']
    if (!companyId) return
    await this.prisma.system.subscription.updateMany({
      where: { companyId },
      data: {
        status: 'CANCELLED',
        cancelledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : new Date(),
      },
    })
  }

  private async onInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    const subId =
      typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
    if (!subId) return
    await this.prisma.system.subscription.updateMany({
      where: { stripeSubscriptionId: subId },
      data: { status: 'ACTIVE' },
    })
  }

  private async onInvoiceFailed(invoice: Stripe.Invoice): Promise<void> {
    const subId =
      typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
    if (!subId) return
    await this.prisma.system.subscription.updateMany({
      where: { stripeSubscriptionId: subId },
      data: { status: 'PAST_DUE' },
    })
  }
}

function mapStripeStatus(
  s: Stripe.Subscription.Status,
): 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED' {
  switch (s) {
    case 'trialing':
      return 'TRIAL'
    case 'active':
      return 'ACTIVE'
    case 'past_due':
    case 'unpaid':
      return 'PAST_DUE'
    case 'canceled':
      return 'CANCELLED'
    case 'incomplete_expired':
      return 'EXPIRED'
    case 'incomplete':
    case 'paused':
    default:
      return 'PAST_DUE'
  }
}
