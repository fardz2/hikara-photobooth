import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logTransaction } from '@/lib/actions/revenue-actions'

// Mock Supabase Server Client
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn().mockResolvedValue({ error: null })
  }))
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase))
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

describe('Revenue Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('logs a transaction successfully', async () => {
    const input = {
      package: 'Sesi Foto',
      payment_method: 'tunai' as const,
      amount: 35000,
      extra_people_count: 2
    }

    const result = await logTransaction(input)
    
    expect(result.success).toBe(true)
    expect(mockSupabase.from).toHaveBeenCalledWith('reservations')
  })

  it('returns false when database insert fails', async () => {
    // Override mock for this test
    mockSupabase.from.mockReturnValueOnce({
      insert: vi.fn().mockResolvedValue({ error: { message: 'DB Error' } })
    } as any)

    const result = await logTransaction({
      package: 'Sesi Foto',
      payment_method: 'tunai',
      amount: 35000
    })

    expect(result.success).toBe(false)
    expect(result.message).toBe('DB Error')
  })
})
