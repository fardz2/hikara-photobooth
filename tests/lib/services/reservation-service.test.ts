import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as reservationService from "@/lib/services/reservation-service"
import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/supabase/public', () => ({ createPublicClient: vi.fn() }))
vi.mock('next/cache', async (importOriginal) => {
  const actual = await importOriginal() as any
  return { ...actual, cacheLife: vi.fn(), cacheTag: vi.fn() }
})

describe('Reservation Service', () => {
  // chainable mock builder
  function chainMock(terminalResult: any) {
    const m: any = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(terminalResult),
      delete: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
    }
    // Make terminal methods (no chaining) return result
    m.range.mockResolvedValue(terminalResult)
    return m
  }

  describe('getBookedSlots', () => {
    let mockSupabase: ReturnType<typeof chainMock>

    beforeEach(() => {
      vi.clearAllMocks()
      mockSupabase = chainMock({ data: null, error: null })
      vi.mocked(createPublicClient).mockReturnValue(mockSupabase as any)
    })

    it('returns array of time strings on success', async () => {
      mockSupabase.eq.mockResolvedValueOnce({ data: [{ time: '14:00' }, { time: '15:30' }], error: null })
      const result = await reservationService.getBookedSlots('2024-03-01')
      expect(result).toEqual(['14:00', '15:30'])
      expect(mockSupabase.from).toHaveBeenCalledWith('booked_slots')
      expect(mockSupabase.select).toHaveBeenCalledWith('time')
      expect(mockSupabase.eq).toHaveBeenCalledWith('date', '2024-03-01')
    })

    it('returns empty array when no bookings', async () => {
      mockSupabase.eq.mockResolvedValueOnce({ data: [], error: null })
      const result = await reservationService.getBookedSlots('2024-12-25')
      expect(result).toEqual([])
    })

    it('throws error on database failure', async () => {
      mockSupabase.eq.mockResolvedValueOnce({ data: null, error: new Error('Database failure') })
      await expect(reservationService.getBookedSlots('2024-03-01')).rejects.toThrow('Database failure')
    })
  })

  describe('checkSlotAvailability', () => {
    let mockSupabase: ReturnType<typeof chainMock>

    beforeEach(() => {
      vi.clearAllMocks()
      mockSupabase = chainMock({ data: null, error: null })
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    })

    it('returns true if slot is already occupied', async () => {
      mockSupabase.in.mockResolvedValueOnce({ data: [{ id: '123' }], error: null })
      const isBooked = await reservationService.checkSlotAvailability('2024-03-01', '14:00')
      expect(isBooked).toBe(true)
    })

    it('returns false if slot is free', async () => {
      mockSupabase.in.mockResolvedValueOnce({ data: [], error: null })
      const isBooked = await reservationService.checkSlotAvailability('2024-03-01', '14:00')
      expect(isBooked).toBe(false)
    })

    it('returns false if data is null', async () => {
      mockSupabase.in.mockResolvedValueOnce({ data: null, error: null })
      const isBooked = await reservationService.checkSlotAvailability('2024-03-01', '14:00')
      // null && null.length > 0 → null (falsy)
      expect(!!isBooked).toBe(false)
    })

    it('respects excludeId when provided', async () => {
      mockSupabase.neq.mockResolvedValueOnce({ data: [], error: null })
      await reservationService.checkSlotAvailability('2024-03-01', '14:00', 'current-id')
      expect(mockSupabase.neq).toHaveBeenCalledWith('id', 'current-id')
    })

    it('throws error if availability check fails', async () => {
      mockSupabase.in.mockResolvedValueOnce({ data: null, error: new Error('Network error') })
      await expect(reservationService.checkSlotAvailability('2024-03-01', '14:00')).rejects.toThrow('Network error')
    })

    it('checks correct status filters (pending, confirmed)', async () => {
      mockSupabase.in.mockResolvedValueOnce({ data: [], error: null })
      await reservationService.checkSlotAvailability('2024-03-01', '14:00')
      expect(mockSupabase.in).toHaveBeenCalledWith('status', ['pending', 'confirmed'])
    })
  })

  describe('getReservationById', () => {
    let mockSupabase: ReturnType<typeof chainMock>

    beforeEach(() => {
      vi.clearAllMocks()
      mockSupabase = chainMock({ data: null, error: null })
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    })

    it('returns reservation data on success', async () => {
      const mockData = {
        name: 'John', phone: '62812', date: '2024-03-01', time: '14:00',
        package: 'basic', addons: [], extras: {}, extra_people_count: 0,
        extra_print_count: 0, payment_method: 'tunai', total_price: 35000, status: 'pending'
      }
      mockSupabase.single.mockResolvedValueOnce({ data: mockData, error: null })
      const result = await reservationService.getReservationById('abc-123')
      expect(result).toEqual(mockData)
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'abc-123')
    })

    it('returns null when not found (error)', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: { message: 'not found' } })
      const result = await reservationService.getReservationById('nonexistent')
      expect(result).toBeNull()
    })

    it('returns null when data is null', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: null, error: null })
      const result = await reservationService.getReservationById('empty')
      expect(result).toBeNull()
    })

    it('selects extras column', async () => {
      mockSupabase.single.mockResolvedValueOnce({ data: { extras: {} }, error: null })
      await reservationService.getReservationById('1')
      expect(mockSupabase.select).toHaveBeenCalledWith(
        expect.stringContaining('extras')
      )
    })
  })

  describe('getReservations', () => {
    let mockSupabase: ReturnType<typeof chainMock>

    beforeEach(() => {
      vi.clearAllMocks()
      mockSupabase = chainMock({ data: [], count: 0, error: null })
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    })

    it('applies default pagination (page=1, pageSize=10)', async () => {
      await reservationService.getReservations()
      expect(mockSupabase.range).toHaveBeenCalledWith(0, 9)
    })

    it('applies custom pagination', async () => {
      await reservationService.getReservations(undefined, undefined, undefined, 3, 5)
      expect(mockSupabase.range).toHaveBeenCalledWith(10, 14)
    })

    it('applies status filter when provided', async () => {
      await reservationService.getReservations(undefined, undefined, 'confirmed')
      expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'confirmed')
    })

    it('skips status filter when "all"', async () => {
      await reservationService.getReservations(undefined, undefined, 'all')
      // should not call eq for status
      expect(mockSupabase.eq).not.toHaveBeenCalledWith('status', 'all')
    })

    it('applies date range filters', async () => {
      await reservationService.getReservations('2024-01-01', '2024-12-31')
      expect(mockSupabase.gte).toHaveBeenCalledWith('date', '2024-01-01')
      expect(mockSupabase.lte).toHaveBeenCalledWith('date', '2024-12-31')
    })

    it('applies search filter', async () => {
      await reservationService.getReservations(undefined, undefined, undefined, 1, 10, 'john')
      expect(mockSupabase.ilike).toHaveBeenCalledWith('name', '%john%')
    })

    it('selects extras column', async () => {
      await reservationService.getReservations()
      expect(mockSupabase.select).toHaveBeenCalledWith(
        expect.stringContaining('extras'),
        expect.anything()
      )
    })
  })

  describe('getReservationStats', () => {
    it('returns correct counts for each status bucket', async () => {
      // Each buildQuery() returns a thenable chain (awaited by Promise.all)
      const counts = [10, 2, 5, 3] // total, pending, confirmed, cancelled
      let idx = 0
      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            ilike: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            then: vi.fn().mockImplementation((resolve: any) => resolve({ count: counts[idx++] ?? 0, error: null })),
          }),
        }),
      }
      vi.mocked(createClient).mockResolvedValue(mockClient as any)

      const stats = await reservationService.getReservationStats()
      expect(stats.total).toBe(10)
      expect(stats.pending).toBe(2)
      expect(stats.confirmed).toBe(5)
      expect(stats.cancelled).toBe(3)
    })

    it('returns 0 for null counts', async () => {
      let idx = 0
      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnThis(),
            lte: vi.fn().mockReturnThis(),
            ilike: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            then: vi.fn().mockImplementation((resolve: any) => resolve({ count: null, error: null })),
          }),
        }),
      }
      vi.mocked(createClient).mockResolvedValue(mockClient as any)

      const stats = await reservationService.getReservationStats()
      expect(stats.total).toBe(0)
      expect(stats.pending).toBe(0)
    })

    it('applies filters to stats query', async () => {
      const mockEq = vi.fn().mockReturnThis()
      const mockGte = vi.fn().mockReturnThis()
      const mockLte = vi.fn().mockReturnThis()
      const mockIlike = vi.fn().mockReturnThis()
      const mockClient = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            gte: mockGte,
            lte: mockLte,
            ilike: mockIlike,
            eq: mockEq,
            then: vi.fn().mockImplementation((resolve: any) => resolve({ count: 1, error: null })),
          }),
        }),
      }
      vi.mocked(createClient).mockResolvedValue(mockClient as any)

      await reservationService.getReservationStats('2024-01-01', '2024-12-31', 'john')
      expect(mockGte).toHaveBeenCalledWith('date', '2024-01-01')
      expect(mockLte).toHaveBeenCalledWith('date', '2024-12-31')
      expect(mockIlike).toHaveBeenCalledWith('name', '%john%')
    })
  })

  describe('getRecentReservations', () => {
    let mockSupabase: ReturnType<typeof chainMock>

    beforeEach(() => {
      vi.clearAllMocks()
      mockSupabase = chainMock({ data: null, error: null })
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    })

    it('applies limit', async () => {
      mockSupabase.limit.mockResolvedValueOnce({ data: [], error: null })
      await reservationService.getRecentReservations(3)
      expect(mockSupabase.limit).toHaveBeenCalledWith(3)
    })

    it('uses default limit of 6', async () => {
      mockSupabase.limit.mockResolvedValueOnce({ data: [], error: null })
      await reservationService.getRecentReservations()
      expect(mockSupabase.limit).toHaveBeenCalledWith(6)
    })

    it('throws on error', async () => {
      mockSupabase.limit.mockResolvedValueOnce({ data: null, error: new Error('fail') })
      await expect(reservationService.getRecentReservations()).rejects.toThrow('fail')
    })
  })

  describe('insertReservation', () => {
    let mockSupabase: ReturnType<typeof chainMock>

    beforeEach(() => {
      vi.clearAllMocks()
      mockSupabase = chainMock({ data: null, error: null })
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    })

    it('returns success when insert succeeds', async () => {
      mockSupabase.insert.mockResolvedValueOnce({ error: null })
      const result = await reservationService.insertReservation({ name: 'test' })
      expect(result).toEqual({ success: true })
    })

    it('returns error message when insert fails', async () => {
      mockSupabase.insert.mockResolvedValueOnce({ error: { message: 'duplicate key' } })
      const result = await reservationService.insertReservation({ name: 'test' })
      expect(result).toEqual({ error: 'duplicate key' })
    })
  })

  describe('updateReservation', () => {
    let mockSupabase: ReturnType<typeof chainMock>

    beforeEach(() => {
      vi.clearAllMocks()
      mockSupabase = chainMock({ data: null, error: null })
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    })

    it('returns success when update succeeds', async () => {
      mockSupabase.eq.mockResolvedValueOnce({ error: null })
      const result = await reservationService.updateReservation('1', { name: 'new' })
      expect(result).toEqual({ success: true })
    })

    it('returns error when update fails', async () => {
      mockSupabase.eq.mockResolvedValueOnce({ error: { message: 'not found' } })
      const result = await reservationService.updateReservation('1', { name: 'new' })
      expect(result).toEqual({ error: 'not found' })
    })
  })

  describe('deleteReservation', () => {
    let mockSupabase: ReturnType<typeof chainMock>

    beforeEach(() => {
      vi.clearAllMocks()
      mockSupabase = chainMock({ data: null, error: null })
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    })

    it('returns success when delete succeeds', async () => {
      mockSupabase.eq.mockResolvedValueOnce({ error: null })
      const result = await reservationService.deleteReservation('1')
      expect(result).toEqual({ success: true })
    })

    it('returns error when delete fails', async () => {
      mockSupabase.eq.mockResolvedValueOnce({ error: { message: 'fk violation' } })
      const result = await reservationService.deleteReservation('1')
      expect(result).toEqual({ error: 'fk violation' })
    })
  })
})
