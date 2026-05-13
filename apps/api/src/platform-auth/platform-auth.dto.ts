import { z } from 'zod'

export const PlatformLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})
export type PlatformLoginDto = z.infer<typeof PlatformLoginSchema>

export const PlatformRefreshSchema = z.object({
  refreshToken: z.string().min(1),
})
export type PlatformRefreshDto = z.infer<typeof PlatformRefreshSchema>
