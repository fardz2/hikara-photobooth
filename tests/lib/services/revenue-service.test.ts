import { describe, it, expect, vi, beforeEach } from 'vitest'
import { revenueService } from '@/lib/services/revenue-service'
import { createClient } from '@/lib/supabase/server'

// Mocking to ensure stable utility-based testing
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
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
  })

  it('returns formatted stats when data is available', async () => {
    const mockData = [
      { 
        total_price: 35000, 
        payment_method: 'qris_manual', 
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
    expect(result?.breakdown.qris_manual).toBe(35000)
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
