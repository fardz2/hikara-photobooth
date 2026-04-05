import { describe, it, expect } from 'vitest'
import { calculateTotalPrice } from '@/lib/utils/price'
import { PRICELIST, EXTRA_PERSON_PRICE, EXTRA_PRINT_PRICE, ADDONS } from '@/lib/constants/reservation'

const BASE_PRICE = PRICELIST[0].price
const CUSTOM_FRAME_PRICE = ADDONS.find(a => a.id === "custom_frame")?.price || 0

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
    const expected = BASE_PRICE + CUSTOM_FRAME_PRICE
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
                     CUSTOM_FRAME_PRICE
    expect(calculateTotalPrice(input)).toBe(expected)
  })

  it('ignores invalid addon IDs', () => {
    const addons = ['invalid_addon', 'custom_frame']
    const expected = BASE_PRICE + CUSTOM_FRAME_PRICE
    expect(calculateTotalPrice({ addons })).toBe(expected)
  })
})
