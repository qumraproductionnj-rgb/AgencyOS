import { z } from 'zod'

export const SetRateSchema = z.object({
  fromCurrency: z.string().length(3).toUpperCase(),
  toCurrency: z.string().length(3).toUpperCase(),
  rate: z.number().positive(),
  validFrom: z.string().optional(),
})

export const UpdateRateSchema = z.object({
  rate: z.number().positive(),
})

export type SetRateDto = z.infer<typeof SetRateSchema>
export type UpdateRateDto = z.infer<typeof UpdateRateSchema>
