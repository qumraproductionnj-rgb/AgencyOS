// AgencyOS Shared Package
// Types, constants, and utilities shared across apps and packages

// ---- Constants ----
export const SUPPORTED_LOCALES = ['ar', 'en'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'ar'

export const SUPPORTED_CURRENCIES = ['IQD', 'USD'] as const
export type Currency = (typeof SUPPORTED_CURRENCIES)[number]
export const DEFAULT_CURRENCY: Currency = 'IQD'

export const DEFAULT_TIMEZONE = 'Asia/Baghdad'

// ---- User Tiers ----
export const USER_TIERS = ['PLATFORM_ADMIN', 'TENANT', 'EXTERNAL'] as const
export type UserTier = (typeof USER_TIERS)[number]

// ---- Tenant Roles ----
export const TENANT_ROLES = [
  'owner',
  'admin',
  'hr_manager',
  'project_manager',
  'creative_director',
  'designer',
  'video_editor',
  'account_manager',
  'sales',
  'freelancer',
  'client',
] as const
export type TenantRole = (typeof TENANT_ROLES)[number]

// ---- Standard API Response ----
export interface ApiResponse<T> {
  data: T
  meta?: {
    cursor?: string
    limit?: number
    total?: number
  }
}

export interface ApiError {
  type: string
  title: string
  status: number
  detail: string
  instance?: string
}

// ---- Pagination ----
export interface PaginationParams {
  cursor?: string
  limit?: number
}

// ---- Soft Delete ----
export interface SoftDeletable {
  deletedAt: Date | null
}

// ---- Standard Tenant Entity ----
export interface TenantEntity extends SoftDeletable {
  id: string
  companyId: string
  createdAt: Date
  updatedAt: Date
  createdBy?: string | null
  updatedBy?: string | null
}

// ---- Money ----
// Always store as integer (lowest unit) + currency code
export interface Money {
  amount: number // fils for IQD, cents for USD
  currency: Currency
}

// ---- Utils ----
export function formatMoney(money: Money, locale: Locale = 'ar'): string {
  const formatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-IQ' : 'en-US', {
    style: 'currency',
    currency: money.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  // Convert from lowest unit
  const amount = money.currency === 'IQD' ? money.amount / 1000 : money.amount / 100
  return formatter.format(amount)
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

// ---- Content Frameworks ----
export { FRAMEWORKS } from './frameworks'
export type { Framework, FrameworkField, ContentFormat, ContentObjective } from './frameworks'
