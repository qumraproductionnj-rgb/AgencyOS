import { z } from 'zod'

export const CreateExhibitionSchema = z.object({
  name: z.string().min(1).max(300),
  locationAddress: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  startDate: z.string(),
  endDate: z.string(),
  organizingClientId: z.string().uuid().optional().nullable(),
  managerId: z.string().uuid().optional().nullable(),
})

export const UpdateExhibitionSchema = z
  .object({
    name: z.string().min(1).max(300).optional(),
    locationAddress: z.string().max(500).optional(),
    city: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    organizingClientId: z.string().uuid().optional().nullable(),
    managerId: z.string().uuid().optional().nullable(),
  })
  .refine(
    (data) =>
      !(data.startDate && data.endDate && new Date(data.startDate) >= new Date(data.endDate)),
    { message: 'Start date must be before end date', path: ['startDate'] },
  )

export const UpdateExhibitionStatusSchema = z.object({
  status: z.enum(['PLANNING', 'ACTIVE', 'CONCLUDED', 'SETTLED']),
})

export const CreateBoothSchema = z.object({
  brandName: z.string().min(1).max(200),
  brandLogoUrl: z.string().max(500).optional(),
  boothNumber: z.string().max(50).optional(),
  boothSize: z.string().max(100).optional(),
  clientCompanyId: z.string().uuid().optional().nullable(),
  notes: z.string().max(2000).optional(),
})

export const UpdateBoothSchema = z.object({
  brandName: z.string().min(1).max(200).optional(),
  brandLogoUrl: z.string().max(500).optional(),
  boothNumber: z.string().max(50).optional(),
  boothSize: z.string().max(100).optional(),
  clientCompanyId: z.string().uuid().optional().nullable(),
  designStatus: z.enum(['pending', 'designing', 'ready']).optional(),
  setupStatus: z.enum(['pending', 'in_setup', 'live', 'dismantled']).optional(),
  dailyVisitorsCount: z.array(z.object({ date: z.string(), count: z.number().int() })).optional(),
  notes: z.string().max(2000).optional(),
})

export const CreateInventorySchema = z.object({
  itemName: z.string().min(1).max(200),
  category: z.enum(['SIGNAGE', 'GIVEAWAY', 'DISPLAY', 'ELECTRONICS', 'FURNITURE', 'CONSUMABLE']),
  quantitySent: z.number().int().default(0),
  quantityConsumed: z.number().int().default(0),
  quantityReturned: z.number().int().default(0),
  quantityDamaged: z.number().int().default(0),
  unitCost: z.number().int().optional(),
  currency: z.string().max(3).optional().default('IQD'),
  totalCost: z.number().int().optional(),
  notes: z.string().max(2000).optional(),
})

export const UpdateInventorySchema = z.object({
  itemName: z.string().min(1).max(200).optional(),
  category: z
    .enum(['SIGNAGE', 'GIVEAWAY', 'DISPLAY', 'ELECTRONICS', 'FURNITURE', 'CONSUMABLE'])
    .optional(),
  quantitySent: z.number().int().optional(),
  quantityConsumed: z.number().int().optional(),
  quantityReturned: z.number().int().optional(),
  quantityDamaged: z.number().int().optional(),
  unitCost: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  totalCost: z.number().int().optional(),
  notes: z.string().max(2000).optional(),
})

export const CreateFinancialSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.enum([
    'CLIENT_PAYMENT',
    'VENUE_RENTAL',
    'CONSTRUCTION',
    'LOGISTICS',
    'STAFF',
    'CONSUMABLES',
    'FREELANCER',
    'OTHER',
  ]),
  description: z.string().max(500).optional(),
  amount: z.number().int(),
  currency: z.string().max(3).optional().default('IQD'),
  transactionDate: z.string(),
  receiptUrl: z.string().max(500).optional(),
})

export const UpdateFinancialSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']).optional(),
  category: z
    .enum([
      'CLIENT_PAYMENT',
      'VENUE_RENTAL',
      'CONSTRUCTION',
      'LOGISTICS',
      'STAFF',
      'CONSUMABLES',
      'FREELANCER',
      'OTHER',
    ])
    .optional(),
  description: z.string().max(500).optional(),
  amount: z.number().int().optional(),
  currency: z.string().max(3).optional(),
  transactionDate: z.string().optional(),
  receiptUrl: z.string().max(500).optional(),
})

export const ExhibitionQuerySchema = z.object({
  status: z.enum(['PLANNING', 'ACTIVE', 'CONCLUDED', 'SETTLED']).optional(),
  search: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  cursor: z.string().uuid().optional(),
})
