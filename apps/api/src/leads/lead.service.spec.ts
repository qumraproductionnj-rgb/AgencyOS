import { Test, type TestingModule } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { LeadService } from './lead.service'
import { PrismaService } from '../database/prisma.service'

describe('LeadService', () => {
  let service: LeadService
  const lead: Record<string, jest.Mock> = {}
  const client: Record<string, jest.Mock> = {}
  const deal: Record<string, jest.Mock> = {}

  const mockLead = {
    id: 'lead-1',
    companyId: 'company-1',
    name: 'أحمد العلواني',
    companyName: 'شركة بغداد',
    email: 'ahmed@test.com',
    phone: '+964771234567',
    source: 'موقع التواصل',
    status: 'NEW',
    notes: 'مهتم',
    convertedAt: null,
    convertedToClientId: null,
    convertedToDealId: null,
    assignee: null,
    deals: [],
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    lead['findMany'] = jest.fn()
    lead['findFirst'] = jest.fn()
    lead['create'] = jest.fn()
    lead['update'] = jest.fn()
    client['create'] = jest.fn()
    deal['create'] = jest.fn()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadService,
        {
          provide: PrismaService,
          useValue: {
            tenant: { lead, client, deal },
          },
        },
      ],
    }).compile()

    service = module.get<LeadService>(LeadService)
  })

  const m = (obj: Record<string, jest.Mock>, key: string) => obj[key]!

  describe('findAll', () => {
    it('returns leads', async () => {
      m(lead, 'findMany').mockResolvedValue([mockLead])
      const result = await service.findAll('company-1')
      expect(result).toHaveLength(1)
    })

    it('filters by status', async () => {
      m(lead, 'findMany').mockResolvedValue([])
      await service.findAll('company-1', { status: 'NEW' })
      expect(m(lead, 'findMany')).toHaveBeenCalled()
    })

    it('searches by name', async () => {
      m(lead, 'findMany').mockResolvedValue([])
      await service.findAll('company-1', { search: 'أحمد' })
      expect(m(lead, 'findMany')).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('returns a lead by id', async () => {
      m(lead, 'findFirst').mockResolvedValue(mockLead)
      const result = await service.findOne('company-1', 'lead-1')
      expect(result).toBeDefined()
      expect(result.id).toBe('lead-1')
    })

    it('throws when not found', async () => {
      m(lead, 'findFirst').mockResolvedValue(null)
      await expect(service.findOne('company-1', 'not-found')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('creates a lead', async () => {
      m(lead, 'create').mockResolvedValue(mockLead)
      const result = await service.create('company-1', 'user-1', { name: 'أحمد العلواني' })
      expect(result).toBeDefined()
      expect(m(lead, 'create')).toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('updates a lead', async () => {
      m(lead, 'findFirst').mockResolvedValue(mockLead)
      m(lead, 'update').mockResolvedValue({ ...mockLead, name: 'Updated' })
      const result = await service.update('company-1', 'lead-1', 'user-1', { name: 'Updated' })
      expect(result).toBeDefined()
      expect(m(lead, 'update')).toHaveBeenCalled()
    })
  })

  describe('updateStatus', () => {
    it('transitions to next stage', async () => {
      m(lead, 'findFirst').mockResolvedValue(mockLead)
      m(lead, 'update').mockResolvedValue({ ...mockLead, status: 'CONTACTED' })
      const result = await service.updateStatus('company-1', 'lead-1', 'user-1', 'CONTACTED')
      expect(result.status).toBe('CONTACTED')
    })

    it('rejects backward transition', async () => {
      m(lead, 'findFirst').mockResolvedValue({ ...mockLead, status: 'QUALIFIED' })
      await expect(service.updateStatus('company-1', 'lead-1', 'user-1', 'NEW')).rejects.toThrow(
        BadRequestException,
      )
    })

    it('converts to client on WON', async () => {
      m(lead, 'findFirst').mockResolvedValue(mockLead)
      m(client, 'create').mockResolvedValue({ id: 'client-1' })
      m(deal, 'create').mockResolvedValue({ id: 'deal-1' })
      m(lead, 'update').mockResolvedValue({
        ...mockLead,
        status: 'WON',
        convertedToClientId: 'client-1',
        convertedToDealId: 'deal-1',
      })

      const result = await service.updateStatus('company-1', 'lead-1', 'user-1', 'WON')
      expect(result.status).toBe('WON')
      expect(m(client, 'create')).toHaveBeenCalled()
      expect(m(deal, 'create')).toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it('soft deletes a lead', async () => {
      m(lead, 'findFirst').mockResolvedValue(mockLead)
      m(lead, 'update').mockResolvedValue(mockLead)
      await service.remove('company-1', 'lead-1', 'user-1')
      expect(m(lead, 'update')).toHaveBeenCalled()
    })
  })
})
