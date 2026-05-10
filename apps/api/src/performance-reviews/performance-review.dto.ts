import { z } from 'zod'

export const KpiSchema = z.object({
  name: z.string().min(1).max(200),
  score: z.number().min(0).max(10),
  weight: z.number().min(0).max(100).optional().default(1),
  comment: z.string().max(500).optional(),
})

export const CreatePerformanceReviewSchema = z.object({
  employeeId: z.string().uuid(),
  reviewDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  kpis: z.array(KpiSchema).min(1).max(20),
  strengths: z.string().max(2000).optional(),
  improvements: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
})

export const UpdatePerformanceReviewSchema = z.object({
  reviewDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date')
    .optional(),
  kpis: z.array(KpiSchema).min(1).max(20).optional(),
  strengths: z.string().max(2000).optional(),
  improvements: z.string().max(2000).optional(),
  notes: z.string().max(2000).optional(),
})

export type CreatePerformanceReviewDto = z.infer<typeof CreatePerformanceReviewSchema>
export type UpdatePerformanceReviewDto = z.infer<typeof UpdatePerformanceReviewSchema>
