import { z } from 'zod'

export const CreateLocalIntentSchema = z.object({
  planKey: z.enum(['starter', 'professional', 'agency']),
  interval: z.enum(['month', 'year']).default('month'),
  provider: z.enum(['fib', 'zaincash', 'fastpay', 'manual_bank_transfer']),
})
export type CreateLocalIntentDto = z.infer<typeof CreateLocalIntentSchema>

export const SubmitManualReceiptSchema = z.object({
  receiptFileId: z.string().uuid('Valid receipt file ID required'),
  bankReference: z.string().min(3, 'Bank reference must be at least 3 characters').max(120),
})
export type SubmitManualReceiptDto = z.infer<typeof SubmitManualReceiptSchema>

export const RejectManualPaymentSchema = z.object({
  reason: z.string().min(3, 'Rejection reason must be at least 3 characters').max(500),
})
export type RejectManualPaymentDto = z.infer<typeof RejectManualPaymentSchema>
