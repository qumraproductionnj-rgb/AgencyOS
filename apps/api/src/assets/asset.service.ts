import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../database/prisma.service'
import type {
  CreateFolderDto,
  UpdateFolderDto,
  CreateAssetDto,
  UpdateAssetDto,
  MoveAssetDto,
  CreateVersionDto,
  UpdateVersionDto,
  AssetQueryDto,
} from './asset.dto'

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name)

  constructor(private readonly prisma: PrismaService) {}

  // ─── Folders ─────────────────────────────────────────

  async findAllFolders(companyId: string) {
    return this.prisma.tenant.assetFolder.findMany({
      where: { companyId, deletedAt: null },
      include: { _count: { select: { children: true, assets: true } } },
      orderBy: { name: 'asc' },
    })
  }

  async getFolderTree(companyId: string) {
    const folders = await this.prisma.tenant.assetFolder.findMany({
      where: { companyId, deletedAt: null },
      orderBy: { name: 'asc' },
    })
    return this.buildTree(folders, null)
  }

  private buildTree(
    folders: { id: string; parentFolderId: string | null; name: string; path: string | null }[],
    parentId: string | null,
  ): unknown[] {
    return folders
      .filter((f) => f.parentFolderId === parentId)
      .map((f) => ({
        id: f.id,
        name: f.name,
        path: f.path,
        children: this.buildTree(folders, f.id),
      }))
  }

  async createFolder(companyId: string, userId: string, dto: CreateFolderDto) {
    if (dto.parentFolderId) {
      const parent = await this.prisma.tenant.assetFolder.findFirst({
        where: { id: dto.parentFolderId, companyId, deletedAt: null },
      })
      if (!parent) throw new NotFoundException('Parent folder not found')
    }

    const folder = await this.prisma.tenant.assetFolder.create({
      data: {
        companyId,
        name: dto.name,
        parentFolderId: dto.parentFolderId ?? null,
        createdBy: userId,
      },
    })

    this.logger.log(`Folder created: ${folder.id} "${folder.name}"`)
    return folder
  }

  async updateFolder(companyId: string, id: string, userId: string, dto: UpdateFolderDto) {
    await this.findFolderOrThrow(companyId, id)

    const updated = await this.prisma.tenant.assetFolder.update({
      where: { id },
      data: { name: dto.name, updatedBy: userId },
    })

    this.logger.log(`Folder updated: ${id}`)
    return updated
  }

  async removeFolder(companyId: string, id: string, userId: string) {
    await this.findFolderOrThrow(companyId, id)

    const childCount = await this.prisma.tenant.assetFolder.count({
      where: { parentFolderId: id, deletedAt: null },
    })
    if (childCount > 0) {
      throw new BadRequestException('Cannot delete folder with sub-folders')
    }

    const assetCount = await this.prisma.tenant.asset.count({
      where: { folderId: id, deletedAt: null },
    })
    if (assetCount > 0) {
      throw new BadRequestException('Cannot delete folder with assets')
    }

    await this.prisma.tenant.assetFolder.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    })

    this.logger.log(`Folder deleted: ${id}`)
  }

  // ─── Assets ──────────────────────────────────────────

  async findAllAssets(companyId: string, query: AssetQueryDto) {
    const where: Record<string, unknown> = { companyId, deletedAt: null }
    if (query.folderId) where['folderId'] = query.folderId
    if (query.type) where['type'] = query.type
    if (query.search) {
      const s = query.search
      where['OR'] = [
        { name: { contains: s, mode: 'insensitive' } },
        { description: { contains: s, mode: 'insensitive' } },
      ]
    }
    if (query.isVisibleToClients !== undefined) {
      where['isVisibleToClients'] = query.isVisibleToClients
    }

    const items = await this.prisma.tenant.asset.findMany({
      where: where as never,
      include: {
        folder: { select: { id: true, name: true } },
        _count: { select: { versions: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: query.limit + 1,
      ...(query.cursor ? { skip: 1, cursor: { id: query.cursor } } : {}),
    })

    const hasMore = items.length > query.limit
    const data = hasMore ? items.slice(0, query.limit) : items

    return {
      data,
      nextCursor: hasMore ? data[data.length - 1]?.id : null,
    }
  }

  async findOneAsset(companyId: string, id: string) {
    const asset = await this.prisma.tenant.asset.findFirst({
      where: { id, companyId, deletedAt: null },
      include: {
        folder: { select: { id: true, name: true } },
        versions: {
          where: { deletedAt: null },
          orderBy: { versionNumber: 'desc' },
          take: 10,
        },
      },
    })
    if (!asset) throw new NotFoundException('Asset not found')
    return asset
  }

  async createAsset(companyId: string, userId: string, dto: CreateAssetDto) {
    if (dto.folderId) {
      const folder = await this.prisma.tenant.assetFolder.findFirst({
        where: { id: dto.folderId, companyId, deletedAt: null },
      })
      if (!folder) throw new NotFoundException('Folder not found')
    }

    const asset = await this.prisma.tenant.asset.create({
      data: {
        companyId,
        folderId: dto.folderId ?? null,
        name: dto.name,
        description: dto.description ?? null,
        type: dto.type,
        fileUrl: dto.fileUrl ?? null,
        thumbnailUrl: dto.thumbnailUrl ?? null,
        previewUrl: dto.previewUrl ?? null,
        fileSizeBytes: dto.fileSizeBytes ?? null,
        mimeType: dto.mimeType ?? null,
        durationSeconds: dto.durationSeconds ?? null,
        widthPx: dto.widthPx ?? null,
        heightPx: dto.heightPx ?? null,
        tags: dto.tags ?? [],
        linkedProjectIds: dto.linkedProjectIds ?? [],
        linkedClientIds: dto.linkedClientIds ?? [],
        isVisibleToClients: dto.isVisibleToClients ?? false,
        createdBy: userId,
      },
      include: {
        folder: { select: { id: true, name: true } },
      },
    })

    this.logger.log(`Asset created: ${asset.id} "${asset.name}"`)
    return asset
  }

  async updateAsset(companyId: string, id: string, userId: string, dto: UpdateAssetDto) {
    await this.findOneAsset(companyId, id)

    const updateData: Record<string, unknown> = { updatedBy: userId }
    if (dto.name) updateData['name'] = dto.name
    if (dto.description !== undefined) updateData['description'] = dto.description
    if (dto.type) updateData['type'] = dto.type
    if (dto.fileUrl !== undefined) updateData['fileUrl'] = dto.fileUrl
    if (dto.thumbnailUrl !== undefined) updateData['thumbnailUrl'] = dto.thumbnailUrl
    if (dto.previewUrl !== undefined) updateData['previewUrl'] = dto.previewUrl
    if (dto.fileSizeBytes !== undefined) updateData['fileSizeBytes'] = dto.fileSizeBytes
    if (dto.mimeType !== undefined) updateData['mimeType'] = dto.mimeType
    if (dto.durationSeconds !== undefined) updateData['durationSeconds'] = dto.durationSeconds
    if (dto.widthPx !== undefined) updateData['widthPx'] = dto.widthPx
    if (dto.heightPx !== undefined) updateData['heightPx'] = dto.heightPx
    if (dto.tags !== undefined) updateData['tags'] = dto.tags
    if (dto.linkedProjectIds !== undefined) updateData['linkedProjectIds'] = dto.linkedProjectIds
    if (dto.linkedClientIds !== undefined) updateData['linkedClientIds'] = dto.linkedClientIds
    if (dto.isVisibleToClients !== undefined)
      updateData['isVisibleToClients'] = dto.isVisibleToClients
    if (dto.folderId !== undefined) updateData['folderId'] = dto.folderId

    const updated = await this.prisma.tenant.asset.update({
      where: { id },
      data: updateData,
      include: {
        folder: { select: { id: true, name: true } },
      },
    })

    this.logger.log(`Asset updated: ${id}`)
    return updated
  }

  async moveAsset(companyId: string, id: string, dto: MoveAssetDto) {
    await this.findOneAsset(companyId, id)

    if (dto.folderId) {
      const folder = await this.prisma.tenant.assetFolder.findFirst({
        where: { id: dto.folderId, companyId, deletedAt: null },
      })
      if (!folder) throw new NotFoundException('Destination folder not found')
    }

    return this.prisma.tenant.asset.update({
      where: { id },
      data: { folderId: dto.folderId },
      include: {
        folder: { select: { id: true, name: true } },
      },
    })
  }

  async removeAsset(companyId: string, id: string, userId: string) {
    await this.findOneAsset(companyId, id)
    await this.prisma.tenant.asset.update({
      where: { id },
      data: { deletedAt: new Date(), updatedBy: userId },
    })
    this.logger.log(`Asset deleted: ${id}`)
  }

  // ─── Asset Versions ──────────────────────────────────

  async findVersions(companyId: string, assetId: string) {
    await this.findOneAsset(companyId, assetId)

    return this.prisma.tenant.assetVersion.findMany({
      where: { assetId, companyId, deletedAt: null },
      orderBy: { versionNumber: 'desc' },
    })
  }

  async createVersion(companyId: string, assetId: string, userId: string, dto: CreateVersionDto) {
    await this.findOneAsset(companyId, assetId)

    const lastVersion = await this.prisma.tenant.assetVersion.findFirst({
      where: { assetId, companyId },
      orderBy: { versionNumber: 'desc' },
      select: { versionNumber: true },
    })

    const versionNumber = (lastVersion?.versionNumber ?? 0) + 1

    const version = await this.prisma.tenant.assetVersion.create({
      data: {
        companyId,
        assetId,
        versionNumber,
        fileUrl: dto.fileUrl,
        fileSize: dto.fileSize,
        changeNotes: dto.changeNotes ?? null,
        uploadedBy: userId,
        uploadedAt: new Date(),
      },
    })

    await this.prisma.tenant.asset.update({
      where: { id: assetId },
      data: {
        currentVersionId: version.id,
        fileUrl: dto.fileUrl,
        fileSizeBytes: dto.fileSize,
        updatedBy: userId,
      },
    })

    this.logger.log(`Version ${versionNumber} created for asset ${assetId}`)
    return version
  }

  async findOneVersion(companyId: string, assetId: string, versionId: string) {
    await this.findOneAsset(companyId, assetId)

    const version = await this.prisma.tenant.assetVersion.findFirst({
      where: { id: versionId, assetId, companyId, deletedAt: null },
    })
    if (!version) throw new NotFoundException('Version not found')
    return version
  }

  async updateVersion(
    companyId: string,
    assetId: string,
    versionId: string,
    dto: UpdateVersionDto,
  ) {
    await this.findOneVersion(companyId, assetId, versionId)

    const updateVersionData: Record<string, unknown> = {}
    if (dto.changeNotes !== undefined) updateVersionData['changeNotes'] = dto.changeNotes

    const updated = await this.prisma.tenant.assetVersion.update({
      where: { id: versionId },
      data: updateVersionData,
    })

    this.logger.log(`Version ${versionId} updated`)
    return updated
  }

  async removeVersion(companyId: string, assetId: string, versionId: string) {
    await this.findOneVersion(companyId, assetId, versionId)

    await this.prisma.tenant.assetVersion.update({
      where: { id: versionId },
      data: { deletedAt: new Date() },
    })

    this.logger.log(`Version deleted: ${versionId}`)
  }

  // ─── Helpers ─────────────────────────────────────────

  private async findFolderOrThrow(companyId: string, id: string) {
    const folder = await this.prisma.tenant.assetFolder.findFirst({
      where: { id, companyId, deletedAt: null },
    })
    if (!folder) throw new NotFoundException('Folder not found')
    return folder
  }
}
