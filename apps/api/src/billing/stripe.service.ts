import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Stripe from 'stripe'
import type { Env } from '../config/env.validation'

/**
 * Thin wrapper around the Stripe SDK with a built-in mock mode.
 *
 * Mock mode (STRIPE_MOCK_MODE=true or no STRIPE_SECRET_KEY) returns deterministic
 * placeholder responses so the full flow (checkout → webhook → DB update) can be
 * developed and unit-tested without real Stripe credentials. Webhook signature
 * verification in mock mode trusts the payload as-is.
 */
export interface NormalizedInvoice {
  id: string
  source: 'stripe' | 'iqd'
  amount: number
  currency: string
  status: string
  paidAt: Date | null
  hostedUrl: string | null
  pdfUrl: string | null
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name)
  private readonly client: Stripe | null
  readonly mockMode: boolean
  private readonly webhookSecret: string | undefined

  constructor(private readonly config: ConfigService<Env, true>) {
    const apiKey = this.config.get('STRIPE_SECRET_KEY', { infer: true })
    const mockEnv = this.config.get('STRIPE_MOCK_MODE', { infer: true })
    this.mockMode = mockEnv === true || !apiKey
    this.webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET', { infer: true })

    if (this.mockMode) {
      this.client = null
      this.logger.warn('StripeService running in MOCK mode — no real Stripe calls will be made')
    } else {
      this.client = new Stripe(apiKey!, {
        apiVersion: this.config.get('STRIPE_API_VERSION', {
          infer: true,
        }) as Stripe.LatestApiVersion,
      })
    }
  }

  /** Create or retrieve a Stripe customer for the company. Returns the Stripe customer ID. */
  async ensureCustomer(params: {
    companyId: string
    email: string
    name: string
    existingStripeCustomerId?: string | null
  }): Promise<string> {
    if (params.existingStripeCustomerId) return params.existingStripeCustomerId

    if (this.mockMode) {
      return `cus_mock_${params.companyId.slice(0, 16).replace(/-/g, '')}`
    }

    const customer = await this.client!.customers.create({
      email: params.email,
      name: params.name,
      metadata: { companyId: params.companyId },
    })
    return customer.id
  }

  /** Create a Checkout Session for a subscription purchase. */
  async createCheckoutSession(params: {
    customerId: string
    priceId: string
    companyId: string
    userId: string
    planKey: string
    successUrl: string
    cancelUrl: string
  }): Promise<{ id: string; url: string }> {
    if (this.mockMode) {
      const id = `cs_mock_${Date.now()}_${params.planKey}`
      const url = `${params.successUrl.replace('{CHECKOUT_SESSION_ID}', id)}&mock=true`
      this.logger.log(`[MOCK] Checkout session created: ${id} for plan=${params.planKey}`)
      return { id, url }
    }

    const session = await this.client!.checkout.sessions.create({
      mode: 'subscription',
      customer: params.customerId,
      line_items: [{ price: params.priceId, quantity: 1 }],
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
      metadata: {
        companyId: params.companyId,
        userId: params.userId,
        planKey: params.planKey,
      },
      subscription_data: {
        metadata: {
          companyId: params.companyId,
          planKey: params.planKey,
        },
      },
    })
    if (!session.url) throw new BadRequestException('Stripe did not return a checkout URL')
    return { id: session.id, url: session.url }
  }

  /** Create a Billing Portal session (manage payment methods, invoices, cancel). */
  async createBillingPortalSession(params: {
    customerId: string
    returnUrl: string
  }): Promise<{ url: string }> {
    if (this.mockMode) {
      this.logger.log(`[MOCK] Billing portal session for customer=${params.customerId}`)
      return { url: `${params.returnUrl}?mock_portal=true` }
    }
    const session = await this.client!.billingPortal.sessions.create({
      customer: params.customerId,
      return_url: params.returnUrl,
    })
    return { url: session.url }
  }

  /** Change subscription plan by swapping the price item. Prorations applied automatically. */
  async updateSubscriptionPrice(params: {
    stripeSubscriptionId: string
    newPriceId: string
  }): Promise<Stripe.Subscription | { id: string; mock: true }> {
    if (this.mockMode) {
      this.logger.log(
        `[MOCK] Update sub ${params.stripeSubscriptionId} -> price ${params.newPriceId}`,
      )
      return { id: params.stripeSubscriptionId, mock: true }
    }
    const sub = await this.client!.subscriptions.retrieve(params.stripeSubscriptionId)
    return this.client!.subscriptions.update(params.stripeSubscriptionId, {
      items: [
        {
          id: sub.items.data[0]!.id,
          price: params.newPriceId,
        },
      ],
      proration_behavior: 'create_prorations',
    })
  }

  /** Cancel a subscription at period end (recommended) or immediately. */
  async cancelSubscription(params: {
    stripeSubscriptionId: string
    atPeriodEnd: boolean
  }): Promise<Stripe.Subscription | { id: string; mock: true }> {
    if (this.mockMode) {
      this.logger.log(
        `[MOCK] Cancel sub ${params.stripeSubscriptionId} atPeriodEnd=${params.atPeriodEnd}`,
      )
      return { id: params.stripeSubscriptionId, mock: true }
    }
    if (params.atPeriodEnd) {
      return this.client!.subscriptions.update(params.stripeSubscriptionId, {
        cancel_at_period_end: true,
      })
    }
    return this.client!.subscriptions.cancel(params.stripeSubscriptionId)
  }

  /** List recent invoices for a customer. Returns normalized shape. */
  async listInvoices(customerId: string, limit = 20): Promise<NormalizedInvoice[]> {
    if (this.mockMode) {
      return [
        {
          id: `in_mock_${customerId.slice(-6)}_1`,
          source: 'stripe',
          amount: 4900,
          currency: 'usd',
          status: 'paid',
          paidAt: new Date(Date.now() - 30 * 86400000),
          hostedUrl: null,
          pdfUrl: null,
        },
      ]
    }
    const res = await this.client!.invoices.list({ customer: customerId, limit })
    return res.data.map((inv) => ({
      id: inv.id,
      source: 'stripe' as const,
      amount: inv.amount_paid ?? inv.amount_due,
      currency: inv.currency,
      status: inv.status ?? 'open',
      paidAt: inv.status_transitions?.paid_at
        ? new Date(inv.status_transitions.paid_at * 1000)
        : null,
      hostedUrl: inv.hosted_invoice_url ?? null,
      pdfUrl: inv.invoice_pdf ?? null,
    }))
  }

  /**
   * Verify a Stripe webhook signature and parse the event.
   * In mock mode, JSON-parses the body and returns it (used for local CLI testing without secret).
   */
  constructEvent(rawBody: Buffer | string, signature: string | undefined): Stripe.Event {
    if (this.mockMode) {
      const json = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8')
      const event = JSON.parse(json) as Stripe.Event
      if (!event.id || !event.type) {
        throw new BadRequestException('Mock webhook payload missing id/type')
      }
      return event
    }
    if (!this.webhookSecret) {
      throw new BadRequestException('STRIPE_WEBHOOK_SECRET not configured')
    }
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header')
    }
    try {
      return this.client!.webhooks.constructEvent(rawBody, signature, this.webhookSecret)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid signature'
      throw new BadRequestException(`Webhook signature verification failed: ${message}`)
    }
  }
}
