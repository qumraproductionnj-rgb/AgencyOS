import { Test } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { PdfService } from '../quotations/pdf.service'
import { InvoiceService } from './invoice.service'

function mockPrisma() {
  return {
    tenant: {
      invoice: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        create: jest.fn(),
      },
    },
  }
}

const mockInvoice = {
  id: 'inv-1',
  companyId: 'company-1',
  clientId: 'client-1',
  number: 'INV-2026-0001',
  status: 'DRAFT',
  type: 'STANDARD',
  items: [
    { description: 'Service', quantity: 1, unitPrice: 100000, currency: 'IQD', total: 100000 },
  ],
  subtotal: 100000,
  discountPercent: null,
  discountAmount: null,
  taxPercent: null,
  taxAmount: null,
  total: 100000,
  paidAmount: 0,
  balanceDue: 100000,
  currency: 'IQD',
  dueDate: new Date('2026-06-01'),
  issuedDate: new Date(),
  notes: null,
  pdfUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-1',
  updatedBy: null,
  client: { id: 'client-1', name: 'Client', nameEn: null, address: null, phone: null, email: null },
  quotation: null,
  payments: [],
}

describe('InvoiceService', () => {
  let service: InvoiceService
  let prisma: ReturnType<typeof mockPrisma>
  let pdf: { generateInvoicePdf: jest.Mock }

  beforeEach(async () => {
    prisma = mockPrisma()
    pdf = { generateInvoicePdf: jest.fn().mockResolvedValue(Buffer.from('pdf')) }

    const module = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: PrismaService, useValue: prisma },
        { provide: PdfService, useValue: pdf },
      ],
    }).compile()

    service = module.get<InvoiceService>(InvoiceService)
  })

  describe('findAll', () => {
    it('should return invoices list', async () => {
      prisma.tenant.invoice.findMany.mockResolvedValue([mockInvoice])
      const result = await service.findAll('company-1')
      expect(result).toHaveLength(1)
      expect(prisma.tenant.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ companyId: 'company-1' }) }),
      )
    })

    it('should filter by status', async () => {
      prisma.tenant.invoice.findMany.mockResolvedValue([])
      await service.findAll('company-1', { status: 'DRAFT' })
      expect(prisma.tenant.invoice.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'DRAFT' }) }),
      )
    })
  })

  describe('findOne', () => {
    it('should return an invoice by id', async () => {
      prisma.tenant.invoice.findFirst.mockResolvedValue(mockInvoice)
      const result = await service.findOne('company-1', 'inv-1')
      expect(result.id).toBe('inv-1')
    })

    it('should throw NotFound for missing invoice', async () => {
      prisma.tenant.invoice.findFirst.mockResolvedValue(null)
      await expect(service.findOne('company-1', 'bad-id')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('should create an invoice with auto-number', async () => {
      prisma.tenant.invoice.findFirst.mockResolvedValue(null)
      prisma.tenant.invoice.create.mockResolvedValue(mockInvoice)

      const result = await service.create('company-1', 'user-1', {
        clientId: 'client-1',
        items: [
          {
            description: 'Service',
            quantity: 1,
            unitPrice: 100000,
            currency: 'IQD',
            total: 100000,
          },
        ],
        currency: 'IQD',
        dueDate: '2026-06-01',
      })

      expect(result.number).toMatch(/^INV-2026-/)
      expect(prisma.tenant.invoice.create).toHaveBeenCalled()
    })
  })

  describe('update', () => {
    it('should update a draft invoice', async () => {
      prisma.tenant.invoice.findFirst.mockResolvedValue(mockInvoice)
      prisma.tenant.invoice.update.mockResolvedValue({ ...mockInvoice, notes: 'Updated' })

      const result = await service.update('company-1', 'inv-1', 'user-1', { notes: 'Updated' })
      expect(result).toBeDefined()
    })

    it('should reject update on non-draft', async () => {
      prisma.tenant.invoice.findFirst.mockResolvedValue({ ...mockInvoice, status: 'SENT' })
      await expect(
        service.update('company-1', 'inv-1', 'user-1', { notes: 'test' }),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('updateStatus', () => {
    it('should allow DRAFT to SENT', async () => {
      prisma.tenant.invoice.findFirst.mockResolvedValue(mockInvoice)
      prisma.tenant.invoice.update.mockResolvedValue({ ...mockInvoice, status: 'SENT' })
      const result = await service.updateStatus('company-1', 'inv-1', 'user-1', 'SENT')
      expect(result).toBeDefined()
    })

    it('should reject invalid transition', async () => {
      prisma.tenant.invoice.findFirst.mockResolvedValue(mockInvoice)
      await expect(service.updateStatus('company-1', 'inv-1', 'user-1', 'PAID')).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('recordPayment', () => {
    it('should record payment and update status to PAID when fully paid', async () => {
      prisma.tenant.invoice.findFirst.mockResolvedValue(mockInvoice)
      prisma.tenant.payment.create.mockResolvedValue({ id: 'pay-1', amount: 100000 })
      prisma.tenant.invoice.update.mockResolvedValue({
        ...mockInvoice,
        status: 'PAID',
        paidAmount: 100000,
        balanceDue: 0,
      })

      const result = await service.recordPayment('company-1', 'inv-1', 'user-1', {
        amount: 100000,
        currency: 'IQD',
        method: 'bank_transfer',
        paidAt: '2026-05-10',
      })

      expect(result).toBeDefined()
      expect(prisma.tenant.payment.create).toHaveBeenCalled()
    })

    it('should reject payment on already paid invoice', async () => {
      prisma.tenant.invoice.findFirst.mockResolvedValue({ ...mockInvoice, status: 'PAID' })
      await expect(
        service.recordPayment('company-1', 'inv-1', 'user-1', {
          amount: 1000,
          currency: 'IQD',
          method: 'cash',
          paidAt: '2026-05-10',
        }),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('send', () => {
    it('should send a draft invoice and generate PDF', async () => {
      prisma.tenant.invoice.findFirst.mockResolvedValue(mockInvoice)
      prisma.tenant.invoice.update.mockResolvedValue({
        ...mockInvoice,
        status: 'SENT',
        pdfUrl: 'invoices/inv-1.pdf',
      })
      pdf.generateInvoicePdf.mockResolvedValue(Buffer.from('pdf-content'))

      const result = await service.send('company-1', 'inv-1', 'user-1')
      expect(result.status).toBe('SENT')
      expect(pdf.generateInvoicePdf).toHaveBeenCalled()
    })

    it('should reject send on non-draft', async () => {
      prisma.tenant.invoice.findFirst.mockResolvedValue({ ...mockInvoice, status: 'SENT' })
      await expect(service.send('company-1', 'inv-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('remove', () => {
    it('should soft delete an invoice', async () => {
      prisma.tenant.invoice.findFirst.mockResolvedValue(mockInvoice)
      prisma.tenant.invoice.update.mockResolvedValue({ ...mockInvoice, deletedAt: new Date() })
      await service.remove('company-1', 'inv-1', 'user-1')
      expect(prisma.tenant.invoice.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      )
    })
  })
})
