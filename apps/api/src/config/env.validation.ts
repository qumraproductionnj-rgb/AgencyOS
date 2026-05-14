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
  TELEGRAM_BOT_USERNAME: z.string().default('AgencyOSBot'),
  TELEGRAM_ADMIN_CHAT_ID: z.string().optional(),

  // Sentry
  SENTRY_DSN: z.string().optional(),

  // Stripe (Phase 4.2)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_API_VERSION: z.string().default('2024-11-20.acacia'),
  STRIPE_MOCK_MODE: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  STRIPE_BILLING_PORTAL_RETURN_URL: z.string().default('http://localhost:3000/settings/billing'),
  STRIPE_CHECKOUT_SUCCESS_URL: z
    .string()
    .default(
      'http://localhost:3000/settings/billing/return?status=success&session_id={CHECKOUT_SESSION_ID}',
    ),
  STRIPE_CHECKOUT_CANCEL_URL: z
    .string()
    .default('http://localhost:3000/settings/billing/return?status=cancelled'),

  // Local Iraqi gateways (Phase 4.3) — mock mode default for dev; sandbox optional
  LOCAL_GATEWAY_MOCK_MODE: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  // Default lifetime of a PaymentIntent before EXPIRED status (minutes)
  PAYMENT_INTENT_TTL_MINUTES: z.coerce.number().default(30),

  // FIB (First Iraqi Bank) — Payment Initiation API
  FIB_BASE_URL: z.string().default('https://fib.stage.fib.iq'),
  FIB_CLIENT_ID: z.string().optional(),
  FIB_CLIENT_SECRET: z.string().optional(),
  FIB_WEBHOOK_SECRET: z.string().optional(),
  FIB_CURRENCY_CODE: z.string().default('IQD'),

  // ZainCash + FastPay — stubs in 4.3, real integration deferred
  ZAINCASH_MERCHANT_ID: z.string().optional(),
  ZAINCASH_MERCHANT_SECRET: z.string().optional(),
  FASTPAY_MERCHANT_ID: z.string().optional(),
  FASTPAY_MERCHANT_SECRET: z.string().optional(),

  // Manual bank transfer — displayed to users in the manual flow UI
  MANUAL_BANK_NAME: z.string().default("Ru'ya for Artistic Production — Iraqi Trade Bank"),
  MANUAL_BANK_ACCOUNT_NUMBER: z.string().default('0000-0000-0000-0000'),
  MANUAL_BANK_IBAN: z.string().default('IQ00 BANK 0000 0000 0000 0000'),
  MANUAL_BANK_SWIFT: z.string().default('IBANIQBA'),

  // Tenant lifecycle (Phase 4.4) — grace periods in days. Defaults match MasterSpec §4.
  LIFECYCLE_GRACE_PAST_DUE_DAYS: z.coerce.number().default(7),
  LIFECYCLE_GRACE_READ_ONLY_DAYS: z.coerce.number().default(14),
  LIFECYCLE_GRACE_SUSPENDED_DAYS: z.coerce.number().default(90),
  // Run the lifecycle sweep cron? Set false for tests.
  LIFECYCLE_CRON_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
})

export type Env = z.infer<typeof envSchema>
