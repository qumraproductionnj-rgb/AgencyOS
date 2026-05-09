import { z } from 'zod'

const CompanyProfileSchema = z.object({
  name: z.string().min(2).max(120),
  nameEn: z.string().min(2).max(120).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  phone: z.string().max(30).optional(),
  website: z.string().url().optional().or(z.literal('')),
})

const WorkLocationSchema = z.object({
  name: z.string().min(2).max(120),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusMeters: z.number().int().min(10).max(1000).default(100),
})

const DepartmentSchema = z.object({
  nameAr: z.string().min(1).max(120),
  nameEn: z.string().max(120).optional(),
})

const EmployeeInviteSchema = z.object({
  email: z.string().email(),
  fullNameAr: z.string().min(2).max(120),
  fullNameEn: z.string().max(120).optional(),
})

export const SaveProgressSchema = z.object({
  currentStep: z.number().int().min(1).max(5),
  data: z.object({
    companyProfile: CompanyProfileSchema.optional(),
    workLocation: WorkLocationSchema.optional(),
    departments: z.array(DepartmentSchema).optional(),
    employees: z.array(EmployeeInviteSchema).optional(),
    selectedPlan: z.string().optional(),
  }),
})

export type SaveProgressDto = z.infer<typeof SaveProgressSchema>
