import { Test } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { AssetService } from './asset.service'
import { PrismaService } from '../database/prisma.service'

function mockPrisma() {
  return {
    tenant: {
      assetFolder: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      asset: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      assetVersion: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    },
  }
}

const mockFolder = {
  id: 'folder-1',
  companyId: 'company-1',
  parentFolderId: null,
  name: 'Logos',
  path: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-1',
  updatedBy: null,
}

const mockAsset = {
  id: 'asset-1',
  companyId: 'company-1',
  folderId: 'folder-1',
  name: 'Brand Logo',
  description: 'Main company logo',
  type: 'LOGO',
  fileUrl: 'https://example.com/logo.png',
  thumbnailUrl: null,
  previewUrl: null,
  fileSizeBytes: null,
  mimeType: 'image/png',
  durationSeconds: null,
  widthPx: null,
  heightPx: null,
  tags: ['brand', 'primary'],
  linkedProjectIds: [],
  linkedClientIds: [],
  isVisibleToClients: false,
  currentVersionId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-1',
  updatedBy: null,
}

const mockVersion = {
  id: 'version-1',
  companyId: 'company-1',
  assetId: 'asset-1',
  versionNumber: 1,
  fileUrl: 'https://example.com/logo-v1.png',
  fileSize: 102400,
  uploadedBy: 'user-1',
  uploadedAt: new Date(),
  changeNotes: 'Initial version',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
}

describe('AssetService', () => {
  let service: AssetService
  let prisma: ReturnType<typeof mockPrisma>

  beforeEach(async () => {
    prisma = mockPrisma()

    const module = await Test.createTestingModule({
      providers: [AssetService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get<AssetService>(AssetService)
  })

  // ─── Folders ─────────────────────────────────────────

  describe('findAllFolders', () => {
    it('should return all folders for company', async () => {
      prisma.tenant.assetFolder.findMany.mockResolvedValue([mockFolder])
      const result = await service.findAllFolders('company-1')
      expect(result).toEqual([mockFolder])
      expect(prisma.tenant.assetFolder.findMany).toHaveBeenCalledWith({
        where: { companyId: 'company-1', deletedAt: null },
        include: { _count: { select: { children: true, assets: true } } },
        orderBy: { name: 'asc' },
      })
    })
  })

  describe('getFolderTree', () => {
    it('should build folder tree', async () => {
      const childFolder = { ...mockFolder, id: 'folder-2', parentFolderId: 'folder-1', name: 'Sub' }
      prisma.tenant.assetFolder.findMany.mockResolvedValue([mockFolder, childFolder])
      const result = await service.getFolderTree('company-1')
      const tree = result as {
        id: string
        name: string
        children: { id: string; name: string }[]
      }[]
      expect(tree).toHaveLength(1)
      expect(tree[0]!).toMatchObject({ id: 'folder-1', name: 'Logos' })
      expect(tree[0]!.children).toHaveLength(1)
      expect(tree[0]!.children[0]).toMatchObject({ id: 'folder-2', name: 'Sub' })
    })
  })

  describe('createFolder', () => {
    it('should create folder without parent', async () => {
      prisma.tenant.assetFolder.create.mockResolvedValue(mockFolder)
      const result = await service.createFolder('company-1', 'user-1', { name: 'Logos' })
      expect(result).toEqual(mockFolder)
    })

    it('should create folder with parent', async () => {
      prisma.tenant.assetFolder.findFirst.mockResolvedValue(mockFolder)
      prisma.tenant.assetFolder.create.mockResolvedValue({
        ...mockFolder,
        parentFolderId: 'folder-1',
      })
      const result = await service.createFolder('company-1', 'user-1', {
        name: 'Sub',
        parentFolderId: 'folder-1',
      })
      expect(result).toBeDefined()
    })

    it('should throw if parent folder not found', async () => {
      prisma.tenant.assetFolder.findFirst.mockResolvedValue(null)
      await expect(
        service.createFolder('company-1', 'user-1', { name: 'Sub', parentFolderId: 'nonexistent' }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateFolder', () => {
    it('should update folder name', async () => {
      prisma.tenant.assetFolder.findFirst.mockResolvedValue(mockFolder)
      prisma.tenant.assetFolder.update.mockResolvedValue({ ...mockFolder, name: 'Updated' })
      const result = await service.updateFolder('company-1', 'folder-1', 'user-1', {
        name: 'Updated',
      })
      expect(result.name).toBe('Updated')
    })

    it('should throw if folder not found', async () => {
      prisma.tenant.assetFolder.findFirst.mockResolvedValue(null)
      await expect(
        service.updateFolder('company-1', 'nonexistent', 'user-1', { name: 'X' }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('removeFolder', () => {
    it('should soft delete empty folder', async () => {
      prisma.tenant.assetFolder.findFirst.mockResolvedValue(mockFolder)
      prisma.tenant.assetFolder.count.mockResolvedValue(0)
      prisma.tenant.asset.count.mockResolvedValue(0)
      prisma.tenant.assetFolder.update.mockResolvedValue({ ...mockFolder, deletedAt: new Date() })
      await service.removeFolder('company-1', 'folder-1', 'user-1')
      expect(prisma.tenant.assetFolder.update).toHaveBeenCalled()
    })

    it('should throw if folder has children', async () => {
      prisma.tenant.assetFolder.findFirst.mockResolvedValue(mockFolder)
      prisma.tenant.assetFolder.count.mockResolvedValue(1)
      await expect(service.removeFolder('company-1', 'folder-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should throw if folder has assets', async () => {
      prisma.tenant.assetFolder.findFirst.mockResolvedValue(mockFolder)
      prisma.tenant.assetFolder.count.mockResolvedValue(0)
      prisma.tenant.asset.count.mockResolvedValue(1)
      await expect(service.removeFolder('company-1', 'folder-1', 'user-1')).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  // ─── Assets ──────────────────────────────────────────

  describe('findAllAssets', () => {
    it('should return paginated assets', async () => {
      prisma.tenant.asset.findMany.mockResolvedValue([mockAsset])
      const result = await service.findAllAssets('company-1', { limit: 20 })
      expect(result.data).toHaveLength(1)
      expect(result.nextCursor).toBeNull()
    })

    it('should filter by folderId', async () => {
      prisma.tenant.asset.findMany.mockResolvedValue([mockAsset])
      await service.findAllAssets('company-1', { folderId: 'folder-1', limit: 20 })
      expect(prisma.tenant.asset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ folderId: 'folder-1' }),
        }),
      )
    })

    it('should filter by type', async () => {
      prisma.tenant.asset.findMany.mockResolvedValue([mockAsset])
      await service.findAllAssets('company-1', { type: 'LOGO', limit: 20 })
      expect(prisma.tenant.asset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'LOGO' }),
        }),
      )
    })

    it('should search by name', async () => {
      prisma.tenant.asset.findMany.mockResolvedValue([mockAsset])
      await service.findAllAssets('company-1', { search: 'logo', limit: 20 })
      expect(prisma.tenant.asset.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ OR: expect.any(Array) }),
        }),
      )
    })
  })

  describe('findOneAsset', () => {
    it('should return asset with versions', async () => {
      prisma.tenant.asset.findFirst.mockResolvedValue({
        ...mockAsset,
        folder: { id: 'folder-1', name: 'Logos' },
        versions: [mockVersion],
      })
      const result = await service.findOneAsset('company-1', 'asset-1')
      expect(result.id).toBe('asset-1')
      expect(result.versions).toHaveLength(1)
    })

    it('should throw if not found', async () => {
      prisma.tenant.asset.findFirst.mockResolvedValue(null)
      await expect(service.findOneAsset('company-1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('createAsset', () => {
    it('should create asset', async () => {
      prisma.tenant.assetFolder.findFirst.mockResolvedValue(mockFolder)
      prisma.tenant.asset.create.mockResolvedValue({
        ...mockAsset,
        folder: { id: 'folder-1', name: 'Logos' },
      })
      const result = await service.createAsset('company-1', 'user-1', {
        name: 'Brand Logo',
        type: 'LOGO',
        fileUrl: 'https://example.com/logo.png',
        mimeType: 'image/png',
        tags: ['brand'],
        folderId: 'folder-1',
      })
      expect(result.name).toBe('Brand Logo')
    })

    it('should throw if folder not found', async () => {
      prisma.tenant.assetFolder.findFirst.mockResolvedValue(null)
      await expect(
        service.createAsset('company-1', 'user-1', { name: 'X', type: 'LOGO', folderId: 'bad' }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('updateAsset', () => {
    it('should update asset fields', async () => {
      prisma.tenant.asset.findFirst.mockResolvedValue({
        ...mockAsset,
        folder: { id: 'folder-1', name: 'Logos' },
        versions: [],
      })
      prisma.tenant.asset.update.mockResolvedValue({
        ...mockAsset,
        name: 'Updated Logo',
        folder: { id: 'folder-1', name: 'Logos' },
      })
      const result = await service.updateAsset('company-1', 'asset-1', 'user-1', {
        name: 'Updated Logo',
      })
      expect(result.name).toBe('Updated Logo')
    })
  })

  describe('moveAsset', () => {
    it('should move asset to another folder', async () => {
      prisma.tenant.asset.findFirst.mockResolvedValue({
        ...mockAsset,
        folder: { id: 'folder-1', name: 'Logos' },
        versions: [],
      })
      prisma.tenant.assetFolder.findFirst.mockResolvedValue({ ...mockFolder, id: 'folder-2' })
      prisma.tenant.asset.update.mockResolvedValue({
        ...mockAsset,
        folderId: 'folder-2',
        folder: { id: 'folder-2', name: 'Old Logos' },
      })
      const result = await service.moveAsset('company-1', 'asset-1', { folderId: 'folder-2' })
      expect(result.folderId).toBe('folder-2')
    })

    it('should move to root (folderId=null)', async () => {
      prisma.tenant.asset.findFirst.mockResolvedValue({
        ...mockAsset,
        folder: { id: 'folder-1', name: 'Logos' },
        versions: [],
      })
      prisma.tenant.asset.update.mockResolvedValue({
        ...mockAsset,
        folderId: null,
        folder: null,
      })
      const result = await service.moveAsset('company-1', 'asset-1', { folderId: null })
      expect(result.folderId).toBeNull()
    })
  })

  describe('removeAsset', () => {
    it('should soft delete asset', async () => {
      prisma.tenant.asset.findFirst.mockResolvedValue({
        ...mockAsset,
        folder: null,
        versions: [],
      })
      prisma.tenant.asset.update.mockResolvedValue({ ...mockAsset, deletedAt: new Date() })
      await service.removeAsset('company-1', 'asset-1', 'user-1')
      expect(prisma.tenant.asset.update).toHaveBeenCalled()
    })
  })

  // ─── Versions ────────────────────────────────────────

  describe('findVersions', () => {
    it('should return versions for asset', async () => {
      prisma.tenant.asset.findFirst.mockResolvedValue({
        ...mockAsset,
        folder: null,
        versions: [],
      })
      prisma.tenant.assetVersion.findMany.mockResolvedValue([mockVersion])
      const result = await service.findVersions('company-1', 'asset-1')
      expect(result).toHaveLength(1)
    })
  })

  describe('createVersion', () => {
    it('should create version and update asset', async () => {
      prisma.tenant.asset.findFirst.mockResolvedValue({
        ...mockAsset,
        folder: null,
        versions: [],
      })
      prisma.tenant.assetVersion.findFirst.mockResolvedValue(null)
      prisma.tenant.assetVersion.create.mockResolvedValue(mockVersion)
      prisma.tenant.asset.update.mockResolvedValue({ ...mockAsset, currentVersionId: 'version-1' })

      const result = await service.createVersion('company-1', 'asset-1', 'user-1', {
        fileUrl: 'https://example.com/logo-v1.png',
        fileSize: 102400,
      })
      expect(result.versionNumber).toBe(1)
    })

    it('should increment version number', async () => {
      prisma.tenant.asset.findFirst.mockResolvedValue({
        ...mockAsset,
        folder: null,
        versions: [],
      })
      prisma.tenant.assetVersion.findFirst.mockResolvedValue({ versionNumber: 5 })
      prisma.tenant.assetVersion.create.mockResolvedValue({ ...mockVersion, versionNumber: 6 })
      prisma.tenant.asset.update.mockResolvedValue({ ...mockAsset, currentVersionId: 'version-1' })

      const result = await service.createVersion('company-1', 'asset-1', 'user-1', {
        fileUrl: 'https://example.com/logo-v6.png',
        fileSize: 204800,
        changeNotes: 'Updated colors',
      })
      expect(result.versionNumber).toBe(6)
    })
  })

  describe('findOneVersion', () => {
    it('should return specific version', async () => {
      prisma.tenant.asset.findFirst.mockResolvedValue({
        ...mockAsset,
        folder: null,
        versions: [],
      })
      prisma.tenant.assetVersion.findFirst.mockResolvedValue(mockVersion)
      const result = await service.findOneVersion('company-1', 'asset-1', 'version-1')
      expect(result.id).toBe('version-1')
    })

    it('should throw if version not found', async () => {
      prisma.tenant.asset.findFirst.mockResolvedValue({
        ...mockAsset,
        folder: null,
        versions: [],
      })
      prisma.tenant.assetVersion.findFirst.mockResolvedValue(null)
      await expect(service.findOneVersion('company-1', 'asset-1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('updateVersion', () => {
    it('should update change notes', async () => {
      prisma.tenant.asset.findFirst.mockResolvedValue({
        ...mockAsset,
        folder: null,
        versions: [],
      })
      prisma.tenant.assetVersion.findFirst.mockResolvedValue(mockVersion)
      prisma.tenant.assetVersion.update.mockResolvedValue({
        ...mockVersion,
        changeNotes: 'Updated notes',
      })
      const result = await service.updateVersion('company-1', 'asset-1', 'version-1', {
        changeNotes: 'Updated notes',
      })
      expect(result.changeNotes).toBe('Updated notes')
    })
  })

  describe('removeVersion', () => {
    it('should soft delete version', async () => {
      prisma.tenant.asset.findFirst.mockResolvedValue({
        ...mockAsset,
        folder: null,
        versions: [],
      })
      prisma.tenant.assetVersion.findFirst.mockResolvedValue(mockVersion)
      prisma.tenant.assetVersion.update.mockResolvedValue({ ...mockVersion, deletedAt: new Date() })
      await service.removeVersion('company-1', 'asset-1', 'version-1')
      expect(prisma.tenant.assetVersion.update).toHaveBeenCalled()
    })
  })
})
