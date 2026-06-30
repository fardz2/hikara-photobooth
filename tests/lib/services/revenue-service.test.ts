import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revenueService } from '@/lib/services/revenue-service'
import { createClient } from '@/lib/supabase/server'

const mockPricing = {
  paket_utama: { label: "Paket", price: 35000, maxPeople: 3 },
  extra_person: { label: "Extra Person", price: 5000 },
  extra_print: { label: "Extra Print", price: 10000 },
  custom_frame: { label: "Frame", price: 15000 },
}

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
}))

vi.mock('@/lib/data/pricing', () => ({
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
    mockGetPricing.mockResolvedValue(mockPricing as any)
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
