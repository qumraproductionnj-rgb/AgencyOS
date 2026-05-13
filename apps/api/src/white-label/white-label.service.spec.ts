import { Test } from '@nestjs/testing'
import { BadRequestException, ForbiddenException } from '@nestjs/common'
import { WhiteLabelService } from './white-label.service'
import { PrismaService } from '../database/prisma.service'
import { SubscriptionService } from '../subscriptions/subscription.service'

function mockPrisma() {
  return {
    system: {
      company: { findUnique: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
    },
  }
}
const mockSubs = { requireFeatureAccess: jest.fn() }

describe('WhiteLabelService', () => {
  let service: WhiteLabelService
  let prisma: ReturnType<typeof mockPrisma>

  beforeEach(async () => {
    prisma = mockPrisma()
    jest.clearAllMocks()
    const module = await Test.createTestingModule({
      providers: [
        WhiteLabelService,
        { provide: PrismaService, useValue: prisma },
        { provide: SubscriptionService, useValue: mockSubs },
      ],
    }).compile()
    service = module.get(WhiteLabelService)
  })

  it('rejects invalid hex color', async () => {
    await expect(
      service.update({ companyId: 'c1', userId: 'u', brandPrimaryColor: 'red' }),
    ).rejects.toThrow(BadRequestException)
  })

  it('rejects invalid subdomain (uppercase / underscore)', async () => {
    await expect(
      service.update({ companyId: 'c1', userId: 'u', customSubdomain: 'My_Brand' }),
    ).rejects.toThrow(BadRequestException)
  })

  it('rejects subdomain already taken by another tenant', async () => {
    prisma.system.company.findFirst.mockResolvedValue({ id: 'c2' })
    await expect(
      service.update({ companyId: 'c1', userId: 'u', customSubdomain: 'ruya' }),
    ).rejects.toThrow(ForbiddenException)
  })

  it('allows valid update and gates on feature flag', async () => {
    prisma.system.company.findFirst.mockResolvedValue(null)
    prisma.system.company.update.mockResolvedValue({ id: 'c1' })
    await service.update({
      companyId: 'c1',
      userId: 'u',
      customSubdomain: 'ruya',
      brandPrimaryColor: '#1A2B3C',
      hidePoweredBy: true,
    })
    expect(mockSubs.requireFeatureAccess).toHaveBeenCalledWith(
      'c1',
      'whiteLabel',
      'White-label branding',
    )
    const arg = prisma.system.company.update.mock.calls[0]![0]
    expect(arg.data.customSubdomain).toBe('ruya')
    expect(arg.data.hidePoweredBy).toBe(true)
  })

  it('resolveByHost matches custom domain or subdomain', async () => {
    prisma.system.company.findFirst.mockResolvedValue({ id: 'c1' })
    await service.resolveByHost('ruya.agencyos.app')
    const where = prisma.system.company.findFirst.mock.calls[0]![0].where
    expect(where.OR[0].customDomain).toBe('ruya.agencyos.app')
    expect(where.OR[1].customSubdomain).toBe('ruya')
  })
})
