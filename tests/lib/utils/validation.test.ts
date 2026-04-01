import { describe, it, expect } from 'vitest'
import { isValidWhatsApp } from '@/lib/utils/validation'

describe('isValidWhatsApp', () => {
  it('returns true for valid Indonesian numbers starting with 62', () => {
    expect(isValidWhatsApp('628123456789')).toBe(true)
    expect(isValidWhatsApp('62812345678')).toBe(true)
  })

  it('returns false for numbers not starting with 62', () => {
    expect(isValidWhatsApp('08123456789')).toBe(false)
    expect(isValidWhatsApp('8123456789')).toBe(false)
  })

  it('returns false for numbers that are too short', () => {
    expect(isValidWhatsApp('62812')).toBe(false)
  })

  it('returns false for strings containing non-digit characters', () => {
    expect(isValidWhatsApp('62812-3456-789')).toBe(false)
    expect(isValidWhatsApp('62812abc')).toBe(false)
  })

  it('returns false for empty strings', () => {
    expect(isValidWhatsApp('')).toBe(false)
  })
})
