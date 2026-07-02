import { describe, it, expect, vi, beforeEach } from 'vitest'
import { savePricingItem, removePricingItem } from '@/lib/actions/pricing-actions'
import * as pricingService from "@/lib/services/pricing-service"
import { updateTag } from 'next/cache'

vi.mock('@/lib/services/auth-service', () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock('@/lib/services/pricing-service', () => ({
  upsertPricingItem: vi.fn(),
  deletePricingItem: vi.fn(),
}))

vi.mock('next/cache', () => ({
  updateTag: vi.fn(),
}))

describe('pricing-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('savePricingItem', () => {
    it('returns error when not authenticated', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue(null)

      const result = await savePricingItem({ label: 'Test', price: 10000, category: 'extra' })
      expect(result).toEqual({ error: 'Unauthorized' })
      expect(pricingService.upsertPricingItem).not.toHaveBeenCalled()
    })

    it('upserts and updates tag on success', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)
      const created = { id: 'new-id', label: 'New', price: 5000, maxQty: null, note: null, category: 'extra' as const, sortOrder: 0 }
      vi.mocked(pricingService.upsertPricingItem).mockResolvedValue({ data: created })

      const result = await savePricingItem({ label: 'New', price: 5000, category: 'extra' })

      expect(result).toEqual({ success: true, data: created })
      expect(updateTag).toHaveBeenCalled()
    })

    it('returns error when upsert fails', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)
      vi.mocked(pricingService.upsertPricingItem).mockResolvedValue({ error: 'Duplicate key' })

      const result = await savePricingItem({ label: 'Existing', price: 10000, category: 'package' })
      expect(result).toEqual({ error: 'Duplicate key' })
    })

    it('handles "error" in result via discriminated union', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)
      vi.mocked(pricingService.upsertPricingItem).mockReturnValue(Promise.resolve({ error: 'fail' }) as any)

      const result = await savePricingItem({ label: 'X', price: 0, category: 'addon' })
      expect(result).toEqual({ error: 'fail' })
    })
  })

  describe('removePricingItem', () => {
    it('returns error when not authenticated', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue(null)

      const result = await removePricingItem('id-1')
      expect(result).toEqual({ error: 'Unauthorized' })
    })

    it('deletes and updates tag on success', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)
      vi.mocked(pricingService.deletePricingItem).mockResolvedValue({ success: true })

      const result = await removePricingItem('id-1')
      expect(result).toEqual({ success: true })
      expect(updateTag).toHaveBeenCalled()
    })

    it('returns error when delete fails', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)
      vi.mocked(pricingService.deletePricingItem).mockResolvedValue({ error: 'Not found' })

      const result = await removePricingItem('nonexistent')
      expect(result).toEqual({ error: 'Not found' })
    })
  })
})
