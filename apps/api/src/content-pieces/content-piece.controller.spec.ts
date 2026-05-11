import { Test } from '@nestjs/testing'
import { ContentPieceController } from './content-piece.controller'
import { ContentPieceService } from './content-piece.service'

interface MockSvc {
  findOne: jest.Mock
  update: jest.Mock
  updateStage: jest.Mock
  findRevisions: jest.Mock
  createRevision: jest.Mock
  updateRevision: jest.Mock
}

const mockUser = {
  sub: 'user-1',
  companyId: 'company-1' as string | null,
  tier: 'TENANT' as const,
  jti: 'jti-1',
}

const mockPiece = {
  id: 'piece-1',
  title: 'منشور توعوي',
  type: 'STATIC_DESIGN',
  stage: 'IDEA',
  platforms: ['instagram'],
  planId: 'plan-1',
  clientId: 'client-1',
  plan: { id: 'plan-1', month: 1, year: 2026, title: 'يناير 2026' },
  client: { id: 'client-1', name: 'عميل', nameEn: null },
  pillar: null,
  project: null,
  revisions: [],
}

const mockRevision = {
  id: 'rev-1',
  companyId: 'company-1',
  contentPieceId: 'piece-1',
  roundNumber: 1,
  feedbackText: 'يرجى تعديل اللون',
  feedbackAnnotations: null,
  attachedFiles: [],
  status: 'PENDING',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  requestedBy: 'user-1',
  resolvedBy: null,
  resolvedAt: null,
  createdBy: 'user-1',
  updatedBy: null,
}

describe('ContentPieceController', () => {
  let controller: ContentPieceController
  let svc: MockSvc

  beforeEach(async () => {
    svc = {
      findOne: jest.fn(),
      update: jest.fn(),
      updateStage: jest.fn(),
      findRevisions: jest.fn(),
      createRevision: jest.fn(),
      updateRevision: jest.fn(),
    }

    const module = await Test.createTestingModule({
      controllers: [ContentPieceController],
      providers: [{ provide: ContentPieceService, useValue: svc }],
    }).compile()

    controller = module.get<ContentPieceController>(ContentPieceController)
  })

  it('GET findOne delegates to service', async () => {
    svc.findOne.mockResolvedValue(mockPiece)
    const result = await controller.findOne('piece-1', mockUser)
    expect(result).toEqual(mockPiece)
    expect(svc.findOne).toHaveBeenCalledWith('company-1', 'piece-1')
  })

  it('PUT update delegates to service', async () => {
    const dto = { captionAr: 'نص جديد' }
    svc.update.mockResolvedValue({ ...mockPiece, ...dto })
    const result = await controller.update('piece-1', dto, mockUser)
    expect(result.captionAr).toBe('نص جديد')
    expect(svc.update).toHaveBeenCalledWith('company-1', 'piece-1', 'user-1', dto)
  })

  it('PATCH updateStage delegates to service', async () => {
    const dto = { stage: 'IN_WRITING' as const }
    svc.updateStage.mockResolvedValue({ ...mockPiece, stage: 'IN_WRITING' })
    const result = await controller.updateStage('piece-1', dto, mockUser)
    expect(result.stage).toBe('IN_WRITING')
    expect(svc.updateStage).toHaveBeenCalledWith('company-1', 'piece-1', 'user-1', dto)
  })

  it('GET findRevisions delegates to service', async () => {
    svc.findRevisions.mockResolvedValue([mockRevision])
    const result = await controller.findRevisions('piece-1', mockUser)
    expect(result).toHaveLength(1)
    expect(svc.findRevisions).toHaveBeenCalledWith('company-1', 'piece-1')
  })

  it('POST createRevision delegates to service', async () => {
    const dto = { roundNumber: 1, feedbackText: 'يرجى التعديل' }
    svc.createRevision.mockResolvedValue(mockRevision)
    const result = await controller.createRevision('piece-1', dto, mockUser)
    expect(result.roundNumber).toBe(1)
    expect(svc.createRevision).toHaveBeenCalledWith('company-1', 'piece-1', 'user-1', dto)
  })

  it('PUT updateRevision delegates to service', async () => {
    const dto = { feedbackText: 'محدث' }
    svc.updateRevision.mockResolvedValue({ ...mockRevision, feedbackText: 'محدث' })
    const result = await controller.updateRevision('piece-1', 'rev-1', dto, mockUser)
    expect(result.feedbackText).toBe('محدث')
    expect(svc.updateRevision).toHaveBeenCalledWith('company-1', 'piece-1', 'rev-1', 'user-1', dto)
  })
})
