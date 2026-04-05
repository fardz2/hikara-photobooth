import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitReservation, updateReservationStatus } from '@/lib/actions/reservation-actions'
import { createClient } from '@/lib/supabase/server'
import { reservationService } from '@/lib/services/reservation-service'
import { fonnteService } from '@/lib/services/fonnte-service'
import { revalidatePath } from 'next/cache'

// Use vi.hoisted to ensure mocks are available during vi.mock hoisting
const { mockSupabase, mockFunctions } = vi.hoisted(() => {
  const mFuncs = {
    insert: vi.fn(),
    update: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    single: vi.fn(),
    from: vi.fn(),
  }

  const mSupabase = {
    from: mFuncs.from,
    insert: mFuncs.insert,
    update: mFuncs.update,
    select: mFuncs.select,
    eq: mFuncs.eq,
    single: mFuncs.single,
  }

  // Set up default chain behavior
  mFuncs.from.mockReturnValue(mSupabase)
  mFuncs.select.mockReturnValue(mSupabase)
  mFuncs.update.mockReturnValue(mSupabase)
  mFuncs.eq.mockReturnValue(mSupabase)

  return { mockSupabase: mSupabase, mockFunctions: mFuncs }
})

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockImplementation(() => Promise.resolve(mockSupabase)),
}))

vi.mock('@/lib/services/reservation-service', () => ({
  reservationService: {
    checkSlotAvailability: vi.fn(),
    getBookedSlots: vi.fn(),
  },
}))

vi.mock('@/lib/services/fonnte-service', () => ({
  fonnteService: {
    sendMessage: vi.fn().mockResolvedValue({ success: true }),
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

describe('Reservation Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Terminal operations return promises
    mockFunctions.insert.mockResolvedValue({ error: null })
    mockFunctions.eq.mockReturnThis() // Allow .single() after .eq()
    mockFunctions.single.mockResolvedValue({ 
      data: { id: '1', name: 'John', phone: '62812', total_price: 35000, date: '2024-03-01', time: '14:00', payment_method: 'qris', status: 'pending' }, 
      error: null 
    })
    
    process.env.ADMIN_PHONE = '6281111111'
  })

  describe('submitReservation', () => {
    const validData: any = {
      name: 'John Doe',
      phone: '628123456789',
      date: new Date('2024-03-01'),
      time: '14:00',
      package: 'basic',
      addons: [],
      paymentMethod: 'tunai'
    }

    it('returns error if required fields are missing', async () => {
      const result = await submitReservation({ ...validData, name: '' })
      expect(result.success).toBe(false)
      expect(result.message).toMatch(/pendek|wajib/i)
    })

    it('returns error if slot is already booked', async () => {
      vi.mocked(reservationService.checkSlotAvailability).mockResolvedValue(true)
      const result = await submitReservation(validData)
      expect(result.success).toBe(false)
      expect(result.message).toContain('sudah habis')
    })

    it('creates reservation and sends notifications on success', async () => {
      vi.mocked(reservationService.checkSlotAvailability).mockResolvedValue(false)
      
      const result = await submitReservation(validData)
      
      expect(result.success).toBe(true)
      expect(mockFunctions.insert).toHaveBeenCalled()
      expect(fonnteService.sendMessage).toHaveBeenCalledTimes(2)
      expect(revalidatePath).toHaveBeenCalledWith('/reservasi')
    })
  })

  describe('updateReservationStatus', () => {
    it('updates status and sends WA if confirmed and QRIS', async () => {
      const result = await updateReservationStatus('1', 'confirmed')
      
      expect(result.success).toBe(true)
      expect(mockFunctions.update).toHaveBeenCalledWith({ status: 'confirmed' })
      expect(fonnteService.sendMessage).toHaveBeenCalledWith('62812', expect.stringContaining('Pesan untuk Anda'))
    })

    it('fails when slot is taken during re-enable', async () => {
      // Mock being currently cancelled
      mockFunctions.single.mockResolvedValueOnce({ 
        data: { id: '1', date: '2024-03-01', time: '14:00', status: 'cancelled' }, 
        error: null 
      })
      // Mock slot now being booked by someone else
      vi.mocked(reservationService.checkSlotAvailability).mockResolvedValue(true)
      
      const result = await updateReservationStatus('1', 'confirmed')
      expect(result.success).toBe(false)
      expect(result.message).toContain('sudah terisi')
    })

    it('returns error if reservation not found during status update', async () => {
      mockFunctions.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } })
      const result = await updateReservationStatus('non-existent', 'confirmed')
      expect(result.success).toBe(false)
      expect(result.message).toContain('tidak ditemukan')
    })
  })

  describe('Edge Cases', () => {
    it('rejects reservation with invalid phone number', async () => {
      const result = await submitReservation({ 
        name: 'John', phone: 'abc', date: new Date(), time: '14:00', package: 'basic', addons: [], paymentMethod: 'tunai' 
      })
      expect(result.success).toBe(false)
      expect(result.message).toMatch(/minimal|valid/i)
    })

    it('returns error if database insertion fails', async () => {
      mockFunctions.insert.mockResolvedValueOnce({ error: { message: 'Database crash' } })
      vi.mocked(reservationService.checkSlotAvailability).mockResolvedValue(false)
      
      const result = await submitReservation({ 
        name: 'John', phone: '628123456789', date: new Date(), time: '14:00', package: 'basic', addons: [], paymentMethod: 'tunai' 
      })
      expect(result.success).toBe(false)
      expect(result.message).toContain('Gagal menyimpan')
    })
  })
})
