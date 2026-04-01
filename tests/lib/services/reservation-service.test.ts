import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reservationService } from '@/lib/services/reservation-service'
import { createClient } from '@/lib/supabase/server'

// Mocking to ensure stable utility-based testing
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('Reservation Service', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
  })

  describe('getBookedSlots', () => {
    it('returns array of time strings on success', async () => {
      const mockData = [{ time: '10:00' }, { time: '11:00' }]
      mockSupabase.neq.mockResolvedValueOnce({ data: mockData, error: null })

      const result = await reservationService.getBookedSlots('2024-03-01')
      expect(result).toEqual(['10:00', '11:00'])
      expect(mockSupabase.eq).toHaveBeenCalledWith('date', '2024-03-01')
    })

    it('throws error on database failure', async () => {
      mockSupabase.neq.mockResolvedValueOnce({ data: null, error: { message: 'Database failure' } })
      await expect(reservationService.getBookedSlots('2024-03-01')).rejects.toThrow('Database failure')
    })
  })

  describe('checkSlotAvailability', () => {
    it('returns true if slot is already occupied', async () => {
      mockSupabase.neq.mockResolvedValueOnce({ data: [{ id: '123' }], error: null })
      const isBooked = await reservationService.checkSlotAvailability('2024-03-01', '10:00')
      expect(isBooked).toBe(true)
    })

    it('returns false if slot is free', async () => {
      mockSupabase.neq.mockResolvedValueOnce({ data: [], error: null })
      const isBooked = await reservationService.checkSlotAvailability('2024-03-01', '10:00')
      expect(isBooked).toBe(false)
    })

    it('throws error if availability check fails', async () => {
      mockSupabase.neq.mockResolvedValueOnce({ data: null, error: { message: 'Network error' } })
      await expect(reservationService.checkSlotAvailability('2024-03-01', '10:00')).rejects.toThrow('Network error')
    })
  })
})
