import { z } from 'zod'

export const ContentPieceStageEnum = z.enum([
  'IDEA',
  'IN_WRITING',
  'IN_DESIGN',
  'IN_PRODUCTION',
  'INTERNAL_REVIEW',
  'CLIENT_REVIEW',
  'REVISION',
  'APPROVED',
  'SCHEDULED',
  'PUBLISHED',
  'FAILED',
])

export const ContentPieceTypeEnum = z.enum([
  'VIDEO_LONG',
  'REEL',
  'STORY',
  'STATIC_DESIGN',
  'CAROUSEL',
  'GIF',
  'PODCAST',
  'BLOG_POST',
])

export const RevisionStatusEnum = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED'])

export const VALID_CONTENT_STAGE_TRANSITIONS: Record<string, string[]> = {
  IDEA: ['IN_WRITING', 'IN_DESIGN', 'IN_PRODUCTION'],
  IN_WRITING: ['IN_DESIGN', 'INTERNAL_REVIEW'],
  IN_DESIGN: ['IN_PRODUCTION', 'INTERNAL_REVIEW'],
  IN_PRODUCTION: ['INTERNAL_REVIEW'],
  INTERNAL_REVIEW: ['CLIENT_REVIEW', 'REVISION', 'APPROVED'],
  CLIENT_REVIEW: ['APPROVED', 'REVISION'],
  REVISION: ['IN_WRITING', 'IN_DESIGN', 'IN_PRODUCTION'],
  APPROVED: ['SCHEDULED'],
  SCHEDULED: ['PUBLISHED', 'FAILED'],
  PUBLISHED: [],
  FAILED: [],
}

export const UpdateContentPieceSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  bigIdea: z.string().max(2000).nullable().optional(),
  frameworkUsed: z.string().max(100).nullable().optional(),
  frameworkData: z.record(z.unknown()).nullable().optional(),
  components: z.record(z.unknown()).nullable().optional(),
  captionAr: z.string().max(5000).nullable().optional(),
  captionEn: z.string().max(5000).nullable().optional(),
  hashtags: z.array(z.string().max(100)).max(30).optional(),
  ctaText: z.string().max(500).nullable().optional(),
  ctaLink: z.string().max(2000).nullable().optional(),
  linkedAssets: z.array(z.string().max(100)).optional(),
  inspirationRefs: z.array(z.unknown()).nullable().optional(),
  scheduledAt: z.string().datetime().nullable().optional(),
  platforms: z.array(z.string().max(50)).min(1).optional(),
})

export const UpdateStageSchema = z.object({
  stage: ContentPieceStageEnum,
})

export const CreateRevisionSchema = z.object({
  roundNumber: z.number().int().nonnegative(),
  feedbackText: z.string().max(10000).optional(),
  feedbackAnnotations: z.array(z.unknown()).nullable().optional(),
  attachedFiles: z.array(z.string().max(500)).optional(),
})

export const UpdateRevisionSchema = z.object({
  feedbackText: z.string().max(10000).optional(),
  feedbackAnnotations: z.array(z.unknown()).nullable().optional(),
  status: RevisionStatusEnum.optional(),
})

export type UpdateContentPieceDto = z.infer<typeof UpdateContentPieceSchema>
export type UpdateStageDto = z.infer<typeof UpdateStageSchema>
export type CreateRevisionDto = z.infer<typeof CreateRevisionSchema>
export type UpdateRevisionDto = z.infer<typeof UpdateRevisionSchema>
