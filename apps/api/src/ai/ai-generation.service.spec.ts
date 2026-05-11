import { Test } from '@nestjs/testing'
import { ForbiddenException } from '@nestjs/common'
import { AiGenerationService } from './ai-generation.service'
import { PrismaService } from '../database/prisma.service'

function mockPrisma() {
  return {
    tenant: {
      aiGeneration: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    },
  }
}

const mockGeneration = {
  id: 'gen-1',
  companyId: 'company-1',
  userId: 'user-1',
  contentPieceId: null,
  toolType: 'big_idea_generator',
  frameworkUsed: null,
  inputData: { prompt: 'test' },
  outputData: { content: 'Generated content' },
  modelUsed: 'claude-sonnet-4-6',
  tokensInput: 100,
  tokensOutput: 200,
  costEstimateUsd: 0.0033,
  userRating: null,
  wasUsed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
}

describe('AiGenerationService', () => {
  let service: AiGenerationService
  let prisma: ReturnType<typeof mockPrisma>

  const mockClient = {
    getDefaultModel: jest.fn().mockReturnValue('claude-sonnet-4-6'),
    getPremiumModel: jest.fn().mockReturnValue('claude-opus-4-7'),
    generate: jest.fn(),
  }

  const mockRegistry = {
    get: jest.fn().mockReturnValue(undefined),
    getAll: jest.fn(),
  }

  beforeEach(async () => {
    prisma = mockPrisma()

    const module = await Test.createTestingModule({
      providers: [
        AiGenerationService,
        { provide: PrismaService, useValue: prisma },
        { provide: 'ANTHROPIC_CLIENT', useValue: mockClient },
        { provide: 'PROMPT_REGISTRY', useValue: mockRegistry },
      ],
    }).compile()

    service = module.get<AiGenerationService>(AiGenerationService)
    jest.clearAllMocks()
  })

  describe('generate', () => {
    it('should call AI and log to DB', async () => {
      mockClient.generate.mockResolvedValue({
        content: 'AI response text',
        model: 'claude-sonnet-4-6',
        tokensInput: 50,
        tokensOutput: 100,
        costEstimateUsd: 0.0015,
      })
      prisma.tenant.aiGeneration.count.mockResolvedValue(5)
      prisma.tenant.aiGeneration.create.mockResolvedValue(mockGeneration)

      const result = await service.generate('company-1', 'user-1', {
        toolType: 'big_idea_generator',
        prompt: 'Generate ideas for a brand',
      })

      expect(result.content).toBe('AI response text')
      expect(result.tokensInput).toBe(50)
      expect(prisma.tenant.aiGeneration.count).toHaveBeenCalled()
      expect(prisma.tenant.aiGeneration.create).toHaveBeenCalled()
    })

    it('should log error on AI failure', async () => {
      mockClient.generate.mockRejectedValue(new Error('API timeout'))
      prisma.tenant.aiGeneration.count.mockResolvedValue(5)
      prisma.tenant.aiGeneration.create.mockResolvedValue(mockGeneration)

      await expect(
        service.generate('company-1', 'user-1', {
          toolType: 'big_idea_generator',
          prompt: 'test',
        }),
      ).rejects.toThrow('API timeout')

      expect(prisma.tenant.aiGeneration.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            outputData: expect.objectContaining({ error: 'API timeout' }),
          }),
        }),
      )
    })

    it('should enforce monthly rate limit', async () => {
      prisma.tenant.aiGeneration.count.mockResolvedValue(1000)

      await expect(
        service.generate('company-1', 'user-1', {
          toolType: 'big_idea_generator',
          prompt: 'test',
        }),
      ).rejects.toThrow(ForbiddenException)
    })
  })

  describe('getHistory', () => {
    it('should return paginated history', async () => {
      prisma.tenant.aiGeneration.findMany.mockResolvedValue([mockGeneration])
      const result = await service.getHistory('company-1', 20)
      expect(result.data).toHaveLength(1)
      expect(result.nextCursor).toBeNull()
    })
  })

  describe('markUsed', () => {
    it('should mark generation as used', async () => {
      prisma.tenant.aiGeneration.findFirst.mockResolvedValue(mockGeneration)
      prisma.tenant.aiGeneration.update.mockResolvedValue({ ...mockGeneration, wasUsed: true })
      const result = await service.markUsed('company-1', 'gen-1')
      expect(result).toBeDefined()
    })

    it('should include rating when provided', async () => {
      prisma.tenant.aiGeneration.findFirst.mockResolvedValue(mockGeneration)
      prisma.tenant.aiGeneration.update.mockResolvedValue({
        ...mockGeneration,
        wasUsed: true,
        userRating: 4,
      })
      await service.markUsed('company-1', 'gen-1', 4)
      expect(prisma.tenant.aiGeneration.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ userRating: 4 }),
        }),
      )
    })
  })
})
