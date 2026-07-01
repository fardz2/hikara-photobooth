import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitReservation, updateReservationStatus, editReservation, deleteReservation } from '@/lib/actions/reservation-actions'
import * as reservationService from "@/lib/services/reservation-service";
import { fonnteService } from '@/lib/services/fonnte-service'
import { revalidatePath, updateTag } from 'next/cache'

// Hoisted mock fns — referenced inside vi.mock factories
const {
  mockCheckSlot,
  mockInsertReservation,
  mockUpdateStatus,
  mockGetById,
  mockDeleteRes,
  mockUpdateReservation,
} = vi.hoisted(() => ({
  mockCheckSlot: vi.fn(),
  mockInsertReservation: vi.fn(),
  mockUpdateStatus: vi.fn(),
  mockGetById: vi.fn(),
  mockDeleteRes: vi.fn(),
  mockUpdateReservation: vi.fn(),
}))

vi.mock('@/lib/utils/price', () => ({
  calculateTotalPrice: vi.fn().mockResolvedValue(35000),
}))

vi.mock('@/lib/services/reservation-service', () => ({
  checkSlotAvailability: mockCheckSlot,
  insertReservation: mockInsertReservation,
  updateReservationStatus: mockUpdateStatus,
  getReservationById: mockGetById,
  deleteReservation: mockDeleteRes,
  updateReservation: mockUpdateReservation,
  getReservations: vi.fn(),
  getReservationStats: vi.fn(),
  getRecentReservations: vi.fn(),
  getBookedSlots: vi.fn(),
}))

vi.mock('@/lib/services/fonnte-service', () => ({
  fonnteService: {
    sendMessage: vi.fn().mockResolvedValue({ success: true }),
  },
}))

vi.mock('next/cache', async (importOriginal) => {
  const actual = await importOriginal() as any
  return {
    ...actual,
    cacheLife: vi.fn(),
    cacheTag: vi.fn(),
    revalidatePath: vi.fn(),
    updateTag: vi.fn(),
  }
})

describe('Reservation Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Defaults: slot free, insert succeeds, reservation found
    mockCheckSlot.mockResolvedValue(false)
    mockInsertReservation.mockResolvedValue({ success: true })
    mockUpdateStatus.mockResolvedValue({ success: true })
    mockGetById.mockResolvedValue({
      id: '1', name: 'John', phone: '62812', total_price: 35000,
      date: '2024-03-01', time: '14:00', payment_method: 'qris', status: 'pending',
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
      paymentMethod: 'tunai',
    }

    it('returns error if required fields are missing', async () => {
      const result = await submitReservation({ ...validData, name: '' })
      expect(result.success).toBe(false)
      expect(result.message).toMatch(/pendek|wajib/i)
    })

    it('returns error if slot is already booked', async () => {
      mockCheckSlot.mockResolvedValue(true)
      const result = await submitReservation(validData)
      expect(result.success).toBe(false)
      expect(result.message).toContain('sudah habis')
    })

    it('creates reservation and sends notifications on success', async () => {
      mockCheckSlot.mockResolvedValue(false)

      const result = await submitReservation(validData)

      expect(result.success).toBe(true)
      expect(mockInsertReservation).toHaveBeenCalled()
      expect(fonnteService.sendMessage).toHaveBeenCalledTimes(2)
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/reservations')
    })
  })

  describe('updateReservationStatus', () => {
    it('updates status and sends WA if confirmed and QRIS', async () => {
      const result = await updateReservationStatus('1', 'confirmed')

      expect(result.success).toBe(true)
      expect(mockUpdateStatus).toHaveBeenCalledWith('1', 'confirmed')
      expect(fonnteService.sendMessage).toHaveBeenCalledWith('62812', expect.stringContaining('Pesan untuk Anda'))
    })

    it('fails when slot is taken during re-enable', async () => {
      mockGetById.mockResolvedValueOnce({
        id: '1', date: '2024-03-01', time: '14:00', status: 'cancelled', payment_method: 'qris', total_price: 35000, name: 'John', phone: '62812',
      })
      mockCheckSlot.mockResolvedValue(true)

      const result = await updateReservationStatus('1', 'confirmed')
      expect(result.success).toBe(false)
      expect(result.message).toContain('sudah terisi')
    })

    it('returns error if reservation not found during status update', async () => {
      mockGetById.mockResolvedValueOnce(null)
      const result = await updateReservationStatus('non-existent', 'confirmed')
      expect(result.success).toBe(false)
      expect(result.message).toContain('tidak ditemukan')
    })
  })

  describe('Edge Cases', () => {
    it('rejects reservation with invalid phone number', async () => {
      const result = await submitReservation({
        name: 'John', phone: 'abc', date: new Date(), time: '14:00', package: 'basic', addons: [], paymentMethod: 'tunai',
      })
      expect(result.success).toBe(false)
      expect(result.message).toMatch(/minimal|valid/i)
    })

    it('returns error if database insertion fails', async () => {
      mockInsertReservation.mockResolvedValueOnce({ error: 'Database crash' })
      mockCheckSlot.mockResolvedValue(false)

      const result = await submitReservation({
        name: 'John', phone: '628123456789', date: new Date(), time: '14:00', package: 'basic', addons: [], paymentMethod: 'tunai',
      })
      expect(result.success).toBe(false)
      expect(result.message).toContain('Gagal menyimpan')
    })
  })

  describe('editReservation', () => {
    const editPayload = {
      name: 'Jane Doe',
      date: new Date('2024-03-02'),
      time: '15:00',
    }

    beforeEach(() => {
      // Default: slot free, reservation found
      mockCheckSlot.mockResolvedValue(false)
      mockGetById.mockResolvedValue({
        id: '1', name: 'John', phone: '62812', total_price: 35000,
        date: '2024-03-01', time: '14:00', payment_method: 'qris', status: 'pending',
        package: 'basic', addons: [], extra_people_count: 0, extra_print_count: 0,
      })
      mockUpdateReservation.mockResolvedValue({ success: true })
    })

    it('updates reservation and revalidates cache on success', async () => {
      const result = await editReservation('1', editPayload)

      expect(result.success).toBe(true)
      expect(result.message).toContain('berhasil diperbarui')
      expect(mockGetById).toHaveBeenCalledWith('1')
      expect(mockUpdateReservation).toHaveBeenCalled()
      expect(updateTag).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/reservations')
    })

    it('returns error if slot is already booked', async () => {
      mockCheckSlot.mockResolvedValue(true)

      const result = await editReservation('1', editPayload)

      expect(result.success).toBe(false)
      expect(result.message).toContain('sudah terisi')
    })

    it('returns error if reservation is not found', async () => {
      mockGetById.mockResolvedValueOnce(null)

      const result = await editReservation('non-existent', editPayload)

      expect(result.success).toBe(false)
      expect(result.message).toContain('tidak ditemukan')
    })
  })

  describe('deleteReservation', () => {
    it('deletes reservation and revalidates cache on success', async () => {
      mockDeleteRes.mockResolvedValue({ success: true })

      const result = await deleteReservation('1')

      expect(result.success).toBe(true)
      expect(mockDeleteRes).toHaveBeenCalledWith('1')
      expect(updateTag).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/reservations')
    })

    it('returns error if reservation not found', async () => {
      mockDeleteRes.mockResolvedValue({ error: 'Reservasi tidak ditemukan.' })

      const result = await deleteReservation('non-existent')

      expect(result.success).toBe(false)
      expect(result.message).toContain('tidak ditemukan')
    })
  })
})
