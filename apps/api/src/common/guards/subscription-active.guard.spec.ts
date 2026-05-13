import { Test } from '@nestjs/testing'
import { ExecutionContext, ForbiddenException } from '@nestjs/common'
import { SubscriptionActiveGuard } from './subscription-active.guard'
import { PrismaService } from '../../database/prisma.service'

function mockContext(
  req: Partial<Request> & { user?: unknown; method?: string; originalUrl?: string },
): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ method: 'GET', originalUrl: '/api/v1/foo', ...req }),
    }),
  } as unknown as ExecutionContext
}

describe('SubscriptionActiveGuard', () => {
  let guard: SubscriptionActiveGuard
  const findUnique = jest.fn()

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SubscriptionActiveGuard,
        {
          provide: PrismaService,
          useValue: { system: { subscription: { findUnique } } },
        },
      ],
    }).compile()
    guard = module.get(SubscriptionActiveGuard)
    findUnique.mockReset()
  })

  it('passes through requests with no user (handled elsewhere)', async () => {
    const result = await guard.canActivate(mockContext({}))
    expect(result).toBe(true)
  })

  it('passes through non-TENANT tiers (platform admin, external)', async () => {
    const result = await guard.canActivate(
      mockContext({ user: { tier: 'PLATFORM_ADMIN', companyId: 'c1' } }),
    )
    expect(result).toBe(true)
  })

  it('always allows billing paths even when read-only', async () => {
    findUnique.mockResolvedValue({ status: 'READ_ONLY' })
    const result = await guard.canActivate(
      mockContext({
        user: { tier: 'TENANT', companyId: 'c1' },
        method: 'POST',
        originalUrl: '/api/v1/billing/checkout-session',
      }),
    )
    expect(result).toBe(true)
    expect(findUnique).not.toHaveBeenCalled()
  })

  it('allows GET on READ_ONLY tenants but blocks POST', async () => {
    findUnique.mockResolvedValue({ status: 'READ_ONLY' })
    await expect(
      guard.canActivate(
        mockContext({
          user: { tier: 'TENANT', companyId: 'c1' },
          method: 'GET',
          originalUrl: '/api/v1/clients',
        }),
      ),
    ).resolves.toBe(true)
    await expect(
      guard.canActivate(
        mockContext({
          user: { tier: 'TENANT', companyId: 'c1' },
          method: 'POST',
          originalUrl: '/api/v1/clients',
        }),
      ),
    ).rejects.toThrow(ForbiddenException)
  })

  it('blocks all requests for SUSPENDED tenants', async () => {
    findUnique.mockResolvedValue({ status: 'SUSPENDED' })
    await expect(
      guard.canActivate(
        mockContext({
          user: { tier: 'TENANT', companyId: 'c1' },
          method: 'GET',
          originalUrl: '/api/v1/clients',
        }),
      ),
    ).rejects.toThrow(ForbiddenException)
  })

  it('allows ACTIVE tenants through', async () => {
    findUnique.mockResolvedValue({ status: 'ACTIVE' })
    await expect(
      guard.canActivate(
        mockContext({
          user: { tier: 'TENANT', companyId: 'c1' },
          method: 'POST',
          originalUrl: '/api/v1/clients',
        }),
      ),
    ).resolves.toBe(true)
  })

  it('passes through when no subscription exists yet', async () => {
    findUnique.mockResolvedValue(null)
    await expect(
      guard.canActivate(
        mockContext({
          user: { tier: 'TENANT', companyId: 'c1' },
          method: 'POST',
          originalUrl: '/api/v1/clients',
        }),
      ),
    ).resolves.toBe(true)
  })
})
