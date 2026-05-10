import { z } from 'zod'

export const InvoiceLineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  currency: z.string().default('IQD'),
  total: z.number().nonnegative(),
})

export const CreateInvoiceSchema = z.object({
  clientId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  quotationId: z.string().uuid().optional(),
  items: z.array(InvoiceLineItemSchema).min(1),
  currency: z.string().default('IQD'),
  discountPercent: z.number().min(0).max(100).optional(),
  discountAmount: z.number().nonnegative().optional(),
  taxPercent: z.number().min(0).max(100).optional(),
  dueDate: z.string(),
  notes: z.string().max(2000).optional(),
  type: z.enum(['STANDARD', 'RECURRING', 'CREDIT_NOTE']).optional(),
})

export const UpdateInvoiceSchema = z.object({
  items: z.array(InvoiceLineItemSchema).min(1).optional(),
  currency: z.string().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  discountAmount: z.number().nonnegative().optional(),
  taxPercent: z.number().min(0).max(100).optional(),
  dueDate: z.string().optional(),
  notes: z.string().max(2000).optional(),
})

export const UpdateInvoiceStatusSchema = z.object({
  status: z.enum(['SENT', 'CANCELLED', 'REFUNDED', 'OVERDUE']),
})

export const RecordPaymentSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default('IQD'),
  method: z.enum(['cash', 'bank_transfer', 'stripe', 'zaincash', 'fastpay', 'fib', 'other']),
  referenceNo: z.string().max(200).optional(),
  paidAt: z.string(),
  notes: z.string().max(1000).optional(),
})

export type CreateInvoiceDto = z.infer<typeof CreateInvoiceSchema>
export type UpdateInvoiceDto = z.infer<typeof UpdateInvoiceSchema>
export type UpdateInvoiceStatusDto = z.infer<typeof UpdateInvoiceStatusSchema>
export type RecordPaymentDto = z.infer<typeof RecordPaymentSchema>
export type InvoiceLineItem = z.infer<typeof InvoiceLineItemSchema>
