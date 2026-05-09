import { z } from 'zod'

export const CreateDepartmentSchema = z.object({
  nameAr: z.string().min(1).max(120),
  nameEn: z.string().max(120).optional(),
  description: z.string().max(500).optional(),
  managerUserId: z.string().uuid().optional(),
})

export const UpdateDepartmentSchema = z.object({
  nameAr: z.string().min(1).max(120).optional(),
  nameEn: z.string().max(120).optional(),
  description: z.string().max(500).optional(),
  managerUserId: z.string().uuid().nullable().optional(),
})

export type CreateDepartmentDto = z.infer<typeof CreateDepartmentSchema>
export type UpdateDepartmentDto = z.infer<typeof UpdateDepartmentSchema>
