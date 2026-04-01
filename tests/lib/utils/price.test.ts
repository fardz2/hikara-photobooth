import { describe, it, expect } from 'vitest'
import { calculateTotalPrice, BASE_PRICE, EXTRA_PERSON_PRICE, EXTRA_PRINT_PRICE, ADDON_PRICES } from '@/lib/utils/price'

describe('calculateTotalPrice', () => {
  it('returns base price when no extras are provided', () => {
    expect(calculateTotalPrice({})).toBe(BASE_PRICE)
  })

  it('calculates total with extra people', () => {
    const extraPeopleCount = 2
    const expected = BASE_PRICE + (extraPeopleCount * EXTRA_PERSON_PRICE)
    expect(calculateTotalPrice({ extraPeopleCount })).toBe(expected)
  })

  it('calculates total with extra prints', () => {
    const extraPrintCount = 3
    const expected = BASE_PRICE + (extraPrintCount * EXTRA_PRINT_PRICE)
    expect(calculateTotalPrice({ extraPrintCount })).toBe(expected)
  })

  it('calculates total with addons', () => {
    const addons = ['custom_frame']
    const expected = BASE_PRICE + ADDON_PRICES.custom_frame
    expect(calculateTotalPrice({ addons })).toBe(expected)
  })

  it('handles multiple extras and addons together', () => {
    const input = {
      extraPeopleCount: 2,
      extraPrintCount: 1,
      addons: ['custom_frame']
    }
    const expected = BASE_PRICE + 
                     (2 * EXTRA_PERSON_PRICE) + 
                     (1 * EXTRA_PRINT_PRICE) + 
                     ADDON_PRICES.custom_frame
    expect(calculateTotalPrice(input)).toBe(expected)
  })

  it('ignores invalid addon IDs', () => {
    const addons = ['invalid_addon', 'custom_frame']
    const expected = BASE_PRICE + ADDON_PRICES.custom_frame
    expect(calculateTotalPrice({ addons })).toBe(expected)
  })
})
