import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import type { CreateExpenseDto, UpdateExpenseDto } from './expense.dto'

@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(ExpenseService.name)

  constructor(private readonly prisma: PrismaService) {}

  private shouldAutoApprove(amount: number, currency: string): boolean {
    if (currency === 'IQD' && amount <= 150000) return true
    if (currency === 'USD' && amount <= 100) return true
    return false
  }

  async findAll(
    companyId: string,
    filters?: { search?: string; status?: string; category?: string },
  ) {
    const where: Record<string, unknown> = { companyId, deletedAt: null }
    if (filters?.status) where['status'] = filters.status
    if (filters?.category) where['category'] = filters.category
    if (filters?.search) {
      const s = filters.search
      where['OR'] = [
        { description: { contains: s, mode: 'insensitive' } },
        { employee: { user: { name: { contains: s, mode: 'insensitive' } } } },
      ]
    }

    return this.prisma.tenant.expense.findMany({
      where: where as never,
      include: {
        employee: {
          select: {
            id: true,
            fullNameAr: true,
            fullNameEn: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(companyId: string, id: string) {
    const exp = await this.prisma.tenant.expense.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        employee: {
          select: {
            id: true,
            fullNameAr: true,
            fullNameEn: true,
          },
        },
        approver: { select: { id: true, email: true } },
      },
    })
    if (!exp) throw new NotFoundException('Expense not found')
    return exp
  }

  async create(companyId: string, userId: string, dto: CreateExpenseDto) {
    const autoApproved = this.shouldAutoApprove(dto.amount, dto.currency)

    const expense = await this.prisma.tenant.expense.create({
      data: {
        companyId,
        employeeId: dto.employeeId,
        category: dto.category,
        amount: Math.round(dto.amount),
        currency: dto.currency,
        description: dto.description,
        receiptUrl: dto.receiptUrl ?? null,
        status: autoApproved ? 'APPROVED' : 'PENDING',
        expenseDate: new Date(dto.expenseDate),
        ...(autoApproved ? { approvedBy: userId, approvedAt: new Date() } : {}),
        createdBy: userId,
      },
      include: {
        employee: {
          select: { id: true, fullNameAr: true, fullNameEn: true },
        },
      },
    })

    this.logger.log(
      `Expense created: ${expense.id} (${expense.currency} ${expense.amount}) status=${expense.status}`,
    )
    return expense
  }

  async update(companyId: string, id: string, userId: string, dto: UpdateExpenseDto) {
    const existing = await this.findOne(companyId, id)
    if (existing.status !== 'PENDING') {
      throw new BadRequestException('Only pending expenses can be edited')
    }

    const updateData: Record<string, unknown> = { updatedBy: userId }
    if (dto.category) updateData['category'] = dto.category
    if (dto.amount) updateData['amount'] = Math.round(dto.amount)
    if (dto.currency) updateData['currency'] = dto.currency
    if (dto.description) updateData['description'] = dto.description
    if (dto.receiptUrl !== undefined) updateData['receiptUrl'] = dto.receiptUrl
    if (dto.expenseDate) updateData['expenseDate'] = new Date(dto.expenseDate)

    const updated = await this.prisma.tenant.expense.update({
      where: { id },
      data: updateData,
      include: {
        employee: {
          select: { id: true, fullNameAr: true, fullNameEn: true },
        },
      },
    })

    this.logger.log(`Expense updated: ${id}`)
    return updated
  }

  async approve(
    companyId: string,
    id: string,
    userId: string,
    status: string,
    rejectionReason?: string,
  ) {
    const existing = await this.findOne(companyId, id)
    if (existing.status !== 'PENDING') {
      throw new BadRequestException(`Expense is already ${existing.status}`)
    }

    const updateData: Record<string, unknown> = {
      status,
      approvedBy: userId,
      approvedAt: new Date(),
      updatedBy: userId,
    }
    if (status === 'REJECTED' && rejectionReason) {
      updateData['rejectionReason'] = rejectionReason
    }

    const updated = await this.prisma.tenant.expense.update({
      where: { id },
      data: updateData,
    })

    this.logger.log(`Expense ${id} → ${status}`)
    return updated
  }

  async remove(companyId: string, id: string, userId: string) {
    await this.findOne(companyId, id)
    await this.prisma.tenant.expense.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
    this.logger.log(`Expense deleted: ${id}`)
  }
}
