import {
  Controller,
  HttpCode,
  Logger,
  Param,
  Post,
  BadRequestException,
  RawBodyRequest,
  Req,
  Headers,
} from '@nestjs/common'
import type { Request } from 'express'
import { GatewayRegistryService } from './gateways/gateway-registry.service'
import { PaymentIntentService } from './payment-intent.service'
import { ManualPaymentService } from './manual-payment.service'
import { PrismaService } from '../../database/prisma.service'
import type { LocalGatewayCode } from './gateways/local-gateway.interface'

/**
 * Webhook receiver for local Iraqi gateways.
 *
 * Mounted under `/api/v1/billing/webhooks/{provider}` — public, signature-verified,
 * always 200 (errors logged) so providers don't retry forever. Idempotent via the
 * shared `webhook_events` table (reused from 4.2 Stripe).
 */
@Controller({ path: 'billing/webhooks', version: '1' })
export class LocalWebhookController {
  private readonly logger = new Logger(LocalWebhookController.name)

  constructor(
    private readonly gateways: GatewayRegistryService,
    private readonly intents: PaymentIntentService,
    private readonly manual: ManualPaymentService,
    private readonly prisma: PrismaService,
  ) {}

  @Post(':provider')
  @HttpCode(200)
  async handle(
    @Param('provider') provider: string,
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-signature') signature: string | undefined,
  ): Promise<{ received: true }> {
    if (!isGatewayCode(provider)) {
      throw new BadRequestException(`Unknown provider: ${provider}`)
    }
    const gateway = this.gateways.get(provider)
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}))

    if (!gateway.verifyWebhookSignature(rawBody, signature)) {
      throw new BadRequestException('Webhook signature verification failed')
    }

    const event = gateway.parseWebhookEvent(rawBody)
    if (!event) {
      this.logger.debug(`Ignoring unrecognized ${provider} webhook payload`)
      return { received: true }
    }

    // Idempotency via shared webhook_events table
    const existing = await this.prisma.system.webhookEvent.findUnique({
      where: {
        uniq_webhook_provider_event: { provider, eventId: event.eventId },
      },
    })
    if (existing) {
      this.logger.warn(`${provider} event ${event.eventId} already processed — skipping`)
      return { received: true }
    }

    await this.prisma.system.webhookEvent.create({
      data: {
        provider,
        eventId: event.eventId,
        eventType: event.eventType,
        payload: event.raw as object,
      },
    })

    try {
      const intent = await this.intents.findByProviderRef(provider, event.providerRef)
      if (!intent) {
        this.logger.warn(`${provider} webhook for unknown providerRef ${event.providerRef}`)
        return { received: true }
      }
      if (event.status === 'paid' && intent.status === 'PENDING') {
        await this.intents.transition(intent.id, 'PAID')
        await this.manual.activateSubscriptionFromIntent(intent.id)
      } else if (event.status === 'failed' && intent.status === 'PENDING') {
        await this.intents.transition(intent.id, 'FAILED')
      } else if (event.status === 'expired' && intent.status === 'PENDING') {
        await this.intents.transition(intent.id, 'EXPIRED')
      } else if (event.status === 'cancelled' && intent.status === 'PENDING') {
        await this.intents.transition(intent.id, 'CANCELLED')
      }
    } catch (err) {
      this.logger.error(
        `${provider} webhook handler error for event ${event.eventId}: ${(err as Error).message}`,
      )
    }

    return { received: true }
  }
}

function isGatewayCode(s: string): s is LocalGatewayCode {
  return s === 'fib' || s === 'zaincash' || s === 'fastpay'
}
