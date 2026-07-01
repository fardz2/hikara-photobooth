import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as revenueService from "@/lib/services/revenue-service";
import { createClient } from '@/lib/supabase/server'
import type { PricingItem } from "@/lib/services/pricing-service";

const mockPricing: PricingItem[] = [
  { label: "Foto per Sesi + 2 Photostrip (Maks 3 Orang)", price: 35000, maxPeople: 3, category: "package" as const },
  { label: "Tambahan per Orang", price: 5000, category: "extra" as const },
  { label: "Extra Print", price: 10000, category: "extra" as const },
  { label: "Custom Frame Birthday, Dll", price: 15000, category: "addon" as const },
]

const { mockGetPricing } = vi.hoisted(() => ({
  mockGetPricing: vi.fn(),
}))

// Mocking to ensure stable utility-based testing
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  revalidateTag: vi.fn(),
}))

vi.mock('@/lib/services/pricing-service', () => ({
  getPricing: mockGetPricing,
}))

describe('Revenue Service', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    mockGetPricing.mockResolvedValue(mockPricing)
  })

  it('returns formatted stats when data is available', async () => {
    const mockData = [
      { 
        total_price: 35000, 
        payment_method: 'qris',
        date: '2024-03-01',
        extra_print_count: 0,
        extra_people_count: 0
      },
      { 
        total_price: 35000, 
        payment_method: 'tunai', 
        date: '2024-03-01',
        extra_print_count: 0,
        extra_people_count: 0
      },
    ]
    
    // Simulate successful Supabase call
    mockSupabase.eq.mockResolvedValueOnce({ data: mockData, error: null })

    const result = await revenueService.getRevenueStats('2024-03-01', '2024-03-01')

    expect(result).not.toBeNull()
    expect(result?.total).toBe(70000)
    expect(result?.breakdown.qris).toBe(35000)
    expect(result?.breakdown.tunai).toBe(35000)
  })

  it('returns null on database error', async () => {
    mockSupabase.eq.mockResolvedValueOnce({ data: null, error: { message: 'Error' } })

    const result = await revenueService.getRevenueStats('2024-03-01', '2024-03-01')
    expect(result).toBeNull()
  })

  it('returns zero-stats if no rows found', async () => {
    mockSupabase.eq.mockResolvedValueOnce({ data: [], error: null })
    
    const result = await revenueService.getRevenueStats('2024-03-01', '2024-03-01')
    expect(result?.total).toBe(0)
    expect(result?.transactionCount).toBe(0)
  })
})
