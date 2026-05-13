import { Test } from '@nestjs/testing'
import { ReportsService } from './reports.service'
import { PrismaService } from '../database/prisma.service'

function mockPrisma() {
  return {
    tenant: {
      invoice: { findMany: jest.fn().mockResolvedValue([]) },
      expense: { findMany: jest.fn().mockResolvedValue([]) },
      task: { count: jest.fn().mockResolvedValue(0) },
      revision: { count: jest.fn().mockResolvedValue(0) },
      attendanceRecord: { groupBy: jest.fn().mockResolvedValue([]) },
      leave: { groupBy: jest.fn().mockResolvedValue([]) },
      performanceReview: { count: jest.fn().mockResolvedValue(0) },
      lead: { groupBy: jest.fn().mockResolvedValue([]) },
      deal: { groupBy: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0) },
    },
  }
}

describe('ReportsService', () => {
  let service: ReportsService
  let prisma: ReturnType<typeof mockPrisma>
  const range = { from: new Date('2026-04-01'), to: new Date('2026-05-01') }

  beforeEach(async () => {
    prisma = mockPrisma()
    const module = await Test.createTestingModule({
      providers: [ReportsService, { provide: PrismaService, useValue: prisma }],
    }).compile()
    service = module.get(ReportsService)
  })

  it('financial aggregates revenue by currency and computes profitability', async () => {
    prisma.tenant.invoice.findMany
      .mockResolvedValueOnce([
        { total: 100000n, currency: 'IQD', issuedDate: range.from },
        { total: 50000n, currency: 'IQD', issuedDate: range.from },
        { total: 200n, currency: 'USD', issuedDate: range.from },
      ])
      .mockResolvedValueOnce([])
    prisma.tenant.expense.findMany.mockResolvedValue([
      { amount: 30000n, currency: 'IQD', category: 'rent' },
    ])
    const r = await service.financial(range)
    expect(r.revenue['IQD']).toBe(150000)
    expect(r.revenue['USD']).toBe(200)
    expect(r.profitability['IQD']).toBe(150000 - 30000)
    expect(r.expensesByCategory['rent']!['IQD']).toBe(30000)
  })

  it('operations computes completion rate', async () => {
    prisma.tenant.task.count
      .mockResolvedValueOnce(8) // done
      .mockResolvedValueOnce(2) // overdue
      .mockResolvedValueOnce(10) // total
    prisma.tenant.revision.count.mockResolvedValue(3)
    const r = await service.operations(range)
    expect(r.completionRatePct).toBe(80)
    expect(r.revisions).toBe(3)
  })

  it('hr returns attendance/leave breakdowns', async () => {
    prisma.tenant.attendanceRecord.groupBy.mockResolvedValue([
      { status: 'PRESENT', _count: { _all: 20 } },
      { status: 'LATE', _count: { _all: 3 } },
    ])
    prisma.tenant.leave.groupBy.mockResolvedValue([{ leaveType: 'ANNUAL', _count: { _all: 2 } }])
    prisma.tenant.performanceReview.count.mockResolvedValue(5)
    const r = await service.hr(range)
    expect(r.attendance['PRESENT']).toBe(20)
    expect(r.leaves['ANNUAL']).toBe(2)
    expect(r.performanceReviews).toBe(5)
  })

  it('sales computes conversion rate from won/lost', async () => {
    prisma.tenant.lead.groupBy.mockResolvedValue([{ status: 'NEW', _count: { _all: 5 } }])
    prisma.tenant.deal.groupBy.mockResolvedValue([
      { stage: 'CLOSED_WON', _count: { _all: 4 }, _sum: { value: 100000n } },
    ])
    prisma.tenant.deal.count
      .mockResolvedValueOnce(4) // won
      .mockResolvedValueOnce(1) // lost
    const r = await service.sales(range)
    expect(r.won).toBe(4)
    expect(r.lost).toBe(1)
    expect(r.conversionRatePct).toBe(80)
    expect(r.dealsByStatus['CLOSED_WON']!.count).toBe(4)
  })
})
