import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PrismaService } from '../database/prisma.service'
import type { SetRateDto, UpdateRateDto } from './exchange-rate.dto'

@Injectable()
export class ExchangeRateService {
  private readonly logger = new Logger(ExchangeRateService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(companyId: string, from?: string, to?: string) {
    const where: Record<string, unknown> = { companyId, deletedAt: null }
    if (from) where['fromCurrency'] = from
    if (to) where['toCurrency'] = to

    return this.prisma.tenant.exchangeRate.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findCurrent(companyId: string, from: string, to: string) {
    const rate = await this.prisma.tenant.exchangeRate.findFirst({
      where: {
        companyId,
        fromCurrency: from,
        toCurrency: to,
        deletedAt: null,
        validFrom: { lte: new Date() },
        OR: [{ validTo: null }, { validTo: { gte: new Date() } }],
      },
      orderBy: { createdAt: 'desc' },
    })
    return rate
  }

  async setManual(companyId: string, userId: string, dto: SetRateDto) {
    const rate = await this.prisma.tenant.exchangeRate.create({
      data: {
        companyId,
        fromCurrency: dto.fromCurrency,
        toCurrency: dto.toCurrency,
        rate: dto.rate,
        isManual: true,
        validFrom: dto.validFrom ? new Date(dto.validFrom) : new Date(),
        createdBy: userId,
      },
    })
    this.logger.log(`Manual rate set: ${dto.fromCurrency}→${dto.toCurrency} = ${dto.rate}`)
    return rate
  }

  async update(companyId: string, id: string, userId: string, dto: UpdateRateDto) {
    const existing = await this.prisma.tenant.exchangeRate.findFirst({
      where: { id, companyId, deletedAt: null },
    })
    if (!existing) throw new NotFoundException('Exchange rate not found')

    const updated = await this.prisma.tenant.exchangeRate.update({
      where: { id },
      data: { rate: dto.rate, updatedBy: userId },
    })
    this.logger.log(`Rate updated: ${id} → ${dto.rate}`)
    return updated
  }

  async remove(companyId: string, id: string, userId: string) {
    const existing = await this.prisma.tenant.exchangeRate.findFirst({
      where: { id, companyId, deletedAt: null },
    })
    if (!existing) throw new NotFoundException('Exchange rate not found')

    await this.prisma.tenant.exchangeRate.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
    this.logger.log(`Exchange rate deleted: ${id}`)
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async autoFetchDaily() {
    this.logger.log('Running daily exchange rate auto-fetch...')
    const companies = await this.prisma.system.company.findMany({
      where: { deletedAt: null },
    })

    const pairs = [
      { from: 'USD', to: 'IQD' },
      { from: 'USD', to: 'EUR' },
      { from: 'EUR', to: 'IQD' },
    ]

    for (const company of companies) {
      for (const { from, to } of pairs) {
        try {
          const existing = await this.prisma.tenant.exchangeRate.findFirst({
            where: {
              companyId: company.id,
              fromCurrency: from,
              toCurrency: to,
              isManual: true,
              deletedAt: null,
            },
          })
          if (existing) continue

          const rate = await this.fetchRate(from, to)
          if (rate) {
            await this.prisma.tenant.exchangeRate.create({
              data: {
                companyId: company.id,
                fromCurrency: from,
                toCurrency: to,
                rate,
                isManual: false,
                validFrom: new Date(),
                createdBy: null,
              },
            })
            this.logger.log(`Auto-fetched ${from}→${to} = ${rate}`)
          }
        } catch (err) {
          this.logger.error(`Failed to fetch ${from}→${to} for company ${company.id}: ${err}`)
        }
      }
    }
  }

  private async fetchRate(from: string, to: string): Promise<number | null> {
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${from}`, {
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) return null
      const data = (await res.json()) as { rates: Record<string, number> }
      return data.rates?.[to] ?? null
    } catch (err) {
      this.logger.warn(`Fetch rate failed for ${from}→${to}: ${err}`)
      return null
    }
  }
}
