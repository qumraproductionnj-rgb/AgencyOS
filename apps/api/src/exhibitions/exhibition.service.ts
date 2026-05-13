import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

@Injectable()
export class ExhibitionService {
  private readonly logger = new Logger(ExhibitionService.name)

  constructor(private readonly prisma: PrismaService) {}

  // ---- Exhibition CRUD ----

  async findAll(
    companyId: string,
    query: {
      status?: string | undefined
      search?: string | undefined
      limit?: number | undefined
      cursor?: string | undefined
    },
  ) {
    const take = Math.min(query.limit ?? 50, 100)
    const where: Record<string, unknown> = { companyId }

    if (query.status) where['status'] = query.status
    if (query.search) {
      where['OR'] = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { locationAddress: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
      ]
    }
    if (query.cursor) where['id'] = { lt: query.cursor }

    const items = await this.prisma.tenant.exhibition.findMany({
      where: where as never,
      orderBy: { startDate: 'desc' },
      take: take + 1,
      include: {
        manager: { select: { employee: { select: { fullNameAr: true, fullNameEn: true } } } },
        booths: { select: { id: true, brandName: true } },
        _count: { select: { booths: true, financials: true } },
      },
    })

    const hasMore = items.length > take
    const data = hasMore ? items.slice(0, take) : items
    const nextCursor = hasMore ? data[data.length - 1]!.id : null

    return { items: data, nextCursor }
  }

  async findOne(companyId: string, id: string) {
    const item = await this.prisma.tenant.exhibition.findFirst({
      where: { id, companyId },
      include: {
        manager: { select: { employee: { select: { fullNameAr: true, fullNameEn: true } } } },
        booths: {
          include: {
            inventory: true,
          },
          orderBy: { boothNumber: 'asc' },
        },
        financials: {
          orderBy: { transactionDate: 'desc' },
          include: { recorder: { select: { employee: { select: { fullNameAr: true } } } } },
        },
        settlement: true,
      },
    })
    if (!item) throw new NotFoundException('Exhibition not found')
    return item
  }

  async create(
    companyId: string,
    userId: string,
    dto: {
      name: string
      locationAddress?: string
      city?: string
      country?: string
      startDate: string
      endDate: string
      organizingClientId?: string | null
      managerId?: string | null
    },
  ) {
    if (new Date(dto.startDate) >= new Date(dto.endDate)) {
      throw new ConflictException('Start date must be before end date')
    }

    const exhibition = await this.prisma.tenant.exhibition.create({
      data: {
        companyId,
        name: dto.name,
        locationAddress: dto.locationAddress ?? null,
        city: dto.city ?? null,
        country: dto.country ?? null,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        organizingClientId: dto.organizingClientId ?? null,
        managerId: dto.managerId ?? null,
        createdBy: userId,
      },
    })
    this.logger.log(`Exhibition created: ${exhibition.id} (${dto.name})`)
    return this.findOne(companyId, exhibition.id)
  }

  async update(companyId: string, id: string, userId: string, dto: Record<string, unknown>) {
    await this.findOne(companyId, id)
    const data: Record<string, unknown> = { ...dto, updatedBy: userId }
    if (data['startDate']) data['startDate'] = new Date(data['startDate'] as string)
    if (data['endDate']) data['endDate'] = new Date(data['endDate'] as string)

    await this.prisma.tenant.exhibition.update({
      where: { id },
      data: data as never,
    })
    this.logger.log(`Exhibition updated: ${id}`)
    return this.findOne(companyId, id)
  }

  async updateStatus(companyId: string, id: string, userId: string, status: string) {
    const exhibition = await this.findOne(companyId, id)

    const validTransitions: Record<string, string[]> = {
      PLANNING: ['ACTIVE'],
      ACTIVE: ['CONCLUDED'],
      CONCLUDED: ['SETTLED'],
    }

    const allowed = validTransitions[exhibition.status] ?? []
    if (!allowed.includes(status)) {
      throw new ConflictException(`Cannot transition from ${exhibition.status} to ${status}`)
    }

    await this.prisma.tenant.exhibition.update({
      where: { id },
      data: { status: status as never, updatedBy: userId },
    })
    this.logger.log(`Exhibition ${id} status → ${status}`)
    return this.findOne(companyId, id)
  }

  async remove(companyId: string, id: string) {
    await this.findOne(companyId, id)
    await this.prisma.tenant.exhibition.update({
      where: { id },
      data: { deletedAt: new Date() },
    })
    this.logger.log(`Exhibition soft-deleted: ${id}`)
  }

  // ---- Booths ----

  async findBooths(companyId: string, exhibitionId: string) {
    await this.findOne(companyId, exhibitionId)
    return this.prisma.tenant.exhibitionBooth.findMany({
      where: { exhibitionId, companyId },
      orderBy: { boothNumber: 'asc' },
      include: {
        inventory: true,
        _count: { select: { inventory: true } },
      },
    })
  }

  async createBooth(
    companyId: string,
    userId: string,
    exhibitionId: string,
    dto: {
      brandName: string
      brandLogoUrl?: string
      boothNumber?: string
      boothSize?: string
      clientCompanyId?: string | null
      notes?: string
    },
  ) {
    await this.findOne(companyId, exhibitionId)
    const booth = await this.prisma.tenant.exhibitionBooth.create({
      data: {
        companyId,
        exhibitionId,
        brandName: dto.brandName,
        brandLogoUrl: dto.brandLogoUrl ?? null,
        boothNumber: dto.boothNumber ?? null,
        boothSize: dto.boothSize ?? null,
        clientCompanyId: dto.clientCompanyId ?? null,
        notes: dto.notes ?? null,
        createdBy: userId,
      },
    })
    this.logger.log(`Booth created: ${booth.id} for exhibition ${exhibitionId}`)
    return booth
  }

  async updateBooth(
    companyId: string,
    exhibitionId: string,
    boothId: string,
    dto: Record<string, unknown>,
  ) {
    const booth = await this.prisma.tenant.exhibitionBooth.findFirst({
      where: { id: boothId, exhibitionId, companyId },
    })
    if (!booth) throw new NotFoundException('Booth not found')
    const now = new Date()
    if (dto['dailyVisitorsCount']) {
      const existing = Array.isArray(booth.dailyVisitorsCount)
        ? (booth.dailyVisitorsCount as Record<string, unknown>[])
        : []
      const newEntries = dto['dailyVisitorsCount'] as { date: string; count: number }[]
      dto['dailyVisitorsCount'] = [
        ...existing,
        ...newEntries.map((e) => ({ ...e, recordedAt: now.toISOString() })),
      ]
    }
    await this.prisma.tenant.exhibitionBooth.update({
      where: { id: boothId },
      data: dto as never,
    })
    this.logger.log(`Booth updated: ${boothId}`)
    return this.prisma.tenant.exhibitionBooth.findFirst({
      where: { id: boothId },
      include: { inventory: true },
    })
  }

  async deleteBooth(companyId: string, exhibitionId: string, boothId: string) {
    const booth = await this.prisma.tenant.exhibitionBooth.findFirst({
      where: { id: boothId, exhibitionId, companyId },
    })
    if (!booth) throw new NotFoundException('Booth not found')
    await this.prisma.tenant.exhibitionBooth.update({
      where: { id: boothId },
      data: { deletedAt: new Date() },
    })
    this.logger.log(`Booth soft-deleted: ${boothId}`)
  }

  // ---- Inventory ----

  async findInventory(companyId: string, exhibitionId: string, boothId: string) {
    await this.findBooths(companyId, exhibitionId) // validates booth exists
    return this.prisma.tenant.boothInventory.findMany({
      where: { boothId, companyId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createInventory(
    companyId: string,
    userId: string,
    exhibitionId: string,
    boothId: string,
    dto: {
      itemName: string
      category: string
      quantitySent?: number
      quantityConsumed?: number
      quantityReturned?: number
      quantityDamaged?: number
      unitCost?: number
      currency?: string
      totalCost?: number
      notes?: string
    },
  ) {
    await this.findBooths(companyId, exhibitionId) // validates booth exists
    const inventory = await this.prisma.tenant.boothInventory.create({
      data: {
        companyId,
        boothId,
        itemName: dto.itemName,
        category: dto.category as never,
        quantitySent: dto.quantitySent ?? 0,
        quantityConsumed: dto.quantityConsumed ?? 0,
        quantityReturned: dto.quantityReturned ?? 0,
        quantityDamaged: dto.quantityDamaged ?? 0,
        unitCost: dto.unitCost ? BigInt(dto.unitCost) : null,
        currency: dto.currency ?? 'IQD',
        totalCost: dto.totalCost ? BigInt(dto.totalCost) : null,
        notes: dto.notes ?? null,
        createdBy: userId,
      },
    })
    this.logger.log(`Inventory item created: ${inventory.id} for booth ${boothId}`)
    return inventory
  }

  async updateInventory(
    companyId: string,
    exhibitionId: string,
    boothId: string,
    inventoryId: string,
    dto: Record<string, unknown>,
  ) {
    await this.findBooths(companyId, exhibitionId) // validates booth exists
    const item = await this.prisma.tenant.boothInventory.findFirst({
      where: { id: inventoryId, boothId, companyId },
    })
    if (!item) throw new NotFoundException('Inventory item not found')

    const data: Record<string, unknown> = { ...dto }
    if (data['unitCost']) data['unitCost'] = BigInt(data['unitCost'] as number)
    if (data['totalCost']) data['totalCost'] = BigInt(data['totalCost'] as number)

    await this.prisma.tenant.boothInventory.update({
      where: { id: inventoryId },
      data: data as never,
    })
    this.logger.log(`Inventory item updated: ${inventoryId}`)
    return this.prisma.tenant.boothInventory.findFirst({ where: { id: inventoryId } })
  }

  async deleteInventory(
    companyId: string,
    exhibitionId: string,
    boothId: string,
    inventoryId: string,
  ) {
    await this.findBooths(companyId, exhibitionId)
    const item = await this.prisma.tenant.boothInventory.findFirst({
      where: { id: inventoryId, boothId, companyId },
    })
    if (!item) throw new NotFoundException('Inventory item not found')
    await this.prisma.tenant.boothInventory.update({
      where: { id: inventoryId },
      data: { deletedAt: new Date() },
    })
    this.logger.log(`Inventory item soft-deleted: ${inventoryId}`)
  }

  // ---- Financials ----

  async findFinancials(companyId: string, exhibitionId: string) {
    await this.findOne(companyId, exhibitionId)
    return this.prisma.tenant.exhibitionFinancial.findMany({
      where: { exhibitionId, companyId },
      orderBy: { transactionDate: 'desc' },
      include: { recorder: { select: { employee: { select: { fullNameAr: true } } } } },
    })
  }

  async createFinancial(
    companyId: string,
    userId: string,
    exhibitionId: string,
    dto: {
      type: string
      category: string
      description?: string
      amount: number
      currency?: string
      transactionDate: string
      receiptUrl?: string
    },
  ) {
    await this.findOne(companyId, exhibitionId)
    const financial = await this.prisma.tenant.exhibitionFinancial.create({
      data: {
        companyId,
        exhibitionId,
        type: dto.type as never,
        category: dto.category as never,
        description: dto.description ?? null,
        amount: BigInt(dto.amount),
        currency: dto.currency ?? 'IQD',
        transactionDate: new Date(dto.transactionDate),
        receiptUrl: dto.receiptUrl ?? null,
        recordedBy: userId,
        createdBy: userId,
      },
    })
    this.logger.log(`Financial entry created: ${financial.id} for exhibition ${exhibitionId}`)
    return financial
  }

  async updateFinancial(
    companyId: string,
    exhibitionId: string,
    financialId: string,
    dto: Record<string, unknown>,
  ) {
    await this.findOne(companyId, exhibitionId)
    const entry = await this.prisma.tenant.exhibitionFinancial.findFirst({
      where: { id: financialId, exhibitionId, companyId },
    })
    if (!entry) throw new NotFoundException('Financial entry not found')

    const data: Record<string, unknown> = { ...dto }
    if (data['amount']) data['amount'] = BigInt(data['amount'] as number)
    if (data['transactionDate'])
      data['transactionDate'] = new Date(data['transactionDate'] as string)

    await this.prisma.tenant.exhibitionFinancial.update({
      where: { id: financialId },
      data: data as never,
    })
    this.logger.log(`Financial entry updated: ${financialId}`)
    return this.prisma.tenant.exhibitionFinancial.findFirst({ where: { id: financialId } })
  }

  async deleteFinancial(companyId: string, exhibitionId: string, financialId: string) {
    await this.findOne(companyId, exhibitionId)
    const entry = await this.prisma.tenant.exhibitionFinancial.findFirst({
      where: { id: financialId, exhibitionId, companyId },
    })
    if (!entry) throw new NotFoundException('Financial entry not found')
    await this.prisma.tenant.exhibitionFinancial.update({
      where: { id: financialId },
      data: { deletedAt: new Date() },
    })
    this.logger.log(`Financial entry soft-deleted: ${financialId}`)
  }

  // ---- Settlement ----

  async getSettlement(companyId: string, exhibitionId: string) {
    const exhibition = await this.findOne(companyId, exhibitionId)
    if (!exhibition.settlement) {
      return { settlement: null, summary: this.calculateSummary(exhibition.financials) }
    }
    return { settlement: exhibition.settlement, summary: null }
  }

  async createSettlement(companyId: string, userId: string, exhibitionId: string) {
    const exhibition = await this.findOne(companyId, exhibitionId)
    if (exhibition.status !== 'CONCLUDED') {
      throw new ConflictException('Exhibition must be CONCLUDED before settlement')
    }
    if (exhibition.settlement) {
      throw new ConflictException('Settlement already exists for this exhibition')
    }

    const financials = exhibition.financials
    const incomeIqd = financials
      .filter((f) => f.type === 'INCOME' && f.currency === 'IQD')
      .reduce((sum, f) => sum + Number(f.amount), 0)
    const incomeUsd = financials
      .filter((f) => f.type === 'INCOME' && f.currency === 'USD')
      .reduce((sum, f) => sum + Number(f.amount), 0)
    const expenseIqd = financials
      .filter((f) => f.type === 'EXPENSE' && f.currency === 'IQD')
      .reduce((sum, f) => sum + Number(f.amount), 0)
    const expenseUsd = financials
      .filter((f) => f.type === 'EXPENSE' && f.currency === 'USD')
      .reduce((sum, f) => sum + Number(f.amount), 0)

    // Calculate client outstanding from CLIENT_PAYMENT income entries
    const clientOutstanding = financials
      .filter((f) => f.type === 'INCOME' && f.category === 'CLIENT_PAYMENT' && f.amount > BigInt(0))
      .reduce((acc: Record<string, { paid: number; currency: string }[]>, f) => {
        const key = `client_${exhibition.organizingClientId ?? 'unknown'}`
        if (!acc[key]) acc[key] = []
        acc[key].push({ paid: Number(f.amount), currency: f.currency })
        return acc
      }, {})

    const settlement = await this.prisma.tenant.exhibitionSettlement.create({
      data: {
        companyId,
        exhibitionId,
        totalIncomeIqd: BigInt(incomeIqd),
        totalIncomeUsd: BigInt(incomeUsd),
        totalExpenseIqd: BigInt(expenseIqd),
        totalExpenseUsd: BigInt(expenseUsd),
        netProfitIqd: BigInt(incomeIqd - expenseIqd),
        netProfitUsd: BigInt(incomeUsd - expenseUsd),
        clientOutstanding: clientOutstanding as never,
        settledAt: new Date(),
        settledBy: userId,
        createdBy: userId,
      },
    })

    // Mark exhibition as SETTLED
    await this.prisma.tenant.exhibition.update({
      where: { id: exhibitionId },
      data: { status: 'SETTLED' as never, updatedBy: userId },
    })

    this.logger.log(`Settlement created for exhibition ${exhibitionId}`)
    return settlement
  }

  private calculateSummary(financials: { type: string; amount: bigint; currency: string }[]) {
    const incomeIqd = financials
      .filter((f) => f.type === 'INCOME' && f.currency === 'IQD')
      .reduce((s, f) => s + Number(f.amount), 0)
    const incomeUsd = financials
      .filter((f) => f.type === 'INCOME' && f.currency === 'USD')
      .reduce((s, f) => s + Number(f.amount), 0)
    const expenseIqd = financials
      .filter((f) => f.type === 'EXPENSE' && f.currency === 'IQD')
      .reduce((s, f) => s + Number(f.amount), 0)
    const expenseUsd = financials
      .filter((f) => f.type === 'EXPENSE' && f.currency === 'USD')
      .reduce((s, f) => s + Number(f.amount), 0)
    return {
      totalIncomeIqd: incomeIqd,
      totalIncomeUsd: incomeUsd,
      totalExpenseIqd: expenseIqd,
      totalExpenseUsd: expenseUsd,
      netProfitIqd: incomeIqd - expenseIqd,
      netProfitUsd: incomeUsd - expenseUsd,
      entryCount: financials.length,
    }
  }
}
