import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import type { Employee } from '@agencyos/database'
import { PrismaService } from '../database/prisma.service'

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, filters?: { year?: number }) {
    const where: Record<string, unknown> = { companyId, deletedAt: null }
    if (filters?.year) where['year'] = filters.year

    return this.prisma.tenant.payrollRun.findMany({
      where: where as never,
      include: {
        entries: {
          include: {
            employee: {
              select: { id: true, fullNameAr: true, fullNameEn: true, employeeCode: true },
            },
          },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    })
  }

  async findOne(companyId: string, id: string) {
    const run = await this.prisma.tenant.payrollRun.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        entries: {
          include: {
            employee: {
              select: { id: true, fullNameAr: true, fullNameEn: true, employeeCode: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    if (!run) throw new NotFoundException('Payroll run not found')
    return run
  }

  async generate(companyId: string, userId: string, month: number, year: number) {
    const existing = await this.prisma.tenant.payrollRun.findUnique({
      where: { companyId_month_year: { companyId, month, year } },
    })
    if (existing && existing.status === 'DRAFT') {
      throw new ConflictException('A draft payroll run already exists for this period')
    }
    if (existing && existing.status === 'FINALIZED') {
      throw new ConflictException('Payroll for this period has already been finalized')
    }

    const employees = await this.prisma.tenant.employee.findMany({
      where: { companyId, status: 'ACTIVE', deletedAt: null },
    })
    if (employees.length === 0) throw new BadRequestException('No active employees found')

    const entriesData: {
      companyId: string
      employeeId: string
      baseSalary: bigint
      additions: bigint
      deductions: bigint
      netAmount: bigint
      attendanceDays: number
      lateDays: number
      absentDays: number
      notes: string | null
    }[] = []

    let totalAmount = BigInt(0)
    let primaryCurrency = 'IQD'

    for (const emp of employees) {
      const entry = await this.calculateEntry(companyId, emp, month, year)
      entriesData.push(entry)
      totalAmount += entry.netAmount
      if (emp.salaryCurrency) primaryCurrency = emp.salaryCurrency
    }

    if (existing && existing.status === 'PAID') {
      throw new ConflictException('Payroll for this period has already been paid')
    }

    if (existing) {
      const updated = await this.prisma.tenant.payrollRun.update({
        where: { id: existing.id },
        data: {
          status: 'DRAFT',
          totalAmount,
          currency: primaryCurrency,
          updatedBy: userId,
          entries: {
            deleteMany: {},
            createMany: { data: entriesData },
          },
        },
        include: { entries: true },
      })
      this.logger.log(`Payroll run regenerated: ${updated.id} (${month}/${year})`)
      return updated
    }

    const run = await this.prisma.tenant.payrollRun.create({
      data: {
        companyId,
        month,
        year,
        status: 'DRAFT',
        totalAmount,
        currency: primaryCurrency,
        createdBy: userId,
        entries: { createMany: { data: entriesData } },
      },
      include: { entries: true },
    })

    this.logger.log(`Payroll run created: ${run.id} (${month}/${year})`)
    return run
  }

  private async calculateEntry(companyId: string, employee: Employee, month: number, year: number) {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)

    const records = await this.prisma.tenant.attendanceRecord.findMany({
      where: {
        companyId,
        employeeId: employee.id,
        checkInTime: { gte: firstDay, lte: lastDay },
        deletedAt: null,
      },
    })

    const presentDays = records.filter(
      (r) => r.status === 'PRESENT' || r.status === 'REMOTE' || r.status === 'MANUAL_OVERRIDE',
    ).length
    const lateDays = records.filter((r) => r.status === 'LATE').length

    const weeklyOff = (employee.weeklyOffDays as string[]) ?? ['Friday', 'Saturday']
    const workingDays = this.getWorkingDaysInMonth(year, month, weeklyOff)
    const absentDays = Math.max(0, workingDays - presentDays - lateDays)

    const leaves = await this.prisma.tenant.leave.findMany({
      where: {
        companyId,
        employeeId: employee.id,
        status: 'APPROVED',
        leaveType: 'UNPAID',
        startDate: { lte: lastDay },
        endDate: { gte: firstDay },
        deletedAt: null,
      },
    })

    const unpaidLeaveDays = leaves.reduce((sum, l) => {
      const s = l.startDate > firstDay ? l.startDate : firstDay
      const e = l.endDate < lastDay ? l.endDate : lastDay
      const days = Math.floor((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1
      return sum + Math.max(0, days)
    }, 0)

    const salary = Number(employee.salaryAmount)

    if (employee.salaryType === 'MONTHLY') {
      const dailyRate = workingDays > 0 ? Math.floor(salary / workingDays) : 0
      const absentDeduction = absentDays * dailyRate
      const latePenalty = Math.floor(lateDays / 3) * dailyRate
      const unpaidDeduction = unpaidLeaveDays * dailyRate
      const totalDeductions = absentDeduction + latePenalty + unpaidDeduction
      const net = Math.max(0, salary - totalDeductions)

      return {
        companyId,
        employeeId: employee.id,
        baseSalary: BigInt(salary),
        additions: BigInt(0),
        deductions: BigInt(totalDeductions),
        netAmount: BigInt(net),
        attendanceDays: presentDays + lateDays,
        lateDays,
        absentDays,
        notes: null,
      }
    }

    if (employee.salaryType === 'DAILY') {
      const dailyRate = salary
      const workedDays = presentDays + lateDays
      const net = dailyRate * workedDays

      return {
        companyId,
        employeeId: employee.id,
        baseSalary: BigInt(net),
        additions: BigInt(0),
        deductions: BigInt(0),
        netAmount: BigInt(net),
        attendanceDays: workedDays,
        lateDays,
        absentDays,
        notes: null,
      }
    }

    return {
      companyId,
      employeeId: employee.id,
      baseSalary: BigInt(salary),
      additions: BigInt(0),
      deductions: BigInt(0),
      netAmount: BigInt(salary),
      attendanceDays: presentDays + lateDays,
      lateDays,
      absentDays,
      notes: 'Auto-calculated: unsupported salary type, full salary applied',
    }
  }

  private getWorkingDaysInMonth(year: number, month: number, weeklyOff: string[]): number {
    const daysInMonth = new Date(year, month, 0).getDate()
    const offDayNames = weeklyOff.map((d) => d.toLowerCase())
    const dayMap: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    }
    const offIndices = offDayNames.map((d) => dayMap[d]).filter((d) => d !== undefined)

    let working = 0
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day)
      if (!offIndices.includes(date.getDay())) working++
    }
    return working
  }

  async updateEntry(
    companyId: string,
    entryId: string,
    userId: string,
    dto: { additions?: number; deductions?: number; notes?: string },
  ) {
    const entry = await this.prisma.tenant.payrollEntry.findFirst({
      where: { id: entryId, companyId, deletedAt: null },
      include: { payrollRun: true },
    })
    if (!entry) throw new NotFoundException('Payroll entry not found')
    if (entry.payrollRun.status !== 'DRAFT')
      throw new BadRequestException('Can only edit entries in draft payroll runs')

    const additions = dto.additions !== undefined ? BigInt(dto.additions) : entry.additions
    const deductions = dto.deductions !== undefined ? BigInt(dto.deductions) : entry.deductions
    const netAmount = entry.baseSalary + additions - deductions

    const updated = await this.prisma.tenant.payrollEntry.update({
      where: { id: entryId },
      data: {
        additions,
        deductions,
        netAmount: netAmount < BigInt(0) ? BigInt(0) : netAmount,
        ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
        updatedBy: userId,
      },
    })

    await this.recalcRunTotal(companyId, entry.payrollRunId)
    return updated
  }

  private async recalcRunTotal(companyId: string, runId: string) {
    const entries = await this.prisma.tenant.payrollEntry.findMany({
      where: { companyId, payrollRunId: runId, deletedAt: null },
    })
    const total = entries.reduce((sum, e) => sum + e.netAmount, BigInt(0))
    await this.prisma.tenant.payrollRun.update({
      where: { id: runId },
      data: { totalAmount: total },
    })
  }

  async finalize(companyId: string, id: string, userId: string) {
    const run = await this.findOne(companyId, id)
    if (run.status !== 'DRAFT')
      throw new BadRequestException('Only draft payroll runs can be finalized')

    const updated = await this.prisma.tenant.payrollRun.update({
      where: { id },
      data: {
        status: 'FINALIZED',
        finalizedAt: new Date(),
        processedBy: userId,
        updatedBy: userId,
      },
    })

    this.logger.log(`Payroll run finalized: ${id}`)
    return updated
  }

  async markPaid(companyId: string, id: string, userId: string) {
    const run = await this.findOne(companyId, id)
    if (run.status !== 'FINALIZED')
      throw new BadRequestException('Only finalized payroll runs can be marked as paid')

    const updated = await this.prisma.tenant.payrollRun.update({
      where: { id },
      data: {
        status: 'PAID',
        processedBy: userId,
        processedAt: new Date(),
        updatedBy: userId,
      },
    })

    this.logger.log(`Payroll run marked as paid: ${id}`)
    return updated
  }
}
