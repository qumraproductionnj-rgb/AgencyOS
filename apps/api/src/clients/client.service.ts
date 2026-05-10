import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import type {
  CreateClientDto,
  UpdateClientDto,
  CreateContactDto,
  UpdateContactDto,
} from './client.dto'

@Injectable()
export class ClientService {
  private readonly logger = new Logger(ClientService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    companyId: string,
    filters?: { search?: string; vip?: string; blacklisted?: string },
  ) {
    const where: Record<string, unknown> = { companyId, deletedAt: null }

    if (filters?.vip === 'true') where['isVip'] = true
    if (filters?.blacklisted === 'true') where['isBlacklisted'] = true

    if (filters?.search) {
      const s = filters.search
      where['OR'] = [
        { name: { contains: s, mode: 'insensitive' } },
        { nameEn: { contains: s, mode: 'insensitive' } },
        { email: { contains: s, mode: 'insensitive' } },
        { phone: { contains: s, mode: 'insensitive' } },
      ]
    }

    const clients = await this.prisma.tenant.client.findMany({
      where: where as never,
      include: {
        deals: {
          where: { stage: 'CLOSED_WON', deletedAt: null },
          select: { value: true, currency: true },
        },
        _count: { select: { contacts: true, projects: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return clients.map((c) => ({
      ...c,
      totalRevenueIqd: c.deals
        .filter((d) => d.currency === 'IQD')
        .reduce((sum, d) => sum + Number(d.value), 0),
      totalRevenueUsd: c.deals
        .filter((d) => d.currency === 'USD')
        .reduce((sum, d) => sum + Number(d.value), 0),
    }))
  }

  async findOne(companyId: string, id: string) {
    const client = await this.prisma.tenant.client.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        contacts: { where: { deletedAt: null }, orderBy: { createdAt: 'asc' } },
        deals: {
          where: { deletedAt: null },
          select: { id: true, name: true, value: true, currency: true, stage: true },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { projects: true, invoices: true, quotations: true, campaigns: true } },
      },
    })

    if (!client) throw new NotFoundException('Client not found')
    return client
  }

  async create(companyId: string, userId: string, dto: CreateClientDto) {
    const client = await this.prisma.tenant.client.create({
      data: {
        companyId,
        name: dto.name,
        ...(dto.nameEn ? { nameEn: dto.nameEn } : {}),
        ...(dto.email ? { email: dto.email } : {}),
        ...(dto.phone ? { phone: dto.phone } : {}),
        ...(dto.address ? { address: dto.address } : {}),
        ...(dto.website ? { website: dto.website } : {}),
        ...(dto.isVip !== undefined ? { isVip: dto.isVip } : {}),
        ...(dto.isBlacklisted !== undefined ? { isBlacklisted: dto.isBlacklisted } : {}),
        ...(dto.notes ? { notes: dto.notes } : {}),
        createdBy: userId,
      },
    })

    this.logger.log(`Client created: ${client.id} (${client.name})`)
    return client
  }

  async update(companyId: string, id: string, userId: string, dto: UpdateClientDto) {
    await this.findOne(companyId, id)

    const updateData: Record<string, unknown> = { updatedBy: userId }
    if (dto.name !== undefined) updateData['name'] = dto.name
    if (dto.nameEn !== undefined) updateData['nameEn'] = dto.nameEn
    if (dto.email !== undefined) updateData['email'] = dto.email
    if (dto.phone !== undefined) updateData['phone'] = dto.phone
    if (dto.address !== undefined) updateData['address'] = dto.address
    if (dto.website !== undefined) updateData['website'] = dto.website
    if (dto.isVip !== undefined) updateData['isVip'] = dto.isVip
    if (dto.isBlacklisted !== undefined) updateData['isBlacklisted'] = dto.isBlacklisted
    if (dto.notes !== undefined) updateData['notes'] = dto.notes

    const updated = await this.prisma.tenant.client.update({
      where: { id },
      data: updateData,
    })

    this.logger.log(`Client updated: ${id}`)
    return updated
  }

  async remove(companyId: string, id: string, userId: string) {
    await this.findOne(companyId, id)
    await this.prisma.tenant.client.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
    this.logger.log(`Client deleted: ${id}`)
  }

  // --- Contacts (nested under client) ---

  async findContacts(companyId: string, clientId: string) {
    await this.findOne(companyId, clientId)
    return this.prisma.tenant.contact.findMany({
      where: { clientId, companyId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    })
  }

  async createContact(companyId: string, clientId: string, userId: string, dto: CreateContactDto) {
    await this.findOne(companyId, clientId)

    if (dto.isPrimary) {
      await this.prisma.tenant.contact.updateMany({
        where: { clientId, companyId, isPrimary: true, deletedAt: null },
        data: { isPrimary: false },
      })
    }

    const contact = await this.prisma.tenant.contact.create({
      data: {
        companyId,
        clientId,
        name: dto.name,
        ...(dto.position ? { position: dto.position } : {}),
        ...(dto.email ? { email: dto.email } : {}),
        ...(dto.phone ? { phone: dto.phone } : {}),
        ...(dto.isPrimary ? { isPrimary: true } : {}),
        createdBy: userId,
      },
    })

    this.logger.log(`Contact created: ${contact.id} for client ${clientId}`)
    return contact
  }

  async updateContact(
    companyId: string,
    clientId: string,
    contactId: string,
    userId: string,
    dto: UpdateContactDto,
  ) {
    await this.findOne(companyId, clientId)

    const existing = await this.prisma.tenant.contact.findFirst({
      where: { id: contactId, clientId, companyId, deletedAt: null },
    })
    if (!existing) throw new NotFoundException('Contact not found')

    if (dto.isPrimary) {
      await this.prisma.tenant.contact.updateMany({
        where: { clientId, companyId, isPrimary: true, id: { not: contactId }, deletedAt: null },
        data: { isPrimary: false },
      })
    }

    const updateData: Record<string, unknown> = { updatedBy: userId }
    if (dto.name !== undefined) updateData['name'] = dto.name
    if (dto.position !== undefined) updateData['position'] = dto.position
    if (dto.email !== undefined) updateData['email'] = dto.email
    if (dto.phone !== undefined) updateData['phone'] = dto.phone
    if (dto.isPrimary !== undefined) updateData['isPrimary'] = dto.isPrimary

    const updated = await this.prisma.tenant.contact.update({
      where: { id: contactId },
      data: updateData,
    })

    this.logger.log(`Contact updated: ${contactId}`)
    return updated
  }

  async removeContact(companyId: string, clientId: string, contactId: string, userId: string) {
    await this.findOne(companyId, clientId)

    const existing = await this.prisma.tenant.contact.findFirst({
      where: { id: contactId, clientId, companyId, deletedAt: null },
    })
    if (!existing) throw new NotFoundException('Contact not found')

    await this.prisma.tenant.contact.update({
      where: { id: contactId },
      data: { deletedAt: new Date(), updatedBy: userId },
    })

    this.logger.log(`Contact deleted: ${contactId}`)
  }
}
