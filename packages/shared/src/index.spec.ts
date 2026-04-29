import { describe, it, expect } from 'vitest'
import { formatMoney, isNonEmptyString, DEFAULT_LOCALE, DEFAULT_CURRENCY } from './index'

describe('shared/formatMoney', () => {
  it('formats IQD correctly', () => {
    const result = formatMoney({ amount: 5_000_000_000, currency: 'IQD' }, 'en')
    expect(result).toContain('5,000,000')
  })

  it('formats USD correctly', () => {
    const result = formatMoney({ amount: 10000, currency: 'USD' }, 'en')
    expect(result).toContain('100')
  })
})

describe('shared/isNonEmptyString', () => {
  it('returns true for non-empty strings', () => {
    expect(isNonEmptyString('hello')).toBe(true)
  })

  it('returns false for empty strings', () => {
    expect(isNonEmptyString('')).toBe(false)
    expect(isNonEmptyString('   ')).toBe(false)
  })

  it('returns false for non-strings', () => {
    expect(isNonEmptyString(42)).toBe(false)
    expect(isNonEmptyString(null)).toBe(false)
    expect(isNonEmptyString(undefined)).toBe(false)
  })
})

describe('shared/constants', () => {
  it('default locale is Arabic', () => {
    expect(DEFAULT_LOCALE).toBe('ar')
  })

  it('default currency is IQD', () => {
    expect(DEFAULT_CURRENCY).toBe('IQD')
  })
})
