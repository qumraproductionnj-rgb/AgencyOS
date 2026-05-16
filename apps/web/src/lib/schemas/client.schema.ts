import { z } from 'zod'

export const ClientSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(150, 'Name too long'),
    nameEn: z.string().max(150).optional(),
    email: z.string().email('Valid email required').optional().or(z.literal('')),
    phone: z.string().max(30).optional(),
    address: z.string().max(300).optional(),
    website: z
      .string()
      .max(200)
      .optional()
      .refine((v) => !v || v.startsWith('http://') || v.startsWith('https://') || v === '', {
        message: 'Website must start with http:// or https://',
      }),
    notes: z.string().max(2000).optional(),
    isVip: z.boolean().default(false),
    isBlacklisted: z.boolean().default(false),
  })
  .refine((d) => !(d.isVip && d.isBlacklisted), {
    message: 'Client cannot be both VIP and blacklisted',
    path: ['isBlacklisted'],
  })

export type ClientFormValues = z.infer<typeof ClientSchema>
