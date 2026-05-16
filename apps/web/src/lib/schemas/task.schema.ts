import { z } from 'zod'

export const TaskSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
    description: z.string().max(3000).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    projectId: z.string().optional(),
    assignedTo: z.string().optional(),
    startDate: z.string().optional(),
    dueDate: z.string().optional(),
    estimatedHours: z.number().min(0).max(9999).optional(),
  })
  .refine(
    (d) => {
      if (!d.startDate || !d.dueDate) return true
      return new Date(d.dueDate) >= new Date(d.startDate)
    },
    { message: 'Due date must be on or after start date', path: ['dueDate'] },
  )

export type TaskFormValues = z.infer<typeof TaskSchema>
