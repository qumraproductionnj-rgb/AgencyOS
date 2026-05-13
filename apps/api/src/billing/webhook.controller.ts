import { Controller, HttpCode, Logger, Post, RawBodyRequest, Req, Headers } from '@nestjs/common'
import type { Request } from 'express'
import { BillingService } from './billing.service'
import { StripeService } from './stripe.service'

/**
 * Stripe webhook receiver.
 *
 * Mounted under `/api/v1/billing/webhooks/stripe` (raw-body required for signature verification).
 * Always returns 200 after persisting the event — even if a handler throws — so Stripe doesn't
 * retry indefinitely on transient errors. Errors are surfaced via logs + the webhook_events
 * audit row remains for replay.
 */
@Controller({ path: 'billing/webhooks', version: '1' })
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name)

  constructor(
    private readonly stripe: StripeService,
    private readonly billing: BillingService,
  ) {}

  @Post('stripe')
  @HttpCode(200)
  async handleStripe(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ): Promise<{ received: true }> {
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}))
    const event = this.stripe.constructEvent(rawBody, signature)
    try {
      await this.billing.handleWebhook(event)
    } catch (err) {
      this.logger.error(
        `Stripe webhook handler error for ${event.id} (${event.type}): ${(err as Error).message}`,
      )
    }
    return { received: true }
  }
}
