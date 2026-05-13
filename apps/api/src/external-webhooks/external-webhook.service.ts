import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { createHmac, randomBytes } from 'node:crypto'
import { PrismaService } from '../database/prisma.service'

const RETRY_DELAYS_MIN = [1, 5, 30, 120, 360] // exponential-ish: 1m, 5m, 30m, 2h, 6h

@Injectable()
export class ExternalWebhookService {
  private readonly logger = new Logger(ExternalWebhookService.name)

  constructor(private readonly prisma: PrismaService) {}

  async list(companyId: string) {
    return this.prisma.tenant.webhookSubscription.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(input: { companyId: string; userId: string; url: string; events: string[] }) {
    if (!/^https?:\/\//.test(input.url)) {
      throw new BadRequestException('URL must start with http(s)://')
    }
    return this.prisma.tenant.webhookSubscription.create({
      data: {
        companyId: input.companyId,
        url: input.url,
        events: input.events,
        secret: randomBytes(32).toString('hex'),
        createdBy: input.userId,
        updatedBy: input.userId,
      },
    })
  }

  async update(input: {
    companyId: string
    id: string
    userId: string
    url?: string
    events?: string[]
    isActive?: boolean
  }) {
    const existing = await this.prisma.tenant.webhookSubscription.findFirst({
      where: { id: input.id, companyId: input.companyId, deletedAt: null },
    })
    if (!existing) throw new NotFoundException('Webhook subscription not found')
    return this.prisma.tenant.webhookSubscription.update({
      where: { id: input.id },
      data: {
        ...(input.url !== undefined ? { url: input.url } : {}),
        ...(input.events !== undefined ? { events: input.events } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        updatedBy: input.userId,
      },
    })
  }

  async remove(companyId: string, id: string, userId: string) {
    return this.prisma.tenant.webhookSubscription.updateMany({
      where: { id, companyId, deletedAt: null },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
  }

  async rotateSecret(companyId: string, id: string, userId: string) {
    const sub = await this.prisma.tenant.webhookSubscription.findFirst({
      where: { id, companyId, deletedAt: null },
    })
    if (!sub) throw new NotFoundException('Webhook subscription not found')
    return this.prisma.tenant.webhookSubscription.update({
      where: { id },
      data: { secret: randomBytes(32).toString('hex'), updatedBy: userId },
    })
  }

  async deliveries(companyId: string, id: string, limit = 50) {
    const sub = await this.prisma.tenant.webhookSubscription.findFirst({
      where: { id, companyId, deletedAt: null },
    })
    if (!sub) throw new NotFoundException('Webhook subscription not found')
    return this.prisma.tenant.webhookDelivery.findMany({
      where: { subscriptionId: id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }

  /**
   * Fan out an event to all matching active subscriptions for a company.
   * Called by event emitters (e.g., InvoiceService on paid).
   */
  async dispatch(
    companyId: string,
    eventType: string,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const subs = await this.prisma.system.webhookSubscription.findMany({
      where: { companyId, isActive: true, deletedAt: null },
    })
    const matching = subs.filter((s) => s.events.includes('*') || s.events.includes(eventType))
    for (const sub of matching) {
      try {
        await this.attemptDelivery(sub.id, sub.url, sub.secret, eventType, payload, 1)
      } catch (err) {
        this.logger.warn(`Webhook ${sub.id} dispatch error: ${(err as Error).message}`)
      }
    }
  }

  /** Internal — single delivery attempt with HMAC-SHA256 signature. */
  async attemptDelivery(
    subscriptionId: string,
    url: string,
    secret: string,
    eventType: string,
    payload: Record<string, unknown>,
    attempt: number,
  ): Promise<void> {
    const body = JSON.stringify({ event: eventType, data: payload, attempt })
    const signature = createHmac('sha256', secret).update(body).digest('hex')
    let statusCode: number | null = null
    let responseBody = ''
    let errorMessage: string | null = null
    let succeeded = false
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-AgencyOS-Event': eventType,
          'X-AgencyOS-Signature': signature,
          'X-AgencyOS-Attempt': String(attempt),
        },
        body,
        signal: AbortSignal.timeout(10000),
      })
      statusCode = res.status
      responseBody = (await res.text().catch(() => '')).slice(0, 2000)
      succeeded = res.ok
    } catch (err) {
      errorMessage = (err as Error).message
    }

    const nextRetry =
      !succeeded && attempt <= RETRY_DELAYS_MIN.length
        ? new Date(Date.now() + RETRY_DELAYS_MIN[attempt - 1]! * 60 * 1000)
        : null

    await this.prisma.system.webhookDelivery.create({
      data: {
        subscriptionId,
        eventType,
        payload: payload as never,
        attempt,
        statusCode,
        responseBody,
        errorMessage,
        succeeded,
        deliveredAt: succeeded ? new Date() : null,
        nextRetryAt: nextRetry,
      },
    })

    await this.prisma.system.webhookSubscription.update({
      where: { id: subscriptionId },
      data: {
        lastDeliveryAt: new Date(),
        lastDeliveryStatus: succeeded
          ? `${statusCode ?? 'OK'}`
          : (errorMessage ?? `${statusCode ?? 'fail'}`),
        failureCount: succeeded ? 0 : { increment: 1 },
      },
    })
  }

  /** Cron-driven retry sweep — picks up failed deliveries with elapsed nextRetryAt. */
  async retryPending(): Promise<number> {
    const now = new Date()
    const pending = await this.prisma.system.webhookDelivery.findMany({
      where: { succeeded: false, nextRetryAt: { lte: now } },
      include: { subscription: true },
      take: 50,
    })
    for (const d of pending) {
      if (d.attempt > RETRY_DELAYS_MIN.length) continue
      // Mark old delivery so we don't pick it again
      await this.prisma.system.webhookDelivery.update({
        where: { id: d.id },
        data: { nextRetryAt: null },
      })
      const payload = d.payload as Record<string, unknown>
      await this.attemptDelivery(
        d.subscriptionId,
        d.subscription.url,
        d.subscription.secret,
        d.eventType,
        payload,
        d.attempt + 1,
      )
    }
    return pending.length
  }
}
