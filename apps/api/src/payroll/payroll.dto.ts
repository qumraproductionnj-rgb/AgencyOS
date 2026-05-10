import { z } from 'zod'

export const GeneratePayrollSchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100).optional().default(new Date().getFullYear()),
})

export const UpdateEntrySchema = z.object({
  additions: z.coerce.number().int().optional(),
  deductions: z.coerce.number().int().optional(),
  notes: z.string().max(500).optional(),
})

export const FinalizePayrollSchema = z.object({})

export const PayrollQuerySchema = z.object({
  year: z.coerce.number().int().optional(),
})

export type GeneratePayrollDto = z.infer<typeof GeneratePayrollSchema>
export type UpdateEntryDto = z.infer<typeof UpdateEntrySchema>
