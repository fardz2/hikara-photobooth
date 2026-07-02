import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitReservation, updateReservationStatus, editReservation, deleteReservation } from '@/lib/actions/reservation-actions'
import * as reservationService from "@/lib/services/reservation-service"
import { fonnteService } from '@/lib/services/fonnte-service'
import { revalidatePath, updateTag } from 'next/cache'

// Hoisted mock fns
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
  return { ...actual, cacheLife: vi.fn(), cacheTag: vi.fn(), revalidatePath: vi.fn(), updateTag: vi.fn() }
})

vi.mock('@/lib/services/auth-service', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ id: 'test-user' }),
}))

describe('Reservation Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCheckSlot.mockResolvedValue(false)
    mockInsertReservation.mockResolvedValue({ success: true })
    mockUpdateStatus.mockResolvedValue({ success: true })
    mockGetById.mockResolvedValue({
      id: '1', name: 'John', phone: '62812', total_price: 35000,
      date: '2024-03-01', time: '14:00', payment_method: 'qris', status: 'pending',
      package: 'basic', addons: [], extras: {}, extra_people_count: 0, extra_print_count: 0,
    })
    process.env.ADMIN_PHONE = '6281111111'
  })

  // ─── submitReservation ───
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

    it('includes extras JSONB in insert payload', async () => {
      mockCheckSlot.mockResolvedValue(false)
      const dataWithExtras = { ...validData, extras: { ext1: 2, ext2: 1 } }
      await submitReservation(dataWithExtras)
      const insertArg = mockInsertReservation.mock.calls[0][0]
      expect(insertArg.extras).toEqual({ ext1: 2, ext2: 1 })
      expect(insertArg.extra_people_count).toBe(3)
    })

    it('defaults extras to empty object when not provided', async () => {
      mockCheckSlot.mockResolvedValue(false)
      await submitReservation(validData)
      const insertArg = mockInsertReservation.mock.calls[0][0]
      expect(insertArg.extras).toEqual({})
    })

    it('sends QRIS notification with payment proof URL', async () => {
      const dataWithQris = { ...validData, paymentMethod: 'qris', paymentProofUrl: 'https://cdn.test/proof.webp' }
      mockCheckSlot.mockResolvedValue(false)
      await submitReservation(dataWithQris)
      // Both customer and admin messages sent
      expect(fonnteService.sendMessage).toHaveBeenCalledTimes(2)
    })

    it('does not fail when ADMIN_PHONE is not configured', async () => {
      delete process.env.ADMIN_PHONE
      mockCheckSlot.mockResolvedValue(false)
      const result = await submitReservation(validData)
      expect(result.success).toBe(true)
      // No WA sent
      expect(fonnteService.sendMessage).not.toHaveBeenCalled()
    })
  })

  // ─── updateReservationStatus ───
  describe('updateReservationStatus', () => {
    it('updates status and sends WA if confirmed and QRIS', async () => {
      const result = await updateReservationStatus('1', 'confirmed')
      expect(result.success).toBe(true)
      expect(mockUpdateStatus).toHaveBeenCalledWith('1', 'confirmed')
      expect(fonnteService.sendMessage).toHaveBeenCalledWith('62812', expect.stringContaining('Pesan untuk Anda'))
    })

    it('does not send WA for confirmed+tunai', async () => {
      mockGetById.mockResolvedValueOnce({
        id: '1', name: 'John', phone: '62812', total_price: 35000,
        date: '2024-03-01', time: '14:00', payment_method: 'tunai', status: 'pending',
      })
      await updateReservationStatus('1', 'confirmed')
      expect(fonnteService.sendMessage).not.toHaveBeenCalled()
    })

    it('fails when slot is taken during re-enable (cancelled → confirmed)', async () => {
      mockGetById.mockResolvedValueOnce({
        id: '1', date: '2024-03-01', time: '14:00', status: 'cancelled', payment_method: 'qris', total_price: 35000, name: 'John', phone: '62812',
      })
      mockCheckSlot.mockResolvedValue(true)
      const result = await updateReservationStatus('1', 'confirmed')
      expect(result.success).toBe(false)
      expect(result.message).toContain('sudah terisi')
    })

    it('allows re-enable when slot is free', async () => {
      mockGetById.mockResolvedValueOnce({
        id: '1', date: '2024-03-01', time: '14:00', status: 'cancelled', payment_method: 'qris', total_price: 35000, name: 'John', phone: '62812',
      })
      mockCheckSlot.mockResolvedValue(false)
      const result = await updateReservationStatus('1', 'confirmed')
      expect(result.success).toBe(true)
    })

    it('returns error if reservation not found during status update', async () => {
      mockGetById.mockResolvedValueOnce(null)
      const result = await updateReservationStatus('non-existent', 'confirmed')
      expect(result.success).toBe(false)
      expect(result.message).toContain('tidak ditemukan')
    })

    it('does not re-check slot when moving pending→confirmed (already active)', async () => {
      // default mock has status=pending, which is already active
      await updateReservationStatus('1', 'confirmed')
      // Should NOT call checkSlotAvailability because isMovingToActive && isCurrentlyActive → false
      expect(mockCheckSlot).not.toHaveBeenCalled()
    })
  })

  // ─── Edge Cases ───
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

    it('accepts walk-in payment method qris', async () => {
      const result = await submitReservation({
        name: 'Test', phone: '62812345678', date: new Date(), time: '14:30', package: 'basic', addons: [], paymentMethod: 'qris',
      })
      expect(result.success).toBe(true)
    })
  })

  // ─── editReservation ───
  describe('editReservation', () => {
    const editPayload = { name: 'Jane Doe', date: new Date('2024-03-02'), time: '15:00' }

    beforeEach(() => {
      mockCheckSlot.mockResolvedValue(false)
      mockGetById.mockResolvedValue({
        id: '1', name: 'John', phone: '62812', total_price: 35000,
        date: '2024-03-01', time: '14:00', payment_method: 'qris', status: 'pending',
        package: 'basic', addons: [], extras: {}, extra_people_count: 0, extra_print_count: 0,
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

    it('does not check slot when date/time unchanged', async () => {
      const sameData = { name: 'Jane' } // no date/time change
      await editReservation('1', sameData)
      expect(mockCheckSlot).not.toHaveBeenCalled()
    })

    it('passes extras to updateReservation when provided', async () => {
      const withExtras = { ...editPayload, extras: { ext1: 2 } }
      await editReservation('1', withExtras)
      const updateArg = mockUpdateReservation.mock.calls[0][1]
      expect(updateArg.extras).toEqual({ ext1: 2 })
    })

    it('defaults extras to {} when not in edit payload (Zod default)', async () => {
      await editReservation('1', editPayload)
      const updateArg = mockUpdateReservation.mock.calls[0][1]
      expect(updateArg.extras).toEqual({})
    })

    it('handles partial date string (not Date object)', async () => {
      const result = await editReservation('1', { date: '2024-03-05' })
      expect(result.success).toBe(true)
    })

    it('recalculates price when package changes', async () => {
      await editReservation('1', { package: 'premium' })
      const updateArg = mockUpdateReservation.mock.calls[0][1]
      expect(updateArg.total_price).toBeDefined()
    })
  })

  // ─── deleteReservation ───
  describe('deleteReservation', () => {
    it('deletes reservation and revalidates bookedSlots cache', async () => {
      mockGetById.mockResolvedValue({
        id: '1', date: '2024-03-01', time: '14:00',
        name: 'John', phone: '62812', total_price: 35000,
        status: 'pending', payment_method: 'qris',
      })
      mockDeleteRes.mockResolvedValue({ success: true })
      const result = await deleteReservation('1')
      expect(result.success).toBe(true)
      expect(mockDeleteRes).toHaveBeenCalledWith('1')
      expect(updateTag).toHaveBeenCalled()
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/reservations')
    })

    it('returns error if reservation not found before delete', async () => {
      mockGetById.mockResolvedValue(null)
      const result = await deleteReservation('non-existent')
      expect(result.success).toBe(false)
      expect(result.message).toContain('tidak ditemukan')
    })

    it('returns unauthorized when not logged in', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue(null)

      const result = await deleteReservation('any')
      expect(result).toEqual({ success: false, message: 'Unauthorized' })
    })
  })
})
