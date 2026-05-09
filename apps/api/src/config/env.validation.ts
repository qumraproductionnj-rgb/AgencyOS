import { z } from 'zod'

export const envSchema = z.object({
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),

  // Database — owner role; for migrations + auth flows + cross-tenant ops
  DATABASE_URL: z.string().url(),
  // App role; RLS-enforced; for tenant-scoped queries
  APP_DATABASE_URL: z.string().url(),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT — three separate signing contexts. Tier 2 (TENANT) is required for Phase 1.2.
  JWT_TENANT_PRIVATE_KEY: z.string().min(1, 'JWT_TENANT_PRIVATE_KEY required (base64 PEM)'),
  JWT_TENANT_PUBLIC_KEY: z.string().min(1, 'JWT_TENANT_PUBLIC_KEY required (base64 PEM)'),
  JWT_PLATFORM_PRIVATE_KEY: z.string().optional(),
  JWT_PLATFORM_PUBLIC_KEY: z.string().optional(),
  JWT_EXTERNAL_PRIVATE_KEY: z.string().optional(),
  JWT_EXTERNAL_PUBLIC_KEY: z.string().optional(),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Email (auth flows)
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),

  // App URL — used for verification and reset links
  APP_URL: z.string().default('http://localhost:3000'),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Resend (email)
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default('noreply@agencyos.app'),
  EMAIL_FROM_NAME: z.string().default('AgencyOS'),

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
