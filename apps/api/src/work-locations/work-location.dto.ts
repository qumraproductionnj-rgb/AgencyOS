import { z } from 'zod'

export const CreateWorkLocationSchema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().int().min(10).max(1000).default(100),
  isActive: z.boolean().default(true),
  employeeIds: z.array(z.string().uuid()).optional(),
})

export const UpdateWorkLocationSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().max(500).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  radiusMeters: z.number().int().min(10).max(1000).optional(),
  isActive: z.boolean().optional(),
  employeeIds: z.array(z.string().uuid()).optional(),
})

export const AssignEmployeesSchema = z.object({
  employeeIds: z.array(z.string().uuid()).min(1),
})

export type CreateWorkLocationDto = z.infer<typeof CreateWorkLocationSchema>
export type UpdateWorkLocationDto = z.infer<typeof UpdateWorkLocationSchema>
export type AssignEmployeesDto = z.infer<typeof AssignEmployeesSchema>
