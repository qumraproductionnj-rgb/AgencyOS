import { z } from 'zod'

const CATEGORIES = [
  'production',
  'equipment_rental',
  'advertising',
  'freelancer_payment',
  'operational',
  'travel',
  'software',
  'other',
] as const

export const CreateExpenseSchema = z.object({
  employeeId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  category: z.enum(CATEGORIES),
  amount: z.number().positive(),
  currency: z.string().default('IQD'),
  description: z.string().min(1).max(1000),
  receiptUrl: z.string().url().optional(),
  expenseDate: z.string(),
})

export const UpdateExpenseSchema = z.object({
  category: z.enum(CATEGORIES).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().optional(),
  description: z.string().min(1).max(1000).optional(),
  receiptUrl: z.string().url().optional(),
  expenseDate: z.string().optional(),
})

export const ApproveExpenseSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().max(500).optional(),
})

export type CreateExpenseDto = z.infer<typeof CreateExpenseSchema>
export type UpdateExpenseDto = z.infer<typeof UpdateExpenseSchema>
export type ApproveExpenseDto = z.infer<typeof ApproveExpenseSchema>
