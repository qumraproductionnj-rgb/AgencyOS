import { z } from 'zod'

export const ContentPlanStatusEnum = z.enum([
  'DRAFT',
  'IN_REVIEW',
  'APPROVED',
  'ACTIVE',
  'COMPLETED',
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

export const CreateContentPlanSchema = z.object({
  clientId: z.string().uuid(),
  campaignId: z.string().uuid().optional(),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  title: z.string().min(1).max(300).optional(),
})

export const UpdateContentPlanSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  campaignId: z.string().uuid().nullable().optional(),
  monthlyObjectives: z
    .array(z.object({ metric: z.string(), target: z.number(), current: z.number().optional() }))
    .optional(),
  pillarDistribution: z
    .array(z.object({ pillarId: z.string().uuid(), targetCount: z.number().int().nonnegative() }))
    .optional(),
  contentTypeDistribution: z.record(z.string(), z.number().int().nonnegative()).optional(),
  status: ContentPlanStatusEnum.optional(),
})

export const UpdateStatusSchema = z.object({
  status: ContentPlanStatusEnum,
})

export const GenerateIdeasSchema = z.object({
  direction: z.string().max(2000).optional(),
  count: z.number().int().min(1).max(100).optional().default(50),
})

export const ArrangeCalendarSchema = z.object({
  pieces: z.array(
    z.object({
      index: z.number().int().nonnegative(),
      scheduledDay: z.number().int().min(1).max(31),
    }),
  ),
})

export const FinalizePieceSchema = z.object({
  title: z.string().min(1).max(300),
  type: ContentPieceTypeEnum,
  pillarId: z.string().uuid().optional(),
  bigIdea: z.string().max(2000).optional(),
  platforms: z.array(z.string().max(50)).min(1),
  scheduledDay: z.number().int().min(1).max(31),
})

export const FinalizePlanSchema = z.object({
  pieces: z.array(FinalizePieceSchema).min(1).max(100),
})

export const ContentPlanQuerySchema = z.object({
  clientId: z.string().uuid().optional(),
  month: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
  year: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
  status: ContentPlanStatusEnum.optional(),
})

export type CreateContentPlanDto = z.infer<typeof CreateContentPlanSchema>
export type UpdateContentPlanDto = z.infer<typeof UpdateContentPlanSchema>
export type UpdateStatusDto = z.infer<typeof UpdateStatusSchema>
export type GenerateIdeasDto = z.infer<typeof GenerateIdeasSchema>
export type ArrangeCalendarDto = z.infer<typeof ArrangeCalendarSchema>
export type FinalizePieceDto = z.infer<typeof FinalizePieceSchema>
export type FinalizePlanDto = z.infer<typeof FinalizePlanSchema>
export type ContentPlanQueryDto = z.infer<typeof ContentPlanQuerySchema>
