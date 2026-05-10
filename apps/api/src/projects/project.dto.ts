import { z } from 'zod'

export const CreateProjectSchema = z.object({
  clientId: z.string().uuid(),
  campaignId: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  nameEn: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  budget: z.number().nonnegative().default(0),
  currency: z.string().default('IQD'),
  startDate: z.string(),
  deadline: z.string(),
})

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  nameEn: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  budget: z.number().nonnegative().optional(),
  currency: z.string().optional(),
  startDate: z.string().optional(),
  deadline: z.string().optional(),
})

export const UpdateProjectStageSchema = z.object({
  stage: z.enum([
    'BRIEF',
    'PLANNING',
    'IN_PROGRESS',
    'REVIEW',
    'COMPLETED',
    'DELIVERED',
    'CANCELLED',
  ]),
})

export const CreateProjectRevisionSchema = z.object({
  notes: z.string().max(1000).optional(),
})

export const CreateProjectDeliverableSchema = z.object({
  name: z.string().min(1).max(200),
  url: z.string().url(),
})

export type CreateProjectDto = z.infer<typeof CreateProjectSchema>
export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>
export type UpdateProjectStageDto = z.infer<typeof UpdateProjectStageSchema>
export type CreateProjectRevisionDto = z.infer<typeof CreateProjectRevisionSchema>
export type CreateProjectDeliverableDto = z.infer<typeof CreateProjectDeliverableSchema>
