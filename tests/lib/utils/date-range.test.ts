import { describe, it, expect, vi } from 'vitest'
import { getDateRangeFromPreset, parseDateRangeParams } from '@/lib/utils/date-range'

describe('Date Range Utility', () => {
  it('identifies today correctly', () => {
    const range = getDateRangeFromPreset('today')
    expect(range.label).toBe('Hari Ini')
    expect(range.from).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('handles month ranges', () => {
    const range = getDateRangeFromPreset('month')
    expect(range.label).toBe('Bulan Ini')
  })

  it('parses search params correctly', () => {
    const range = parseDateRangeParams({ from: '2024-01-01', to: '2024-01-31' })
    expect(range.from).toBe('2024-01-01')
    expect(range.to).toBe('2024-01-31')
  })

  it('defaults to month if no range param given', () => {
    const range = parseDateRangeParams({})
    expect(range.label).toBe('Bulan Ini')
  })

  it('covers future dates with "all" preset', () => {
    const range = getDateRangeFromPreset('all')
    const now = new Date()
    const fiveYearsFromNow = new Date()
    fiveYearsFromNow.setFullYear(now.getFullYear() + 4) // check 4 years to be safe
    
    const toDate = new Date(range.to)
    expect(toDate.getTime()).toBeGreaterThan(fiveYearsFromNow.getTime())
    expect(range.label).toBe('Semua')
  })
})
