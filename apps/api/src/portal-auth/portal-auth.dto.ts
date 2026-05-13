import { z } from 'zod'

export const PortalLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const PortalRefreshSchema = z.object({
  refreshToken: z.string().min(1),
})

export const PortalForgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const PortalResetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(128),
})

export type PortalLoginDto = z.infer<typeof PortalLoginSchema>
export type PortalRefreshDto = z.infer<typeof PortalRefreshSchema>
export type PortalForgotPasswordDto = z.infer<typeof PortalForgotPasswordSchema>
export type PortalResetPasswordDto = z.infer<typeof PortalResetPasswordSchema>
