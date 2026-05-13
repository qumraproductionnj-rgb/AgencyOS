import { Test, type TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { ClientService } from './client.service'
import { PrismaService } from '../database/prisma.service'
import { PasswordService } from '../auth/services/password.service'

describe('ClientService', () => {
  let service: ClientService
  const client: Record<string, jest.Mock> = {}
  const contact: Record<string, jest.Mock> = {}
  const deal: Record<string, jest.Mock> = {}

  const m = (obj: Record<string, jest.Mock>, key: string) => obj[key]!

  const mockClient = {
    id: 'client-1',
    companyId: 'company-1',
    name: 'شركة بغداد للتجارة',
    nameEn: 'Baghdad Trading Co',
    email: 'info@baghdad-trading.com',
    phone: '+964770123456',
    address: 'بغداد، العراق',
    website: 'https://baghdad-trading.com',
    isVip: false,
    isBlacklisted: false,
    notes: 'عميل مهم',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockContact = {
    id: 'contact-1',
    companyId: 'company-1',
    clientId: 'client-1',
    name: 'أحمد العلواني',
    position: 'مدير مبيعات',
    email: 'ahmed@baghdad-trading.com',
    phone: '+964771234567',
    isPrimary: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    client['findMany'] = jest.fn()
    client['findFirst'] = jest.fn()
    client['create'] = jest.fn()
    client['update'] = jest.fn()
    contact['findMany'] = jest.fn()
    contact['findFirst'] = jest.fn()
    contact['create'] = jest.fn()
    contact['update'] = jest.fn()
    contact['updateMany'] = jest.fn()
    deal['findMany'] = jest.fn()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        {
          provide: PrismaService,
          useValue: {
            tenant: { client, contact, deal },
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hash: jest.fn().mockResolvedValue('hashed-password'),
          },
        },
      ],
    }).compile()

    service = module.get<ClientService>(ClientService)
  })

  describe('findAll', () => {
    it('returns clients with revenue', async () => {
      m(client, 'findMany').mockResolvedValue([{ ...mockClient, deals: [] }])
      const result = await service.findAll('company-1')
      expect(result).toHaveLength(1)
      expect(result[0]!.totalRevenueIqd).toBe(0)
    })

    it('filters by search', async () => {
      m(client, 'findMany').mockResolvedValue([])
      await service.findAll('company-1', { search: 'بغداد' })
      expect(m(client, 'findMany')).toHaveBeenCalled()
    })

    it('filters by vip', async () => {
      m(client, 'findMany').mockResolvedValue([])
      await service.findAll('company-1', { vip: 'true' })
      expect(m(client, 'findMany')).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('returns a client with contacts', async () => {
      m(client, 'findFirst').mockResolvedValue({
        ...mockClient,
        contacts: [],
        deals: [],
        _count: { projects: 0, invoices: 0, quotations: 0, campaigns: 0 },
      })
      const result = await service.findOne('company-1', 'client-1')
      expect(result).toBeDefined()
      expect(result.id).toBe('client-1')
    })

    it('throws when not found', async () => {
      m(client, 'findFirst').mockResolvedValue(null)
      await expect(service.findOne('company-1', 'not-found')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('creates a client', async () => {
      m(client, 'create').mockResolvedValue(mockClient)
      const result = await service.create('company-1', 'user-1', { name: 'شركة بغداد للتجارة' })
      expect(result).toBeDefined()
      expect(m(client, 'create')).toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('updates a client', async () => {
      m(client, 'findFirst').mockResolvedValue(mockClient)
      m(client, 'update').mockResolvedValue({ ...mockClient, name: 'Updated' })
      const result = await service.update('company-1', 'client-1', 'user-1', { name: 'Updated' })
      expect(result).toBeDefined()
      expect(m(client, 'update')).toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    it('soft deletes a client', async () => {
      m(client, 'findFirst').mockResolvedValue(mockClient)
      m(client, 'update').mockResolvedValue(mockClient)
      await service.remove('company-1', 'client-1', 'user-1')
      expect(m(client, 'update')).toHaveBeenCalled()
    })
  })

  describe('contacts', () => {
    it('creates a contact', async () => {
      m(client, 'findFirst').mockResolvedValue(mockClient)
      m(contact, 'create').mockResolvedValue(mockContact)
      const result = await service.createContact('company-1', 'client-1', 'user-1', {
        name: 'أحمد العلواني',
      })
      expect(result).toBeDefined()
      expect(m(contact, 'create')).toHaveBeenCalled()
    })

    it('un-sets previous primary when setting new primary', async () => {
      m(client, 'findFirst').mockResolvedValue(mockClient)
      m(contact, 'updateMany').mockResolvedValue({ count: 1 })
      m(contact, 'create').mockResolvedValue({ ...mockContact, id: 'contact-2', isPrimary: true })
      await service.createContact('company-1', 'client-1', 'user-1', {
        name: 'New Primary',
        isPrimary: true,
      })
      expect(m(contact, 'updateMany')).toHaveBeenCalled()
    })

    it('finds contacts for a client', async () => {
      m(client, 'findFirst').mockResolvedValue(mockClient)
      m(contact, 'findMany').mockResolvedValue([mockContact])
      const result = await service.findContacts('company-1', 'client-1')
      expect(result).toHaveLength(1)
    })

    it('updates a contact', async () => {
      m(client, 'findFirst').mockResolvedValue(mockClient)
      m(contact, 'findFirst').mockResolvedValue(mockContact)
      m(contact, 'update').mockResolvedValue({ ...mockContact, name: 'Updated' })
      const result = await service.updateContact('company-1', 'client-1', 'contact-1', 'user-1', {
        name: 'Updated',
      })
      expect(result).toBeDefined()
    })

    it('throws on updating non-existent contact', async () => {
      m(client, 'findFirst').mockResolvedValue(mockClient)
      m(contact, 'findFirst').mockResolvedValue(null)
      await expect(
        service.updateContact('company-1', 'client-1', 'not-found', 'user-1', { name: 'X' }),
      ).rejects.toThrow(NotFoundException)
    })

    it('removes a contact', async () => {
      m(client, 'findFirst').mockResolvedValue(mockClient)
      m(contact, 'findFirst').mockResolvedValue(mockContact)
      m(contact, 'update').mockResolvedValue(mockContact)
      await service.removeContact('company-1', 'client-1', 'contact-1', 'user-1')
      expect(m(contact, 'update')).toHaveBeenCalled()
    })
  })
})
