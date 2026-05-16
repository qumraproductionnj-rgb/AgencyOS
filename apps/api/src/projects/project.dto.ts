import { z } from 'zod'

export const CreateProjectSchema = z
  .object({
    clientId: z.string().uuid(),
    campaignId: z.string().uuid().optional(),
    name: z.string().min(3, 'Name must be at least 3 characters').max(200),
    nameEn: z.string().max(200).optional(),
    description: z.string().max(2000).optional(),
    budget: z.number().nonnegative().default(0),
    currency: z.enum(['IQD', 'USD']).default('IQD'),
    startDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid start date'),
    deadline: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid deadline'),
  })
  .refine((d) => new Date(d.deadline) > new Date(d.startDate), {
    message: 'Deadline must be after start date',
    path: ['deadline'],
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
