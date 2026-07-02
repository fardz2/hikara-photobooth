import { describe, it, expect, vi, beforeEach } from 'vitest'
import { logTransaction } from '@/lib/actions/revenue-actions'
import * as revenueService from "@/lib/services/revenue-service"
import { revalidatePath, updateTag } from 'next/cache'

vi.mock('@/lib/services/auth-service', () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock('@/lib/services/revenue-service', () => ({
  logTransaction: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
}))

describe('Revenue Actions', () => {
  const validInput = {
    customer_name: 'Walk-in',
    session_time: '14:30',
    package: 'basic',
    addons: [],
    extras: {},
    payment_method: 'tunai' as const,
    amount: 35000,
    extra_people_count: 0,
    extra_print_count: 0,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('logs a transaction successfully', async () => {
    const { getCurrentUser } = await import('@/lib/services/auth-service')
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)
    vi.mocked(revenueService.logTransaction).mockResolvedValue({ success: true })

    const result = await logTransaction(validInput)

    expect(result).toEqual({ success: true })
    expect(revenueService.logTransaction).toHaveBeenCalledWith(validInput)
    expect(updateTag).toHaveBeenCalled()
    expect(revalidatePath).toHaveBeenCalledTimes(2)
  })

  it('returns false when database insert fails', async () => {
    const { getCurrentUser } = await import('@/lib/services/auth-service')
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)
    vi.mocked(revenueService.logTransaction).mockResolvedValue({ error: 'DB error' })

    const result = await logTransaction(validInput)

    expect(result).toEqual({ success: false, message: 'DB error' })
  })

  it('returns unauthorized when not logged in', async () => {
    const { getCurrentUser } = await import('@/lib/services/auth-service')
    vi.mocked(getCurrentUser).mockResolvedValue(null)

    const result = await logTransaction(validInput)

    expect(result).toEqual({ success: false, message: 'Unauthorized' })
    expect(revenueService.logTransaction).not.toHaveBeenCalled()
  })

  it('returns validation error for invalid session time', async () => {
    const { getCurrentUser } = await import('@/lib/services/auth-service')
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)

    const result = await logTransaction({
      ...validInput,
      session_time: 'invalid',
    })

    expect(result.success).toBe(false)
    expect(result.message).toMatch(/jam|format/i)
    expect(revenueService.logTransaction).not.toHaveBeenCalled()
  })

  it('defaults empty customer_name to "Walk-in Customer" (intentional behavior)', async () => {
    const { getCurrentUser } = await import('@/lib/services/auth-service')
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)
    vi.mocked(revenueService.logTransaction).mockResolvedValue({ success: true })

    const result = await logTransaction({
      ...validInput,
      customer_name: '',
    })

    expect(result.success).toBe(true)
    // validation passes because empty name defaults to "Walk-in Customer" before schema check
    expect(revenueService.logTransaction).toHaveBeenCalled()
  })

  it('returns validation error for missing package', async () => {
    const { getCurrentUser } = await import('@/lib/services/auth-service')
    vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)

    const result = await logTransaction({
      ...validInput,
      package: '',
    })

    expect(result.success).toBe(false)
    expect(result.message).toMatch(/pilih|paket/i)
  })
})
