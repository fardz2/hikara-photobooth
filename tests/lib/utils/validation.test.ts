import { describe, it, expect } from 'vitest'
import { isValidWhatsApp, normalizePhoneNumber } from '@/lib/utils/validation'

describe('isValidWhatsApp', () => {
  it.each([
    '6281234567890',
    '62812345678',
    '628123456789',    // 10 digits after 62
    '6281234567',      // 8 digits after 62 (minimum in [2-9] + 7 digits)
    '62899999999999',  // 12 digits after 62 (max)
  ])('returns true for valid number %s', (phone) => {
    expect(isValidWhatsApp(phone)).toBe(true)
  })

  it.each([
    '6281234567890123', // 14 digits after 62 > 12 max
    '620123456789',    // 0 after 62 (digit 0 not in [2-9])
    '621123456789',    // 1 after 62 (digit 1 not in [2-9])
    '08123456789',     // starts with 08, not 62
    '1234567890',      // wrong prefix
    'abcdef',          // non-digits
    '628',             // too short
    '',                // empty
    '62812345678901234', // too long (>16 chars)
  ])('returns false for invalid number %s', (phone) => {
    expect(isValidWhatsApp(phone)).toBe(false)
  })
})

describe('normalizePhoneNumber', () => {
  it('normalizes 08xxx → 628xxx', () => {
    expect(normalizePhoneNumber('08123456789')).toBe('628123456789')
  })

  it('normalizes 8xxx → 628xxx', () => {
    expect(normalizePhoneNumber('8123456789')).toBe('628123456789')
  })

  it('normalizes 6208xxx → 628xxx', () => {
    expect(normalizePhoneNumber('6208123456789')).toBe('628123456789')
  })

  it('keeps 628xxx as-is', () => {
    expect(normalizePhoneNumber('628123456789')).toBe('628123456789')
  })

  it('strips non-digit characters', () => {
    expect(normalizePhoneNumber('+62 812-345-6789')).toBe('628123456789')
  })

  it('handles empty string', () => {
    expect(normalizePhoneNumber('')).toBe('')
  })

  it('preserves already-clean 628 number', () => {
    expect(normalizePhoneNumber('6289999999999')).toBe('6289999999999')
  })

  it('handles 620 prefix without 8 (no transform applies)', () => {
    // 620123456789 → doesn't match 08/8/6208 prefix → kept as-is
    expect(normalizePhoneNumber('620123456789')).toBe('620123456789')
  })
})
