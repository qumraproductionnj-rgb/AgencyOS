import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name)

  constructor(private readonly prisma: PrismaService) {}

  async search(companyId: string, query: string) {
    if (!query || query.length < 2) return { results: [] }

    const q = query.trim()
    const like = { contains: q, mode: 'insensitive' } as const

    const results = await Promise.all([
      this.searchClients(companyId, like),
      this.searchProjects(companyId, like),
      this.searchTasks(companyId, like),
      this.searchLeads(companyId, like),
      this.searchInvoices(companyId, like),
      this.searchEmployees(companyId, like),
      this.searchFiles(companyId, like),
      this.searchCampaigns(companyId, like),
    ])

    return {
      results: results.flat(),
      total: results.reduce((sum, r) => sum + r.length, 0),
    }
  }

  private async searchClients(companyId: string, like: { contains: string; mode: 'insensitive' }) {
    const items = await this.prisma.tenant.client.findMany({
      where: {
        companyId,
        deletedAt: null,
        OR: [{ name: like }, { nameEn: like }, { email: like }],
      },
      select: { id: true, name: true, email: true, phone: true },
      take: 5,
    })
    return items.map((i) => ({
      type: 'client' as const,
      id: i.id,
      title: i.name,
      subtitle: i.email,
      data: i,
    }))
  }

  private async searchProjects(companyId: string, like: { contains: string; mode: 'insensitive' }) {
    const items = await this.prisma.tenant.project.findMany({
      where: {
        companyId,
        deletedAt: null,
        OR: [{ name: like }, { nameEn: like }, { description: like }],
      },
      select: { id: true, name: true, stage: true },
      take: 5,
    })
    return items.map((i) => ({
      type: 'project' as const,
      id: i.id,
      title: i.name,
      subtitle: i.stage,
      data: i,
    }))
  }

  private async searchTasks(companyId: string, like: { contains: string; mode: 'insensitive' }) {
    const items = await this.prisma.tenant.task.findMany({
      where: {
        companyId,
        deletedAt: null,
        OR: [{ title: like }, { description: like }],
      },
      select: { id: true, title: true, status: true },
      take: 5,
    })
    return items.map((i) => ({
      type: 'task' as const,
      id: i.id,
      title: i.title,
      subtitle: i.status,
      data: i,
    }))
  }

  private async searchLeads(companyId: string, like: { contains: string; mode: 'insensitive' }) {
    const items = await this.prisma.tenant.lead.findMany({
      where: {
        companyId,
        deletedAt: null,
        OR: [{ name: like }, { companyName: like }, { email: like }, { phone: like }],
      },
      select: { id: true, name: true, companyName: true, status: true },
      take: 5,
    })
    return items.map((i) => ({
      type: 'lead' as const,
      id: i.id,
      title: i.name,
      subtitle: [i.companyName, i.status].filter(Boolean).join(' · '),
      data: i,
    }))
  }

  private async searchInvoices(companyId: string, like: { contains: string; mode: 'insensitive' }) {
    const items = await this.prisma.tenant.invoice.findMany({
      where: {
        companyId,
        deletedAt: null,
        OR: [{ number: like }, { notes: like }],
      },
      select: { id: true, number: true, total: true, currency: true, status: true },
      take: 5,
    })
    return items.map((i) => ({
      type: 'invoice' as const,
      id: i.id,
      title: i.number,
      subtitle: `${i.currency} ${Number(i.total).toLocaleString()} · ${i.status}`,
      data: i,
    }))
  }

  private async searchEmployees(
    companyId: string,
    like: { contains: string; mode: 'insensitive' },
  ) {
    const items = await this.prisma.tenant.employee.findMany({
      where: {
        companyId,
        deletedAt: null,
        OR: [{ fullNameAr: like }, { fullNameEn: like }, { employeeCode: like }, { email: like }],
      },
      select: { id: true, fullNameAr: true, fullNameEn: true, email: true, position: true },
      take: 5,
    })
    return items.map((i) => ({
      type: 'employee' as const,
      id: i.id,
      title: i.fullNameEn ?? i.fullNameAr,
      subtitle: i.position ?? i.email,
      data: i,
    }))
  }

  private async searchFiles(companyId: string, like: { contains: string; mode: 'insensitive' }) {
    const items = await this.prisma.tenant.file.findMany({
      where: {
        companyId,
        deletedAt: null,
        originalName: like,
      },
      select: { id: true, originalName: true, mimeType: true, entityType: true },
      take: 5,
    })
    return items.map((i) => ({
      type: 'file' as const,
      id: i.id,
      title: i.originalName,
      subtitle: `${i.mimeType} · ${i.entityType}`,
      data: i,
    }))
  }

  private async searchCampaigns(
    companyId: string,
    like: { contains: string; mode: 'insensitive' },
  ) {
    const items = await this.prisma.tenant.campaign.findMany({
      where: {
        companyId,
        deletedAt: null,
        OR: [{ name: like }, { nameEn: like }, { description: like }],
      },
      select: { id: true, name: true, status: true },
      take: 5,
    })
    return items.map((i) => ({
      type: 'campaign' as const,
      id: i.id,
      title: i.name,
      subtitle: i.status,
      data: i,
    }))
  }
}
