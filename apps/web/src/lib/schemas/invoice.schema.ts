import { z } from 'zod'

const InvoiceItemSchema = z.object({
  description: z.string().min(1, 'Description required'),
  quantity: z.number().min(0.01, 'Quantity must be > 0'),
  unitPrice: z.number().min(0, 'Price must be positive'),
  currency: z.string().min(1),
  total: z.number(),
})

export const InvoiceSchema = z
  .object({
    clientId: z.string().min(1, 'Client is required'),
    currency: z.enum(['IQD', 'USD']),
    items: z
      .array(InvoiceItemSchema)
      .min(1, 'At least one line item is required')
      .refine((items) => items.every((i) => i.unitPrice > 0), 'All items must have a unit price'),
    discountPercent: z.number().min(0).max(100).optional(),
    taxPercent: z.number().min(0).max(100).optional(),
    dueDate: z.string().min(1, 'Due date is required'),
    notes: z.string().max(2000).optional(),
  })
  .refine((d) => new Date(d.dueDate) >= new Date(new Date().toDateString()), {
    message: 'Due date must be today or in the future',
    path: ['dueDate'],
  })
  .refine(
    (d) => {
      const subtotal = d.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0)
      return subtotal > 0
    },
    { message: 'Invoice total must be greater than 0', path: ['items'] },
  )

export type InvoiceFormValues = z.infer<typeof InvoiceSchema>
