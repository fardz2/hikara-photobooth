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
})
