import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import { StorageService } from './storage.service'

@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async findAll(
    companyId: string,
    filters?: { entityType?: string; entityId?: string; search?: string },
  ) {
    const where: Record<string, unknown> = { companyId, deletedAt: null }
    if (filters?.entityType) where['entityType'] = filters.entityType
    if (filters?.entityId) where['entityId'] = filters.entityId
    if (filters?.search) {
      where['OR'] = [{ originalName: { contains: filters.search, mode: 'insensitive' } }]
    }

    return this.prisma.tenant.file.findMany({
      where: where as never,
      include: {
        uploader: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findOne(companyId: string, id: string) {
    const file = await this.prisma.tenant.file.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        uploader: { select: { id: true, email: true } },
      },
    })
    if (!file) throw new NotFoundException('File not found')
    return file
  }

  async uploadSmallFile(
    companyId: string,
    userId: string,
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    entityType: string,
    entityId: string,
    isVisibleToClient = false,
  ) {
    const file = await this.prisma.tenant.file.create({
      data: {
        companyId,
        originalName,
        storageKey: '',
        mimeType,
        sizeBytes: BigInt(buffer.length),
        entityType,
        entityId,
        uploadedBy: userId,
        isVisibleToClient,
        createdBy: userId,
      },
    })

    const storageKey = this.storage.buildKey(companyId, file.id, originalName)
    await this.storage.upload(buffer, storageKey, mimeType)

    const updated = await this.prisma.tenant.file.update({
      where: { id: file.id },
      data: { storageKey },
      include: { uploader: { select: { id: true, email: true } } },
    })

    this.logger.log(`File uploaded: ${file.id} "${originalName}" (${buffer.length} bytes)`)
    return updated
  }

  async completeTusUpload(
    companyId: string,
    userId: string,
    originalName: string,
    mimeType: string,
    sizeBytes: number,
    storageKey: string,
    entityType: string,
    entityId: string,
    isVisibleToClient = false,
  ) {
    const file = await this.prisma.tenant.file.create({
      data: {
        companyId,
        originalName,
        storageKey,
        mimeType,
        sizeBytes: BigInt(sizeBytes),
        entityType,
        entityId,
        uploadedBy: userId,
        isVisibleToClient,
        createdBy: userId,
      },
      include: { uploader: { select: { id: true, email: true } } },
    })
    this.logger.log(`TUS upload completed: ${file.id} "${originalName}"`)
    return file
  }

  async getDownloadUrl(companyId: string, id: string) {
    const file = await this.findOne(companyId, id)
    const signedUrl = await this.storage.getSignedUrl(file.storageKey)
    if (!signedUrl) return { url: this.storage.getPublicUrl(file.storageKey) }
    return { url: signedUrl }
  }

  async update(companyId: string, id: string, data: { isVisibleToClient?: boolean }) {
    await this.findOne(companyId, id)
    const updateData: Record<string, unknown> = {}
    if (data.isVisibleToClient !== undefined)
      updateData['isVisibleToClient'] = data.isVisibleToClient

    return this.prisma.tenant.file.update({
      where: { id },
      data: updateData,
      include: { uploader: { select: { id: true, email: true } } },
    })
  }

  async remove(companyId: string, id: string, userId: string) {
    const file = await this.findOne(companyId, id)
    await this.storage.delete(file.storageKey)
    await this.prisma.tenant.file.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
    this.logger.log(`File deleted: ${id}`)
  }
}
