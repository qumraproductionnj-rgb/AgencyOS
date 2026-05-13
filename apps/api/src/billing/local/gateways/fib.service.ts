import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createHmac, timingSafeEqual } from 'node:crypto'
import type {
  CreateIntentInput,
  IntentResult,
  LocalGatewayCode,
  LocalPaymentGateway,
  NormalizedWebhookEvent,
  ProviderStatus,
} from './local-gateway.interface'
import type { Env } from '../../../config/env.validation'

interface FibTokenCache {
  token: string
  expiresAt: number
}

/**
 * FIB Payment Initiation API integration.
 *
 * Mock mode (LOCAL_GATEWAY_MOCK_MODE=true or no FIB_CLIENT_ID): returns deterministic
 * placeholder responses so the full intent → webhook → activation flow can be
 * developed and unit-tested without sandbox/live credentials.
 *
 * Sandbox testing: set FIB_BASE_URL=https://fib.stage.fib.iq + real FIB_CLIENT_ID/SECRET.
 */
@Injectable()
export class FibService implements LocalPaymentGateway {
  readonly code: LocalGatewayCode = 'fib'
  readonly isImplemented = true

  private readonly logger = new Logger(FibService.name)
  readonly mockMode: boolean
  private readonly baseUrl: string
  private readonly clientId: string | undefined
  private readonly clientSecret: string | undefined
  private readonly webhookSecret: string | undefined
  private tokenCache: FibTokenCache | null = null

  constructor(private readonly config: ConfigService<Env, true>) {
    const id = this.config.get('FIB_CLIENT_ID', { infer: true })
    const mock = this.config.get('LOCAL_GATEWAY_MOCK_MODE', { infer: true })
    this.mockMode = mock === true || !id
    this.baseUrl = this.config.get('FIB_BASE_URL', { infer: true })
    this.clientId = id
    this.clientSecret = this.config.get('FIB_CLIENT_SECRET', { infer: true })
    this.webhookSecret = this.config.get('FIB_WEBHOOK_SECRET', { infer: true })
    if (this.mockMode) {
      this.logger.warn('FibService running in MOCK mode — no real API calls will be made')
    }
  }

  async createPaymentIntent(input: CreateIntentInput): Promise<IntentResult> {
    if (this.mockMode) {
      const providerRef = `fib_mock_${input.intentId.slice(0, 8)}`
      return {
        providerRef,
        qrCode: this.mockQrDataUrl(providerRef),
        redirectUrl: `fib://payment?ref=${providerRef}`,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      }
    }

    const token = await this.getAccessToken()
    const res = await fetch(`${this.baseUrl}/protected/v1/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        monetaryValue: { amount: Number(input.amountFils) / 1000, currency: 'IQD' },
        statusCallbackUrl: input.callbackUrl,
        description: input.description,
        merchantReference: input.intentId,
      }),
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new BadRequestException(`FIB createPayment failed (${res.status}): ${text}`)
    }
    const data = (await res.json()) as {
      paymentId: string
      qrCode?: string
      readableCode?: string
      personalAppLink?: string
      validUntil?: string
    }
    return {
      providerRef: data.paymentId,
      qrCode: data.qrCode ?? null,
      redirectUrl: data.personalAppLink ?? null,
      expiresAt: data.validUntil ? new Date(data.validUntil) : null,
    }
  }

  async getPaymentStatus(providerRef: string): Promise<ProviderStatus> {
    if (this.mockMode) {
      // Deterministic: any ref ending in `_paid` returns paid; otherwise pending.
      // Tests can drive specific outcomes; production webhooks are authoritative anyway.
      if (providerRef.endsWith('_paid')) return 'paid'
      if (providerRef.endsWith('_failed')) return 'failed'
      return 'pending'
    }
    const token = await this.getAccessToken()
    const res = await fetch(`${this.baseUrl}/protected/v1/payments/${providerRef}/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) {
      throw new BadRequestException(`FIB getStatus failed (${res.status})`)
    }
    const data = (await res.json()) as { status: string }
    return mapFibStatus(data.status)
  }

  verifyWebhookSignature(payload: Buffer | string, signature: string | undefined): boolean {
    if (this.mockMode) return true
    if (!this.webhookSecret || !signature) return false
    const body = typeof payload === 'string' ? payload : payload.toString('utf8')
    const expected = createHmac('sha256', this.webhookSecret).update(body).digest('hex')
    try {
      const a = Buffer.from(expected, 'hex')
      const b = Buffer.from(signature, 'hex')
      return a.length === b.length && timingSafeEqual(a, b)
    } catch {
      return false
    }
  }

  parseWebhookEvent(payload: Buffer | string): NormalizedWebhookEvent | null {
    const body = typeof payload === 'string' ? payload : payload.toString('utf8')
    const data = JSON.parse(body) as {
      id?: string
      paymentId?: string
      status?: string
      eventType?: string
    }
    if (!data.paymentId || !data.status) return null
    return {
      providerRef: data.paymentId,
      status: mapFibStatus(data.status),
      eventId: data.id ?? `fib_${data.paymentId}_${data.status}`,
      eventType: data.eventType ?? `payment.${data.status.toLowerCase()}`,
      raw: data,
    }
  }

  private async getAccessToken(): Promise<string> {
    const now = Date.now()
    if (this.tokenCache && this.tokenCache.expiresAt > now + 30_000) {
      return this.tokenCache.token
    }
    if (!this.clientId || !this.clientSecret) {
      throw new BadRequestException('FIB credentials not configured')
    }
    const res = await fetch(
      `${this.baseUrl}/auth/realms/fib-online-shop/protocol/openid-connect/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }).toString(),
      },
    )
    if (!res.ok) {
      throw new BadRequestException(`FIB auth failed (${res.status})`)
    }
    const data = (await res.json()) as { access_token: string; expires_in: number }
    this.tokenCache = {
      token: data.access_token,
      expiresAt: now + data.expires_in * 1000,
    }
    return data.access_token
  }

  private mockQrDataUrl(ref: string): string {
    // A 1x1 transparent PNG with the ref encoded into the data URL fragment.
    // Real QR rendering happens client-side or via a real provider.
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lxKUAAAAASUVORK5CYII=#${ref}`
  }
}

function mapFibStatus(s: string): ProviderStatus {
  const up = s.toUpperCase()
  if (up === 'PAID' || up === 'COMPLETED' || up === 'SUCCESS') return 'paid'
  if (up === 'FAILED' || up === 'DECLINED') return 'failed'
  if (up === 'EXPIRED') return 'expired'
  if (up === 'CANCELLED' || up === 'CANCELED') return 'cancelled'
  return 'pending'
}
