import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  // Help articles
  listArticles(category?: string) {
    return this.prisma.system.helpArticle.findMany({
      where: { isPublished: true, ...(category ? { category } : {}) },
      orderBy: { sortOrder: 'asc' },
    })
  }

  async getArticle(slug: string) {
    const article = await this.prisma.system.helpArticle.findUnique({ where: { slug } })
    if (!article || !article.isPublished) throw new NotFoundException('Article not found')
    return article
  }

  // Tickets
  listTickets(companyId: string, status?: string) {
    return this.prisma.tenant.supportTicket.findMany({
      where: { companyId, deletedAt: null, ...(status ? { status: status as never } : {}) },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    })
  }

  async getTicket(companyId: string, id: string) {
    const ticket = await this.prisma.tenant.supportTicket.findFirst({
      where: { id, companyId, deletedAt: null },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })
    if (!ticket) throw new NotFoundException('Ticket not found')
    return ticket
  }

  createTicket(input: {
    companyId: string
    userId: string
    subject: string
    body: string
    priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
    category?: string
  }) {
    if (!input.subject.trim() || !input.body.trim()) {
      throw new BadRequestException('Subject and body are required')
    }
    return this.prisma.tenant.supportTicket.create({
      data: {
        companyId: input.companyId,
        userId: input.userId,
        subject: input.subject,
        body: input.body,
        priority: input.priority ?? 'NORMAL',
        ...(input.category ? { category: input.category } : {}),
        messages: {
          create: { authorId: input.userId, isFromStaff: false, body: input.body },
        },
      },
      include: { messages: true },
    })
  }

  async replyTicket(input: {
    companyId: string
    userId: string
    ticketId: string
    body: string
    isFromStaff: boolean
  }) {
    const ticket = await this.prisma.tenant.supportTicket.findFirst({
      where: { id: input.ticketId, companyId: input.companyId, deletedAt: null },
    })
    if (!ticket) throw new NotFoundException('Ticket not found')
    if (ticket.status === 'CLOSED') throw new BadRequestException('Ticket is closed')
    return this.prisma.tenant.supportTicketMessage.create({
      data: {
        ticketId: input.ticketId,
        authorId: input.userId,
        isFromStaff: input.isFromStaff,
        body: input.body,
      },
    })
  }

  updateTicketStatus(input: {
    companyId: string
    ticketId: string
    status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_USER' | 'RESOLVED' | 'CLOSED'
  }) {
    return this.prisma.tenant.supportTicket.updateMany({
      where: { id: input.ticketId, companyId: input.companyId, deletedAt: null },
      data: { status: input.status },
    })
  }
}
