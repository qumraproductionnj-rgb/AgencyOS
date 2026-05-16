import { z } from 'zod'

const IRAQ_PHONE_RE = /^(\+964|00964|0)[5-9]\d{8}$/

export const EmployeeSchema = z.object({
  fullNameAr: z
    .string()
    .min(3, 'Arabic name must be at least 3 characters')
    .max(100, 'Name too long')
    .regex(/[؀-ۿ]/, 'Must contain Arabic characters'),
  fullNameEn: z.string().max(100).optional(),
  email: z.string().email('Valid email required').toLowerCase(),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || IRAQ_PHONE_RE.test(v), {
      message: 'Phone must be Iraqi format (+964...)',
    }),
  position: z.string().max(100).optional(),
  departmentId: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'INTERN']).optional(),
  baseSalary: z.number().min(0, 'Salary must be positive').optional(),
  salaryCurrency: z.enum(['IQD', 'USD']).optional(),
})

export type EmployeeFormValues = z.infer<typeof EmployeeSchema>
