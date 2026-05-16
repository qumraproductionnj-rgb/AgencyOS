import { z } from 'zod'

const QuotationItemSchema = z.object({
  description: z.string().min(1, 'Description required'),
  quantity: z.number().min(0.01, 'Quantity must be > 0'),
  unitPrice: z.number().min(0, 'Price must be positive'),
  currency: z.string().min(1),
  total: z.number(),
})

export const QuotationSchema = z
  .object({
    clientId: z.string().min(1, 'Client is required'),
    currency: z.enum(['IQD', 'USD']),
    items: z.array(QuotationItemSchema).min(1, 'At least one line item is required'),
    discountPercent: z.number().min(0).max(100).optional(),
    taxPercent: z.number().min(0).max(100).optional(),
    validUntil: z.string().optional(),
    notes: z.string().max(2000).optional(),
  })
  .refine(
    (d) => {
      if (!d.validUntil) return true
      return new Date(d.validUntil) > new Date()
    },
    { message: 'Valid until must be a future date', path: ['validUntil'] },
  )
  .refine((d) => d.items.every((i) => i.unitPrice >= 0), {
    message: 'All items must have non-negative prices',
    path: ['items'],
  })

export type QuotationFormValues = z.infer<typeof QuotationSchema>
