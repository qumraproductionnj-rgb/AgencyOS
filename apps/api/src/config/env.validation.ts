import { z } from 'zod'

export const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT — three separate signing contexts (Phase 1.2)
  JWT_TENANT_PRIVATE_KEY: z.string().optional(),
  JWT_TENANT_PUBLIC_KEY: z.string().optional(),
  JWT_ADMIN_PRIVATE_KEY: z.string().optional(),
  JWT_ADMIN_PUBLIC_KEY: z.string().optional(),
  JWT_EXTERNAL_PRIVATE_KEY: z.string().optional(),
  JWT_EXTERNAL_PUBLIC_KEY: z.string().optional(),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Resend (email)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default('noreply@agencyos.app'),

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_PUBLIC_URL: z.string().optional(),

  // Anthropic (Phase 3)
  ANTHROPIC_API_KEY: z.string().optional(),

  // Telegram (Phase 3)
  TELEGRAM_BOT_TOKEN: z.string().optional(),

  // Sentry
  SENTRY_DSN: z.string().optional(),
})

export type Env = z.infer<typeof envSchema>
