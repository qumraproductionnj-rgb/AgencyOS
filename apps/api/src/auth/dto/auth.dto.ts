import { z } from 'zod'

const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .refine((p) => /[a-z]/.test(p), 'Password must contain a lowercase letter')
  .refine((p) => /[A-Z]/.test(p), 'Password must contain an uppercase letter')
  .refine((p) => /\d/.test(p), 'Password must contain a digit')
  .refine((p) => /[^A-Za-z0-9]/.test(p), 'Password must contain a special character')

const slugSchema = z
  .string()
  .min(2)
  .max(40)
  .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with dashes only')

const localeSchema = z.enum(['ar', 'en']).default('ar')

export const SignupSchema = z.object({
  company: z.object({
    name: z.string().min(2).max(120),
    slug: slugSchema,
  }),
  owner: z.object({
    email: z.string().email().toLowerCase(),
    password: passwordSchema,
    fullNameAr: z.string().min(2).max(120),
    fullNameEn: z.string().min(2).max(120).optional(),
    preferredLanguage: localeSchema,
    timezone: z.string().default('Asia/Baghdad'),
  }),
})
export type SignupDto = z.infer<typeof SignupSchema>

export const LoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1),
})
export type LoginDto = z.infer<typeof LoginSchema>

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1),
})
export type RefreshDto = z.infer<typeof RefreshSchema>

export const LogoutSchema = z.object({
  refreshToken: z.string().min(1),
})
export type LogoutDto = z.infer<typeof LogoutSchema>

export const VerifyEmailSchema = z.object({
  token: z.string().min(1),
})
export type VerifyEmailDto = z.infer<typeof VerifyEmailSchema>

export const ForgotPasswordSchema = z.object({
  email: z.string().email().toLowerCase(),
})
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>

export const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: passwordSchema,
})
export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>
