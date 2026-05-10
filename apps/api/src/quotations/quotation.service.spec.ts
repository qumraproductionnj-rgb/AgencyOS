import { Test, type TestingModule } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { QuotationService } from './quotation.service'
import { PdfService } from './pdf.service'
import { PrismaService } from '../database/prisma.service'

describe('QuotationService', () => {
  let service: QuotationService
  const quotation: Record<string, jest.Mock> = {}
  const client: Record<string, jest.Mock> = {}
  const deal: Record<string, jest.Mock> = {}
  const project: Record<string, jest.Mock> = {}
  const invoice: Record<string, jest.Mock> = {}
  const m = (obj: Record<string, jest.Mock>, key: string) => obj[key]!

  const mockQuotation = {
    id: 'quo-1',
    companyId: 'company-1',
    clientId: 'client-1',
    number: 'QUO-2026-0001',
    status: 'DRAFT',
    items: [
      {
        description: 'خدمات تسويقية',
        quantity: 1,
        unitPrice: 5000000,
        total: 5000000,
        currency: 'IQD',
      },
    ],
    subtotal: 5000000,
    discountPercent: null,
    discountAmount: null,
    taxPercent: null,
    taxAmount: null,
    total: 5000000,
    currency: 'IQD',
    notes: null,
    validUntil: null,
    sentAt: null,
    acceptedAt: null,
    rejectedAt: null,
    rejectionReason: null,
    pdfUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'user-1',
    client: { id: 'client-1', name: 'شركة بغداد', nameEn: 'Baghdad Co', address: 'بغداد' },
    deal: null,
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    quotation['findMany'] = jest.fn()
    quotation['findFirst'] = jest.fn()
    quotation['create'] = jest.fn()
    quotation['update'] = jest.fn()
    client['findFirst'] = jest.fn()
    project['create'] = jest.fn()
    invoice['create'] = jest.fn()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotationService,
        {
          provide: PrismaService,
          useValue: {
            tenant: { quotation, client, deal, project, invoice },
          },
        },
        {
          provide: PdfService,
          useValue: { generateQuotationPdf: jest.fn().mockResolvedValue(Buffer.from('pdf')) },
        },
      ],
    }).compile()

    service = module.get<QuotationService>(QuotationService)
  })

  describe('findAll', () => {
    it('returns quotations', async () => {
      m(quotation, 'findMany').mockResolvedValue([mockQuotation])
      const result = await service.findAll('company-1')
      expect(result).toHaveLength(1)
    })
  })

  describe('findOne', () => {
    it('returns a quotation', async () => {
      m(quotation, 'findFirst').mockResolvedValue(mockQuotation)
      const result = await service.findOne('company-1', 'quo-1')
      expect(result).toBeDefined()
    })

    it('throws on not found', async () => {
      m(quotation, 'findFirst').mockResolvedValue(null)
      await expect(service.findOne('company-1', 'no-exist')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('creates a quotation with auto-generated number', async () => {
      m(quotation, 'findFirst').mockResolvedValueOnce(null) // no previous number
      m(quotation, 'create').mockResolvedValue(mockQuotation)

      const result = await service.create('company-1', 'user-1', {
        clientId: 'client-1',
        items: [
          {
            description: 'خدمات',
            quantity: 1,
            unitPrice: 5000000,
            total: 5000000,
            currency: 'IQD',
          },
        ],
        currency: 'IQD',
      })
      expect(result).toBeDefined()
      expect(m(quotation, 'create')).toHaveBeenCalled()
    })
  })

  describe('updateStatus', () => {
    it('transitions DRAFT→SENT', async () => {
      m(quotation, 'findFirst').mockResolvedValue(mockQuotation)
      m(quotation, 'update').mockResolvedValue({
        ...mockQuotation,
        status: 'SENT',
        sentAt: new Date(),
      })
      const result = await service.updateStatus('company-1', 'quo-1', 'user-1', 'SENT')
      expect(result.status).toBe('SENT')
    })

    it('rejects invalid transition DRAFT→ACCEPTED', async () => {
      m(quotation, 'findFirst').mockResolvedValue(mockQuotation)
      await expect(
        service.updateStatus('company-1', 'quo-1', 'user-1', 'ACCEPTED'),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('acceptByToken', () => {
    it('accepts a sent quotation and creates project + invoice', async () => {
      const sentQ = { ...mockQuotation, status: 'SENT', items: [] }
      m(quotation, 'findFirst').mockResolvedValue(sentQ)
      m(quotation, 'update').mockResolvedValue({
        ...sentQ,
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      })
      m(project, 'create').mockResolvedValue({ id: 'proj-1' })
      m(invoice, 'create').mockResolvedValue({ id: 'inv-1' })

      const result = await service.acceptByToken('quo-1')
      expect(result).toBeDefined()
      expect(m(quotation, 'update')).toHaveBeenCalled()
      expect(m(project, 'create')).toHaveBeenCalled()
      expect(m(invoice, 'create')).toHaveBeenCalled()
    })
  })
})
