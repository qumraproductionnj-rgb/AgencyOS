import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import type { CreateAnnotationDto } from './client-portal.dto'

@Injectable()
export class ClientPortalService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(clientId: string, companyId: string) {
    const [projects, pendingFiles, invoices, contentPieces] = await Promise.all([
      this.prisma.tenant.project.findMany({
        where: { clientId, companyId, deletedAt: null, stage: { not: 'CANCELLED' } },
        select: { id: true, name: true, stage: true, deadline: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.file.findMany({
        where: {
          companyId,
          entityType: 'content_piece',
          clientReviewStatus: 'pending_review',
          deletedAt: null,
          isVisibleToClient: true,
        },
        select: { id: true, originalName: true, mimeType: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      this.prisma.tenant.invoice.findMany({
        where: { clientId, companyId, deletedAt: null },
        select: {
          id: true,
          number: true,
          total: true,
          currency: true,
          status: true,
          dueDate: true,
          issuedDate: true,
        },
        orderBy: { issuedDate: 'desc' },
        take: 10,
      }),
      this.prisma.tenant.contentPiece.findMany({
        where: { clientId, companyId, deletedAt: null, stage: { notIn: ['PUBLISHED', 'FAILED'] } },
        select: { id: true, title: true, type: true, stage: true, updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 20,
      }),
    ])

    return {
      projectsCount: projects.length,
      pendingReviewCount: pendingFiles.length,
      projects,
      pendingFiles,
      invoices,
      contentPieces,
    }
  }

  async getProjects(clientId: string, companyId: string) {
    return this.prisma.tenant.project.findMany({
      where: { clientId, companyId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        tasks: {
          where: { deletedAt: null },
          select: { id: true, title: true, status: true, dueDate: true },
        },
      },
    })
  }

  async getFiles(clientId: string, companyId: string, status?: string) {
    const where: Record<string, unknown> = { companyId, deletedAt: null, isVisibleToClient: true }
    if (status) where['clientReviewStatus'] = status
    return this.prisma.tenant.file.findMany({
      where: where as never,
      orderBy: { createdAt: 'desc' },
      include: {
        annotations: {
          where: { deletedAt: null },
          include: { user: { select: { id: true, preferredLanguage: true } } },
        },
      },
    })
  }

  async getFileAnnotations(fileId: string, companyId: string) {
    const file = await this.prisma.tenant.file.findFirst({
      where: { id: fileId, companyId, deletedAt: null, isVisibleToClient: true },
    })
    if (!file) throw new NotFoundException('File not found')
    return this.prisma.tenant.fileAnnotation.findMany({
      where: { fileId, companyId, deletedAt: null },
      include: { user: { select: { id: true, preferredLanguage: true } } },
      orderBy: { createdAt: 'asc' },
    })
  }

  async createAnnotation(
    fileId: string,
    companyId: string,
    userId: string,
    dto: CreateAnnotationDto,
  ) {
    return this.prisma.tenant.fileAnnotation.create({
      data: {
        companyId,
        fileId,
        userId,
        annotationType: dto.annotationType,
        content: dto.content,
        timestampSeconds: dto.timestampSeconds ?? null,
        regionX: dto.regionX ?? null,
        regionY: dto.regionY ?? null,
        regionW: dto.regionW ?? null,
        regionH: dto.regionH ?? null,
        pageNumber: dto.pageNumber ?? null,
        pageRegion: (dto.pageRegion ?? null) as never,
      },
    })
  }

  async approveFile(fileId: string, companyId: string, _userId: string) {
    void _userId
    const file = await this.prisma.tenant.file.findFirst({
      where: { id: fileId, companyId, deletedAt: null, isVisibleToClient: true },
    })
    if (!file) throw new NotFoundException('File not found')
    return this.prisma.tenant.file.update({
      where: { id: fileId },
      data: { clientReviewStatus: 'approved' },
    })
  }

  async requestRevision(fileId: string, companyId: string, userId: string, feedback: string) {
    const file = await this.prisma.tenant.file.findFirst({
      where: { id: fileId, companyId, deletedAt: null, isVisibleToClient: true },
    })
    if (!file) throw new NotFoundException('File not found')

    await this.prisma.tenant.file.update({
      where: { id: fileId },
      data: { clientReviewStatus: 'revision_requested' },
    })

    return this.prisma.tenant.fileAnnotation.create({
      data: {
        companyId,
        fileId,
        userId,
        annotationType: 'text',
        content: `Revision request: ${feedback}`,
      },
    })
  }

  async getInvoices(clientId: string, companyId: string) {
    return this.prisma.tenant.invoice.findMany({
      where: { clientId, companyId, deletedAt: null },
      orderBy: { issuedDate: 'desc' },
      include: {
        payments: {
          where: { deletedAt: null },
          select: { id: true, amount: true, currency: true, method: true, paidAt: true },
        },
      },
    })
  }

  async getContentPieces(clientId: string, companyId: string) {
    return this.prisma.tenant.contentPiece.findMany({
      where: { clientId, companyId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        stage: true,
        scheduledAt: true,
        updatedAt: true,
      },
    })
  }

  async getClientProfile(clientId: string, companyId: string) {
    const client = await this.prisma.tenant.client.findFirst({
      where: { id: clientId, companyId, deletedAt: null },
    })
    if (!client) throw new NotFoundException('Client not found')
    return client
  }
}
