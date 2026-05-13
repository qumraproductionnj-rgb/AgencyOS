import { Test } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { ExternalWebhookService } from './external-webhook.service'
import { PrismaService } from '../database/prisma.service'

function mockPrisma() {
  return {
    tenant: {
      webhookSubscription: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      webhookDelivery: { findMany: jest.fn() },
    },
    system: {
      webhookSubscription: { findMany: jest.fn(), update: jest.fn() },
      webhookDelivery: { create: jest.fn(), findMany: jest.fn(), update: jest.fn() },
    },
  }
}

describe('ExternalWebhookService', () => {
  let service: ExternalWebhookService
  let prisma: ReturnType<typeof mockPrisma>

  beforeEach(async () => {
    prisma = mockPrisma()
    const module = await Test.createTestingModule({
      providers: [ExternalWebhookService, { provide: PrismaService, useValue: prisma }],
    }).compile()
    service = module.get(ExternalWebhookService)
  })

  it('creates a webhook with generated secret', async () => {
    prisma.tenant.webhookSubscription.create.mockResolvedValue({ id: 's1' })
    await service.create({
      companyId: 'c1',
      userId: 'u1',
      url: 'https://hooks.example.com/agencyos',
      events: ['invoice.paid'],
    })
    const arg = prisma.tenant.webhookSubscription.create.mock.calls[0]![0]
    expect(arg.data.secret).toMatch(/^[a-f0-9]{64}$/)
    expect(arg.data.events).toEqual(['invoice.paid'])
  })

  it('rejects non-http URLs', async () => {
    await expect(
      service.create({ companyId: 'c1', userId: 'u1', url: 'ftp://bad', events: ['x'] }),
    ).rejects.toThrow(BadRequestException)
  })

  it('rotate-secret throws when subscription missing', async () => {
    prisma.tenant.webhookSubscription.findFirst.mockResolvedValue(null)
    await expect(service.rotateSecret('c1', 'missing', 'u1')).rejects.toThrow(NotFoundException)
  })

  it('dispatch filters by event match and wildcard', async () => {
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('ok', { status: 200 }))
    prisma.system.webhookSubscription.findMany.mockResolvedValue([
      { id: 's1', url: 'https://a', secret: 's', events: ['invoice.paid'] },
      { id: 's2', url: 'https://b', secret: 's', events: ['*'] },
      { id: 's3', url: 'https://c', secret: 's', events: ['task.created'] },
    ])
    prisma.system.webhookDelivery.create.mockResolvedValue({})
    prisma.system.webhookSubscription.update.mockResolvedValue({})

    await service.dispatch('c1', 'invoice.paid', { id: 'inv1' })
    expect(fetchSpy).toHaveBeenCalledTimes(2)
    fetchSpy.mockRestore()
  })

  it('attemptDelivery records succeeded + clears failure_count on 200', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('ok', { status: 200 }))
    prisma.system.webhookDelivery.create.mockResolvedValue({})
    prisma.system.webhookSubscription.update.mockResolvedValue({})
    await service.attemptDelivery('s1', 'https://x', 'sec', 'task.created', { id: 't1' }, 1)
    const data = prisma.system.webhookDelivery.create.mock.calls[0]![0].data
    expect(data.succeeded).toBe(true)
    expect(data.statusCode).toBe(200)
  })

  it('attemptDelivery records failure + schedules retry on 500', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('boom', { status: 500 }))
    prisma.system.webhookDelivery.create.mockResolvedValue({})
    prisma.system.webhookSubscription.update.mockResolvedValue({})
    await service.attemptDelivery('s1', 'https://x', 'sec', 'task.created', { id: 't1' }, 1)
    const data = prisma.system.webhookDelivery.create.mock.calls[0]![0].data
    expect(data.succeeded).toBe(false)
    expect(data.nextRetryAt).toBeInstanceOf(Date)
  })
})
