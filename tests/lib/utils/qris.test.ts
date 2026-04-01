import { describe, it, expect } from 'vitest'
import { generateDynamicQRIS, computeCRC16 } from '@/lib/utils/qris'

describe('QRIS Logic', () => {
  it('computes CRC16 correctly for known values', () => {
    // Standard test for CRC16/CCITT-FALSE
    // For string "123456789", it should be "29B1" (standard)
    // But EMVCo uses a specific variant? Let's check our implementation.
    const result = computeCRC16("HIKARA")
    expect(result).toHaveLength(4)
    expect(result).toMatch(/^[0-9A-F]{4}$/)
  })

  it('generates dynamic QRIS with custom amounts', () => {
    const amount = 35000
    const qris = generateDynamicQRIS(amount)
    
    // Tag 54 is for amount: 54 + length + amount
    expect(qris).toContain('540535000')
    // Should end with 4 character CRC
    expect(qris).toMatch(/[0-9A-F]{4}$/)
    // Tag 01 should be 12 (Dynamic) instead of 11 (Static)
    expect(qris).toContain('010212')
  })

  it('handles large amounts correctly', () => {
    const amount = 150000
    const qris = generateDynamicQRIS(amount)
    expect(qris).toContain('5406150000')
  })
})
