import { z } from 'zod'

export const ProjectSchema = z
  .object({
    clientId: z.string().min(1, 'Client is required'),
    campaignId: z.string().optional(),
    name: z.string().min(3, 'Name must be at least 3 characters').max(100, 'Name too long'),
    nameEn: z.string().max(100).optional(),
    description: z.string().max(2000).optional(),
    budget: z
      .number({ invalid_type_error: 'Budget must be a number' })
      .min(0, 'Budget must be positive'),
    currency: z.enum(['IQD', 'USD']),
    startDate: z.string().min(1, 'Start date is required'),
    deadline: z.string().min(1, 'Deadline is required'),
  })
  .refine(
    (d) => {
      if (!d.startDate || !d.deadline) return true
      return new Date(d.deadline) > new Date(d.startDate)
    },
    { message: 'Deadline must be after start date', path: ['deadline'] },
  )

export type ProjectFormValues = z.infer<typeof ProjectSchema>
