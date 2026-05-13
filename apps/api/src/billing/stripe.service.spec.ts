import { Test } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'
import { BadRequestException } from '@nestjs/common'
import { StripeService } from './stripe.service'

function mockConfig(overrides: Record<string, unknown> = {}) {
  const defaults: Record<string, unknown> = {
    STRIPE_SECRET_KEY: undefined,
    STRIPE_WEBHOOK_SECRET: undefined,
    STRIPE_MOCK_MODE: true,
    STRIPE_API_VERSION: '2024-11-20.acacia',
  }
  return {
    get: jest.fn((key: string) => (key in overrides ? overrides[key] : defaults[key])),
  }
}

describe('StripeService (mock mode)', () => {
  let service: StripeService

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [StripeService, { provide: ConfigService, useValue: mockConfig() }],
    }).compile()
    service = module.get(StripeService)
  })

  it('runs in mock mode when no secret key is set', () => {
    expect(service.mockMode).toBe(true)
  })

  describe('ensureCustomer', () => {
    it('returns existing customer ID when provided', async () => {
      const id = await service.ensureCustomer({
        companyId: 'c1',
        email: 'a@b.com',
        name: 'A',
        existingStripeCustomerId: 'cus_existing_123',
      })
      expect(id).toBe('cus_existing_123')
    })

    it('returns a deterministic mock customer ID', async () => {
      const id = await service.ensureCustomer({
        companyId: 'abcdef12-3456-7890-abcd-ef1234567890',
        email: 'a@b.com',
        name: 'A',
      })
      expect(id).toMatch(/^cus_mock_/)
    })
  })

  describe('createCheckoutSession', () => {
    it('returns a mock session URL with placeholder substituted', async () => {
      const res = await service.createCheckoutSession({
        customerId: 'cus_mock_x',
        priceId: 'price_pro_monthly',
        companyId: 'c1',
        userId: 'u1',
        planKey: 'professional',
        successUrl: 'http://localhost:3000/return?status=success&session_id={CHECKOUT_SESSION_ID}',
        cancelUrl: 'http://localhost:3000/cancel',
      })
      expect(res.id).toMatch(/^cs_mock_/)
      expect(res.url).toContain('mock=true')
      expect(res.url).not.toContain('{CHECKOUT_SESSION_ID}')
    })
  })

  describe('createBillingPortalSession', () => {
    it('returns a return URL marked as mock', async () => {
      const res = await service.createBillingPortalSession({
        customerId: 'cus_mock_x',
        returnUrl: 'http://localhost:3000/settings/billing',
      })
      expect(res.url).toContain('mock_portal=true')
    })
  })

  describe('updateSubscriptionPrice', () => {
    it('returns a mock object in mock mode', async () => {
      const res = await service.updateSubscriptionPrice({
        stripeSubscriptionId: 'sub_x',
        newPriceId: 'price_y',
      })
      expect(res).toMatchObject({ id: 'sub_x', mock: true })
    })
  })

  describe('cancelSubscription', () => {
    it('cancels at period end in mock mode', async () => {
      const res = await service.cancelSubscription({
        stripeSubscriptionId: 'sub_x',
        atPeriodEnd: true,
      })
      expect(res).toMatchObject({ id: 'sub_x', mock: true })
    })

    it('cancels immediately in mock mode', async () => {
      const res = await service.cancelSubscription({
        stripeSubscriptionId: 'sub_x',
        atPeriodEnd: false,
      })
      expect(res).toMatchObject({ id: 'sub_x', mock: true })
    })
  })

  describe('constructEvent', () => {
    it('parses JSON payload in mock mode', () => {
      const payload = JSON.stringify({
        id: 'evt_mock_1',
        type: 'checkout.session.completed',
        data: { object: {} },
      })
      const event = service.constructEvent(payload, undefined)
      expect(event.id).toBe('evt_mock_1')
      expect(event.type).toBe('checkout.session.completed')
    })

    it('throws when mock payload is missing id/type', () => {
      const payload = JSON.stringify({ foo: 'bar' })
      expect(() => service.constructEvent(payload, undefined)).toThrow(BadRequestException)
    })
  })
})

describe('StripeService (live mode signature verification)', () => {
  it('throws when webhook secret is missing in live mode', async () => {
    const module = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: ConfigService,
          useValue: mockConfig({
            STRIPE_SECRET_KEY: 'sk_test_dummy',
            STRIPE_MOCK_MODE: false,
            STRIPE_WEBHOOK_SECRET: undefined,
          }),
        },
      ],
    }).compile()
    const service = module.get(StripeService)
    expect(service.mockMode).toBe(false)
    expect(() => service.constructEvent('{}', 't=1,v1=abc')).toThrow(BadRequestException)
  })

  it('throws when stripe-signature header is missing', async () => {
    const module = await Test.createTestingModule({
      providers: [
        StripeService,
        {
          provide: ConfigService,
          useValue: mockConfig({
            STRIPE_SECRET_KEY: 'sk_test_dummy',
            STRIPE_MOCK_MODE: false,
            STRIPE_WEBHOOK_SECRET: 'whsec_dummy',
          }),
        },
      ],
    }).compile()
    const service = module.get(StripeService)
    expect(() => service.constructEvent('{}', undefined)).toThrow(BadRequestException)
  })
})
