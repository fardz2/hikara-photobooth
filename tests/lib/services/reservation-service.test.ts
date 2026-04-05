import { describe, it, expect, vi, beforeEach } from 'vitest'
import { reservationService } from '@/lib/services/reservation-service'
import { createClient } from '@/lib/supabase/server'

// Mock createClient
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

describe('Reservation Service', () => {
  const mockSupabase = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
  })

  describe('getBookedSlots', () => {
    it('returns array of time strings on success', async () => {
      const mockData = [{ time: '10:00' }, { time: '11:00' }]
      // In getBookedSlots, .in() is the last call in the chain
      mockSupabase.in.mockResolvedValueOnce({ data: mockData, error: null })

      const result = await reservationService.getBookedSlots('2024-03-01')
      expect(result).toEqual(['10:00', '11:00'])
      expect(mockSupabase.eq).toHaveBeenCalledWith('date', '2024-03-01')
      expect(mockSupabase.in).toHaveBeenCalledWith('status', ['pending', 'confirmed'])
    })

    it('throws error on database failure', async () => {
      mockSupabase.in.mockResolvedValueOnce({ data: null, error: new Error('Database failure') })
      await expect(reservationService.getBookedSlots('2024-03-01')).rejects.toThrow('Database failure')
    })
  })

  describe('checkSlotAvailability', () => {
    it('returns true if slot is already occupied', async () => {
      // No excludeId, so .in() is the last call
      mockSupabase.in.mockResolvedValueOnce({ data: [{ id: '123' }], error: null })
      const isBooked = await reservationService.checkSlotAvailability('2024-03-01', '10:00')
      expect(isBooked).toBe(true)
    })

    it('returns false if slot is free', async () => {
      mockSupabase.in.mockResolvedValueOnce({ data: [], error: null })
      const isBooked = await reservationService.checkSlotAvailability('2024-03-01', '10:00')
      expect(isBooked).toBe(false)
    })

    it('respects excludeId when provided', async () => {
      // excludeId provided, so .neq() is the last call
      mockSupabase.neq.mockResolvedValueOnce({ data: [], error: null })
      await reservationService.checkSlotAvailability('2024-03-01', '10:00', 'current-id')
      expect(mockSupabase.neq).toHaveBeenCalledWith('id', 'current-id')
    })

    it('throws error if availability check fails', async () => {
      mockSupabase.in.mockResolvedValueOnce({ data: null, error: new Error('Network error') })
      await expect(reservationService.checkSlotAvailability('2024-03-01', '10:00')).rejects.toThrow('Network error')
    })
  })
})
