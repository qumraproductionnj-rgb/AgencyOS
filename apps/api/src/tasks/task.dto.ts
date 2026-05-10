import { z } from 'zod'

export const CreateTaskSchema = z.object({
  projectId: z.string().uuid().optional(),
  parentTaskId: z.string().uuid().optional(),
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  assignedTo: z.string().uuid().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().nonnegative().optional(),
})

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(2000).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedTo: z.string().uuid().optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  estimatedHours: z.number().nonnegative().optional(),
  sortOrder: z.number().int().optional(),
})

export const UpdateTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']),
})

export const CreateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
  mentions: z.array(z.string().uuid()).optional(),
})

export const StartTimerSchema = z.object({
  notes: z.string().max(500).optional(),
})

export const StopTimerSchema = z.object({
  notes: z.string().max(500).optional(),
})

export const TaskQuerySchema = z.object({
  search: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  projectId: z.string().optional(),
  assignedTo: z.string().optional(),
  dueBefore: z.string().optional(),
})

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>
export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>
export type UpdateTaskStatusDto = z.infer<typeof UpdateTaskStatusSchema>
export type CreateCommentDto = z.infer<typeof CreateCommentSchema>
export type StartTimerDto = z.infer<typeof StartTimerSchema>
export type StopTimerDto = z.infer<typeof StopTimerSchema>
