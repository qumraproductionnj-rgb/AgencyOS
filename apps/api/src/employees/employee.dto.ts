import { z } from 'zod'

export const CreateEmployeeSchema = z.object({
  fullNameAr: z.string().min(2).max(120),
  fullNameEn: z.string().max(120).optional(),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  nationalId: z.string().max(50).optional(),
  position: z.string().max(120).optional(),
  departmentId: z.string().uuid().optional(),
  employmentType: z
    .enum(['FULL_TIME', 'PART_TIME', 'FREELANCER', 'INTERN', 'CONTRACT'])
    .default('FULL_TIME'),
  salaryAmount: z.number().int().min(0).default(0),
  salaryCurrency: z.string().default('IQD'),
  salaryType: z.enum(['MONTHLY', 'DAILY', 'HOURLY', 'PER_PROJECT']).default('MONTHLY'),
  startDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  scheduledStartTime: z.string().default('09:00'),
  scheduledEndTime: z.string().default('17:00'),
  weeklyOffDays: z.array(z.string()).default(['Friday', 'Saturday']),
  notesInternal: z.string().max(1000).optional(),
})

export const UpdateEmployeeSchema = z.object({
  fullNameAr: z.string().min(2).max(120).optional(),
  fullNameEn: z.string().max(120).optional(),
  phone: z.string().max(30).optional(),
  nationalId: z.string().max(50).optional(),
  position: z.string().max(120).optional(),
  departmentId: z.string().uuid().nullable().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'FREELANCER', 'INTERN', 'CONTRACT']).optional(),
  salaryAmount: z.number().int().min(0).optional(),
  salaryCurrency: z.string().optional(),
  salaryType: z.enum(['MONTHLY', 'DAILY', 'HOURLY', 'PER_PROJECT']).optional(),
  startDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date')
    .optional(),
  endDate: z.string().nullable().optional(),
  scheduledStartTime: z.string().optional(),
  scheduledEndTime: z.string().optional(),
  weeklyOffDays: z.array(z.string()).optional(),
  status: z.enum(['ACTIVE', 'ON_LEAVE', 'TERMINATED', 'SUSPENDED']).optional(),
  notesInternal: z.string().max(1000).nullable().optional(),
})

export const AcceptInviteSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
})

export type CreateEmployeeDto = z.infer<typeof CreateEmployeeSchema>
export type UpdateEmployeeDto = z.infer<typeof UpdateEmployeeSchema>
export type AcceptInviteDto = z.infer<typeof AcceptInviteSchema>
