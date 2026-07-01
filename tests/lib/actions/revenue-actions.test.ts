import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logTransaction } from '@/lib/actions/revenue-actions'

const { mockInsertTransaction } = vi.hoisted(() => ({
  mockInsertTransaction: vi.fn(),
}))

vi.mock('@/lib/services/revenue-service', () => ({
  logTransaction: mockInsertTransaction,
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
}))

describe('Revenue Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInsertTransaction.mockResolvedValue({ success: true })
  })

  it('logs a transaction successfully', async () => {
    const input = {
      customer_name: 'Walk-in Customer',
      package: 'Sesi Foto',
      payment_method: 'tunai' as const,
      amount: 35000,
      session_time: '14:00',
      addons: [],
      extra_people_count: 2,
      extra_print_count: 0,
    }

    const result = await logTransaction(input)

    expect(result.success).toBe(true)
    expect(mockInsertTransaction).toHaveBeenCalled()
  })

  it('returns false when database insert fails', async () => {
    mockInsertTransaction.mockResolvedValueOnce({ error: 'DB Error' })

    const result = await logTransaction({
      customer_name: 'Walk-in Customer',
      package: 'Sesi Foto',
      payment_method: 'tunai',
      amount: 35000,
      session_time: '14:00',
      addons: [],
      extra_people_count: 0,
      extra_print_count: 0,
    })

    expect(result.success).toBe(false)
    expect(result.message).toBe('DB Error')
  })
})
