import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { FibService } from './fib.service'

function mockConfig(overrides: Record<string, unknown> = {}) {
  const defaults: Record<string, unknown> = {
    FIB_CLIENT_ID: undefined,
    FIB_CLIENT_SECRET: undefined,
    FIB_WEBHOOK_SECRET: undefined,
    LOCAL_GATEWAY_MOCK_MODE: true,
    FIB_BASE_URL: 'https://fib.stage.fib.iq',
    FIB_CURRENCY_CODE: 'IQD',
  }
  return {
    get: jest.fn((key: string) => (key in overrides ? overrides[key] : defaults[key])),
  }
}

describe('FibService (mock mode)', () => {
  let service: FibService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [FibService, { provide: ConfigService, useValue: mockConfig() }],
    }).compile()
    service = module.get(FibService)
  })

  it('reports mockMode=true when no credentials are set', () => {
    expect(service.mockMode).toBe(true)
  })

  it('exposes code=fib and isImplemented=true', () => {
    expect(service.code).toBe('fib')
    expect(service.isImplemented).toBe(true)
  })

  describe('createPaymentIntent', () => {
    it('returns deterministic providerRef + qr + redirect + expiry in mock mode', async () => {
      const res = await service.createPaymentIntent({
        intentId: 'abcdef12-3456-7890-abcd-ef1234567890',
        amountFils: 65000n,
        description: 'AgencyOS Professional (monthly)',
        callbackUrl: 'http://localhost:3001/api/v1/billing/webhooks/fib',
      })
      expect(res.providerRef).toMatch(/^fib_mock_/)
      expect(res.qrCode).toContain('data:image/png;base64')
      expect(res.redirectUrl).toContain('fib://payment?ref=')
      expect(res.expiresAt).toBeInstanceOf(Date)
    })
  })

  describe('getPaymentStatus', () => {
    it('returns "paid" for refs ending in _paid', async () => {
      expect(await service.getPaymentStatus('fib_mock_xyz_paid')).toBe('paid')
    })
    it('returns "failed" for refs ending in _failed', async () => {
      expect(await service.getPaymentStatus('fib_mock_xyz_failed')).toBe('failed')
    })
    it('returns "pending" otherwise', async () => {
      expect(await service.getPaymentStatus('fib_mock_abc')).toBe('pending')
    })
  })

  describe('verifyWebhookSignature', () => {
    it('always accepts in mock mode', () => {
      expect(service.verifyWebhookSignature('any', 'any-sig')).toBe(true)
    })
  })

  describe('parseWebhookEvent', () => {
    it('parses normalized event from FIB payload', () => {
      const payload = JSON.stringify({
        id: 'evt_1',
        paymentId: 'fib_mock_xxx',
        status: 'PAID',
        eventType: 'payment.paid',
      })
      const event = service.parseWebhookEvent(payload)
      expect(event).not.toBeNull()
      expect(event?.providerRef).toBe('fib_mock_xxx')
      expect(event?.status).toBe('paid')
      expect(event?.eventId).toBe('evt_1')
    })

    it('returns null for payload missing paymentId or status', () => {
      expect(service.parseWebhookEvent(JSON.stringify({ foo: 'bar' }))).toBeNull()
    })

    it('maps DECLINED → failed', () => {
      const event = service.parseWebhookEvent(
        JSON.stringify({ paymentId: 'p', status: 'DECLINED' }),
      )
      expect(event?.status).toBe('failed')
    })

    it('maps EXPIRED → expired', () => {
      const event = service.parseWebhookEvent(JSON.stringify({ paymentId: 'p', status: 'EXPIRED' }))
      expect(event?.status).toBe('expired')
    })
  })
})

describe('FibService (live mode signature verification)', () => {
  it('rejects when no secret or no signature is provided', async () => {
    const module = await Test.createTestingModule({
      providers: [
        FibService,
        {
          provide: ConfigService,
          useValue: mockConfig({
            FIB_CLIENT_ID: 'cid',
            FIB_CLIENT_SECRET: 'csec',
            LOCAL_GATEWAY_MOCK_MODE: false,
            FIB_WEBHOOK_SECRET: undefined,
          }),
        },
      ],
    }).compile()
    const service = module.get(FibService)
    expect(service.mockMode).toBe(false)
    expect(service.verifyWebhookSignature('{}', 'sig')).toBe(false)
    expect(service.verifyWebhookSignature('{}', undefined)).toBe(false)
  })

  it('verifies HMAC-SHA256 signature against shared secret', async () => {
    const module = await Test.createTestingModule({
      providers: [
        FibService,
        {
          provide: ConfigService,
          useValue: mockConfig({
            FIB_CLIENT_ID: 'cid',
            FIB_CLIENT_SECRET: 'csec',
            LOCAL_GATEWAY_MOCK_MODE: false,
            FIB_WEBHOOK_SECRET: 'wsec',
          }),
        },
      ],
    }).compile()
    const service = module.get(FibService)
    const payload = JSON.stringify({ paymentId: 'p', status: 'PAID' })
    const { createHmac } = await import('node:crypto')
    const goodSig = createHmac('sha256', 'wsec').update(payload).digest('hex')
    expect(service.verifyWebhookSignature(payload, goodSig)).toBe(true)
    expect(service.verifyWebhookSignature(payload, 'deadbeef')).toBe(false)
  })
})
