import { z } from 'zod'

export const LineItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  currency: z.string().default('IQD'),
  total: z.number().nonnegative(),
})

export const CreateQuotationSchema = z.object({
  clientId: z.string().uuid(),
  dealId: z.string().uuid().optional(),
  items: z.array(LineItemSchema).min(1),
  currency: z.string().default('IQD'),
  discountPercent: z.number().min(0).max(100).optional(),
  discountAmount: z.number().nonnegative().optional(),
  taxPercent: z.number().min(0).max(100).optional(),
  validUntil: z.string().optional(),
  notes: z.string().max(2000).optional(),
})

export const UpdateQuotationSchema = z.object({
  items: z.array(LineItemSchema).min(1).optional(),
  currency: z.string().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  discountAmount: z.number().nonnegative().optional(),
  taxPercent: z.number().min(0).max(100).optional(),
  validUntil: z.string().optional(),
  notes: z.string().max(2000).optional(),
})

export const UpdateQuotationStatusSchema = z.object({
  status: z.enum(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED']),
  rejectionReason: z.string().max(500).optional(),
})

export type CreateQuotationDto = z.infer<typeof CreateQuotationSchema>
export type UpdateQuotationDto = z.infer<typeof UpdateQuotationSchema>
export type UpdateQuotationStatusDto = z.infer<typeof UpdateQuotationStatusSchema>
export type LineItem = z.infer<typeof LineItemSchema>
