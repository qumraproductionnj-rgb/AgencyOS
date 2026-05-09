import { z } from 'zod'

export const CheckInSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  deviceInfo: z.record(z.unknown()).optional(),
})

export const CheckOutSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
})

export type CheckInDto = z.infer<typeof CheckInSchema>
export type CheckOutDto = z.infer<typeof CheckOutSchema>
