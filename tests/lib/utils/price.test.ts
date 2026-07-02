import { describe, it, expect } from 'vitest'
import { calculateTotalPriceSync, type PriceInput } from '@/lib/utils/price'
import { type PricingItem } from "@/lib/services/pricing-service";

const MOCK_PRICING: PricingItem[] = [
  { id: "pkg1", label: "Foto per Sesi + 2 Photostrip (Maks 3 Orang)", price: 35000, maxQty: 3, note: "MAX. 3 ORANG", category: "package" as const },
  { id: "ext1", label: "Tambahan per Orang", price: 5000, category: "extra" as const },
  { id: "ext2", label: "Extra Print", price: 10000, category: "extra" as const },
  { id: "addon1", label: "Custom Frame Birthday, Dll", price: 15000, category: "addon" as const },
]

const BASE_PRICE = MOCK_PRICING[0].price
const EXTRA_PERSON_PRICE = MOCK_PRICING[1].price
const EXTRA_PRINT_PRICE = MOCK_PRICING[2].price
const CUSTOM_FRAME_PRICE = MOCK_PRICING[3].price

describe('calculateTotalPriceSync', () => {
  it('returns base price when no extras are provided', () => {
    expect(calculateTotalPriceSync({}, MOCK_PRICING)).toBe(BASE_PRICE)
  })

  it('calculates total with extra people via extras map', () => {
    const extras = { ext1: 2 }
    const expected = BASE_PRICE + (2 * EXTRA_PERSON_PRICE)
    expect(calculateTotalPriceSync({ extras }, MOCK_PRICING)).toBe(expected)
  })

  it('calculates total with extra prints via extras map', () => {
    const extras = { ext2: 3 }
    const expected = BASE_PRICE + (3 * EXTRA_PRINT_PRICE)
    expect(calculateTotalPriceSync({ extras }, MOCK_PRICING)).toBe(expected)
  })

  it('calculates total with addons', () => {
    const addons = ['addon1']
    const expected = BASE_PRICE + CUSTOM_FRAME_PRICE
    expect(calculateTotalPriceSync({ addons }, MOCK_PRICING)).toBe(expected)
  })

  it('handles multiple extras and addons together', () => {
    const input: PriceInput = {
      extras: { ext1: 2, ext2: 1 },
      addons: ['addon1'],
    }
    const expected = BASE_PRICE +
                     (2 * EXTRA_PERSON_PRICE) +
                     (1 * EXTRA_PRINT_PRICE) +
                     CUSTOM_FRAME_PRICE
    expect(calculateTotalPriceSync(input, MOCK_PRICING)).toBe(expected)
  })

  it('ignores unknown extra IDs gracefully', () => {
    const input: PriceInput = { extras: { nonexistent: 5 } }
    expect(calculateTotalPriceSync(input, MOCK_PRICING)).toBe(BASE_PRICE)
  })

  it('returns 0 when pricing array is empty', () => {
    expect(calculateTotalPriceSync({}, [])).toBe(0)
  })

  it('uses first package as base when no packageId given', () => {
    const input: PriceInput = { extras: { ext1: 1 } }
    const expected = BASE_PRICE + (1 * EXTRA_PERSON_PRICE)
    expect(calculateTotalPriceSync(input, MOCK_PRICING)).toBe(expected)
  })

  it('uses zero-price package as base (not fallback) when packageId matches a free promo', () => {
    const freePricing: PricingItem[] = [
      { id: "promo", label: "Promo Gratis", price: 0, category: "package" as const },
      { id: "ext1", label: "Tambahan per Orang", price: 5000, category: "extra" as const },
    ]
    const result = calculateTotalPriceSync({ packageId: "promo" }, freePricing)
    expect(result).toBe(0) // NOT 5000 (fallback first package would pick wrong one)
  })

  it('uses ?? operator correctly: first package with explicit 0 price returns 0, not second package', () => {
    const pricing: PricingItem[] = [
      { id: "pkg1", label: "First", price: 0, category: "package" as const },
      { id: "pkg2", label: "Second", price: 50000, category: "package" as const },
    ]
    // No packageId → fallback uses first "package" item → price 0 (not 50000)
    expect(calculateTotalPriceSync({}, pricing)).toBe(0)
  })

  it('returns base price extras=null (not provided) should not crash', () => {
    expect(calculateTotalPriceSync({ extras: undefined }, MOCK_PRICING)).toBe(BASE_PRICE)
  })

  it('returns correct price with specific packageId that exists', () => {
    const result = calculateTotalPriceSync({ packageId: "pkg1" }, MOCK_PRICING)
    expect(result).toBe(BASE_PRICE)
  })

  it('returns fallback base price when specific packageId not found', () => {
    const result = calculateTotalPriceSync({ packageId: "nonexistent" }, MOCK_PRICING)
    // Falls back to first package category item
    expect(result).toBe(BASE_PRICE)
  })

  it('handles extras with mixed known and unknown IDs', () => {
    const result = calculateTotalPriceSync(
      { extras: { ext1: 1, nonexistent: 5, ext2: 2 } },
      MOCK_PRICING,
    )
    const expected = BASE_PRICE + (1 * EXTRA_PERSON_PRICE) + (2 * EXTRA_PRINT_PRICE)
    expect(result).toBe(expected)
  })

  it('handles empty extras Record and empty addons array', () => {
    const result = calculateTotalPriceSync({ extras: {}, addons: [] }, MOCK_PRICING)
    expect(result).toBe(BASE_PRICE)
  })

  it('handles pricing where no package category exists', () => {
    const noPackage: PricingItem[] = [
      { id: "ext1", label: "Extra", price: 5000, category: "extra" as const },
    ]
    const result = calculateTotalPriceSync({ extras: { ext1: 1 } }, noPackage)
    expect(result).toBe(5000) // only extras, no base
  })
})
