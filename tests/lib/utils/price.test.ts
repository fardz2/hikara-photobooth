import { describe, it, expect } from 'vitest'
import { calculateTotalPriceSync, type PriceInput } from '@/lib/utils/price'
import type { PricingDict } from '@/lib/data/pricing'

const MOCK_PRICING: PricingDict = {
  paket_utama: { label: "Paket Utama", price: 35000, maxPeople: 3, note: "MAX. 3 ORANG" },
  extra_person: { label: "Tambahan per Orang", price: 5000 },
  extra_print: { label: "Extra Print", price: 10000 },
  custom_frame: { label: "Custom Frame Birthday, Dll", price: 15000 },
}

const BASE_PRICE = MOCK_PRICING.paket_utama.price
const EXTRA_PERSON_PRICE = MOCK_PRICING.extra_person.price
const EXTRA_PRINT_PRICE = MOCK_PRICING.extra_print.price
const CUSTOM_FRAME_PRICE = MOCK_PRICING.custom_frame.price

describe('calculateTotalPriceSync', () => {
  it('returns base price when no extras are provided', () => {
    expect(calculateTotalPriceSync({}, MOCK_PRICING)).toBe(BASE_PRICE)
  })

  it('calculates total with extra people', () => {
    const extraPeopleCount = 2
    const expected = BASE_PRICE + (extraPeopleCount * EXTRA_PERSON_PRICE)
    expect(calculateTotalPriceSync({ extraPeopleCount }, MOCK_PRICING)).toBe(expected)
  })

  it('calculates total with extra prints', () => {
    const extraPrintCount = 3
    const expected = BASE_PRICE + (extraPrintCount * EXTRA_PRINT_PRICE)
    expect(calculateTotalPriceSync({ extraPrintCount }, MOCK_PRICING)).toBe(expected)
  })

  it('calculates total with addons', () => {
    const addons = ['custom_frame']
    const expected = BASE_PRICE + CUSTOM_FRAME_PRICE
    expect(calculateTotalPriceSync({ addons }, MOCK_PRICING)).toBe(expected)
  })

  it('handles multiple extras and addons together', () => {
    const input: PriceInput = {
      extraPeopleCount: 2,
      extraPrintCount: 1,
      addons: ['custom_frame']
    }
    const expected = BASE_PRICE + 
                     (2 * EXTRA_PERSON_PRICE) + 
                     (1 * EXTRA_PRINT_PRICE) + 
                     CUSTOM_FRAME_PRICE
    expect(calculateTotalPriceSync(input, MOCK_PRICING)).toBe(expected)
  })

  it('falls back to default prices when pricing dict is missing items', () => {
    const partialPricing: PricingDict = {
      paket_utama: { label: "Test", price: 10000, maxPeople: 1 },
    }
    // Missing extra_person -> fallback to 5000, missing extra_print -> 10000
    const expected = 10000 + (1 * 5000) + (2 * 10000)
    expect(calculateTotalPriceSync({
      extraPeopleCount: 1,
      extraPrintCount: 2,
    }, partialPricing)).toBe(expected)
  })
})
