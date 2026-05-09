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

export const OverrideSchema = z.object({
  status: z.enum(['PRESENT', 'LATE', 'ABSENT', 'REMOTE', 'MANUAL_OVERRIDE']),
  reason: z.string().min(1).max(500),
  date: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date')
    .optional(),
})

export type CheckInDto = z.infer<typeof CheckInSchema>
export type CheckOutDto = z.infer<typeof CheckOutSchema>
export type OverrideDto = z.infer<typeof OverrideSchema>
