import { Test, type TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { FileService } from './file.service'
import { StorageService } from './storage.service'
import { PrismaService } from '../database/prisma.service'

function mockPrisma() {
  return {
    tenant: {
      file: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    },
  }
}

function mockStorage() {
  return {
    buildKey: jest.fn().mockReturnValue('company-1/2026/05/file-id_test.txt'),
    upload: jest.fn().mockResolvedValue(undefined),
    delete: jest.fn().mockResolvedValue(undefined),
    getSignedUrl: jest.fn().mockResolvedValue('https://signed.url/file'),
    getPublicUrl: jest.fn().mockReturnValue('https://public.url/file'),
  }
}

const mockFile = {
  id: 'file-1',
  companyId: 'company-1',
  originalName: 'test.txt',
  storageKey: 'company-1/2026/05/file-id_test.txt',
  mimeType: 'text/plain',
  sizeBytes: BigInt(1024),
  entityType: 'project',
  entityId: 'project-1',
  uploadedBy: 'user-1',
  isVisibleToClient: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: 'user-1',
  updatedBy: null,
  uploader: { id: 'user-1', email: 'user@test.com' },
}

describe('FileService', () => {
  let service: FileService
  let prisma: ReturnType<typeof mockPrisma>
  let storage: ReturnType<typeof mockStorage>

  beforeEach(async () => {
    prisma = mockPrisma()
    storage = mockStorage()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileService,
        { provide: PrismaService, useValue: prisma },
        { provide: StorageService, useValue: storage },
      ],
    }).compile()
    service = module.get<FileService>(FileService)
  })

  describe('findAll', () => {
    it('should return all files for company', async () => {
      prisma.tenant.file.findMany.mockResolvedValue([mockFile])
      const result = await service.findAll('company-1')
      expect(result).toEqual([mockFile])
      expect(prisma.tenant.file.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ companyId: 'company-1', deletedAt: null }),
        }),
      )
    })

    it('should filter by entityType and entityId', async () => {
      prisma.tenant.file.findMany.mockResolvedValue([mockFile])
      await service.findAll('company-1', { entityType: 'project', entityId: 'project-1' })
      expect(prisma.tenant.file.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ entityType: 'project', entityId: 'project-1' }),
        }),
      )
    })
  })

  describe('findOne', () => {
    it('should return a file by id', async () => {
      prisma.tenant.file.findFirst.mockResolvedValue(mockFile)
      const result = await service.findOne('company-1', 'file-1')
      expect(result).toEqual(mockFile)
    })

    it('should throw NotFoundException', async () => {
      prisma.tenant.file.findFirst.mockResolvedValue(null)
      await expect(service.findOne('company-1', 'file-1')).rejects.toThrow(NotFoundException)
    })
  })

  describe('uploadSmallFile', () => {
    it('should upload a small file', async () => {
      prisma.tenant.file.create.mockResolvedValue(mockFile)
      prisma.tenant.file.update.mockResolvedValue(mockFile)
      const buffer = Buffer.from('hello')
      const result = await service.uploadSmallFile(
        'company-1',
        'user-1',
        buffer,
        'test.txt',
        'text/plain',
        'project',
        'project-1',
      )
      expect(result).toEqual(mockFile)
      expect(storage.upload).toHaveBeenCalled()
      expect(prisma.tenant.file.update).toHaveBeenCalled()
    })
  })

  describe('completeTusUpload', () => {
    it('should create file record for TUS upload', async () => {
      prisma.tenant.file.create.mockResolvedValue(mockFile)
      const result = await service.completeTusUpload(
        'company-1',
        'user-1',
        'test.txt',
        'text/plain',
        9999,
        'some-key',
        'project',
        'project-1',
      )
      expect(result).toEqual(mockFile)
    })
  })

  describe('getDownloadUrl', () => {
    it('should return a signed URL', async () => {
      prisma.tenant.file.findFirst.mockResolvedValue(mockFile)
      const result = await service.getDownloadUrl('company-1', 'file-1')
      expect(result.url).toBe('https://signed.url/file')
    })

    it('should fall back to public URL', async () => {
      prisma.tenant.file.findFirst.mockResolvedValue(mockFile)
      storage.getSignedUrl.mockResolvedValue(null)
      const result = await service.getDownloadUrl('company-1', 'file-1')
      expect(result.url).toBe('https://public.url/file')
    })
  })

  describe('update', () => {
    it('should update file visibility', async () => {
      prisma.tenant.file.findFirst.mockResolvedValue(mockFile)
      prisma.tenant.file.update.mockResolvedValue({ ...mockFile, isVisibleToClient: true })
      const result = await service.update('company-1', 'file-1', { isVisibleToClient: true })
      expect(result).toBeDefined()
    })
  })

  describe('remove', () => {
    it('should soft delete and remove from storage', async () => {
      prisma.tenant.file.findFirst.mockResolvedValue(mockFile)
      prisma.tenant.file.update.mockResolvedValue({ ...mockFile, deletedAt: new Date() })
      await service.remove('company-1', 'file-1', 'user-1')
      expect(storage.delete).toHaveBeenCalled()
      expect(prisma.tenant.file.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      )
    })
  })
})
