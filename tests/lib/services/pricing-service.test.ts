import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getPricing, getAllPricing, upsertPricingItem, deletePricingItem, type PricingItem } from '@/lib/services/pricing-service'
import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/supabase/public', () => ({
  createPublicClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
  revalidateTag: vi.fn(),
}))

// ── Helpers ──

function makeSupabaseMock() {
  const m: Record<string, any> = {};
  m.from = vi.fn().mockReturnValue(m)
  m.select = vi.fn().mockReturnValue(m)
  m.order = vi.fn().mockResolvedValue({ data: null, error: null })
  m.upsert = vi.fn().mockReturnValue(m)
  m.single = vi.fn().mockResolvedValue({ data: null, error: null })
  m.eq = vi.fn().mockResolvedValue({ error: null })
  m.delete = vi.fn().mockReturnValue(m)
  return m
}

const DB_ROWS: Record<string, unknown>[] = [
  { id: '1', label: 'Basic Package', price: 35000, max_qty: 3, note: null, category: 'package', sort_order: 1 },
  { id: '2', label: 'Extra Print', price: 10000, max_qty: null, note: 'Per sheet', category: 'addon', sort_order: 2 },
]

const EXPECTED_ITEMS: PricingItem[] = [
  { id: '1', label: 'Basic Package', price: 35000, maxQty: 3, note: null, category: 'package', sortOrder: 1 },
  { id: '2', label: 'Extra Print', price: 10000, maxQty: null, note: 'Per sheet', category: 'addon', sortOrder: 2 },
]

// ── Tests ──

describe('pricing-service', () => {
  let mockAdmin: ReturnType<typeof makeSupabaseMock>
  let mockPublic: ReturnType<typeof makeSupabaseMock>

  beforeEach(() => {
    vi.clearAllMocks()
    mockAdmin = makeSupabaseMock()
    mockPublic = makeSupabaseMock()
    vi.mocked(createClient).mockResolvedValue(mockAdmin as any)
    vi.mocked(createPublicClient).mockReturnValue(mockPublic as any)
  })

  describe('toItem mapper', () => {
    it('converts snake_case DB row to camelCase PricingItem', async () => {
      mockPublic.order.mockResolvedValueOnce({ data: [DB_ROWS[0]], error: null })
      const result = await getPricing()

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        id: '1',
        label: 'Basic Package',
        price: 35000,
        maxQty: 3,
        note: null,
        category: 'package',
        sortOrder: 1,
      })
    })

    it('maps null max_qty and note correctly', async () => {
      mockPublic.order.mockResolvedValueOnce({ data: [DB_ROWS[1]], error: null })
      const result = await getPricing()

      expect(result[0].maxQty).toBeNull()
      expect(result[0].note).toBe('Per sheet')
    })
  })

  describe('getPricing (cached, public client)', () => {
    it('uses public client and returns pricing items', async () => {
      mockPublic.order.mockResolvedValueOnce({ data: DB_ROWS, error: null })

      const result = await getPricing()

      expect(vi.mocked(createPublicClient)).toHaveBeenCalled()
      expect(mockPublic.from).toHaveBeenCalledWith('pricing_items')
      expect(result).toEqual(EXPECTED_ITEMS)
    })

    it('returns [] when DB returns null data', async () => {
      mockPublic.order.mockResolvedValueOnce({ data: null, error: null })

      const result = await getPricing()
      expect(result).toEqual([])
    })
  })

  describe('getAllPricing (admin, no cache)', () => {
    it('uses admin client and returns all pricing items', async () => {
      mockAdmin.order.mockResolvedValueOnce({ data: DB_ROWS, error: null })

      const result = await getAllPricing()

      expect(vi.mocked(createClient)).toHaveBeenCalled()
      expect(mockAdmin.from).toHaveBeenCalledWith('pricing_items')
      expect(result).toEqual(EXPECTED_ITEMS)
    })

    it('returns [] when DB returns null data', async () => {
      mockAdmin.order.mockResolvedValueOnce({ data: null, error: null })

      const result = await getAllPricing()
      expect(result).toEqual([])
    })

    it('returns [] for empty array', async () => {
      mockAdmin.order.mockResolvedValueOnce({ data: [], error: null })

      const result = await getAllPricing()
      expect(result).toEqual([])
    })
  })

  describe('upsertPricingItem', () => {
    it('inserts a new pricing item without id', async () => {
      const item: PricingItem = {
        label: 'New Item',
        price: 5000,
        category: 'extra',
      }
      const insertedRow = { id: '3', label: 'New Item', price: 5000, max_qty: null, note: null, category: 'extra', sort_order: 0 }
      mockAdmin.single.mockResolvedValueOnce({ data: insertedRow, error: null })

      const result = await upsertPricingItem(item)

      expect(result).toEqual({
        data: { id: '3', label: 'New Item', price: 5000, maxQty: null, note: null, category: 'extra', sortOrder: 0 },
      })
      // Should not include id in payload when not provided
      const upsertCall = mockAdmin.upsert.mock.calls[0]
      expect(upsertCall[0]).not.toHaveProperty('id')
    })

    it('updates an existing pricing item with id', async () => {
      const item: PricingItem = {
        id: '1',
        label: 'Updated',
        price: 40000,
        maxQty: 5,
        note: 'Updated note',
        category: 'package',
        sortOrder: 1,
      }
      const updatedRow = { id: '1', label: 'Updated', price: 40000, max_qty: 5, note: 'Updated note', category: 'package', sort_order: 1 }
      mockAdmin.single.mockResolvedValueOnce({ data: updatedRow, error: null })

      const result = await upsertPricingItem(item)

      expect(result.data?.label).toBe('Updated')
      expect(result.data?.maxQty).toBe(5)
      expect(result.data?.note).toBe('Updated note')
      const upsertCall = mockAdmin.upsert.mock.calls[0]
      expect(upsertCall[0].id).toBe('1')
    })

    it('returns error when upsert fails', async () => {
      mockAdmin.single.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })

      const result = await upsertPricingItem({
        label: 'Fail',
        price: 1000,
        category: 'extra',
      })

      expect(result).toEqual({ error: 'DB error' })
    })

    it('sets max_qty and note to null when not provided', async () => {
      const item: PricingItem = {
        label: 'No extras',
        price: 20000,
        category: 'package',
      }
      mockAdmin.single.mockResolvedValueOnce({
        data: { id: '4', label: 'No extras', price: 20000, max_qty: null, note: null, category: 'package', sort_order: 0 },
        error: null,
      })

      await upsertPricingItem(item)

      const payload = mockAdmin.upsert.mock.calls[0][0]
      expect(payload.max_qty).toBeNull()
      expect(payload.note).toBeNull()
    })
  })

  describe('deletePricingItem', () => {
    it('deletes and returns success', async () => {
      const result = await deletePricingItem('1')

      expect(result).toEqual({ success: true })
      expect(mockAdmin.from).toHaveBeenCalledWith('pricing_items')
      expect(mockAdmin.delete).toHaveBeenCalled()
      expect(mockAdmin.eq).toHaveBeenCalledWith('id', '1')
    })

    it('returns error when delete fails', async () => {
      mockAdmin.eq.mockResolvedValueOnce({ error: { message: 'FK constraint' } })

      const result = await deletePricingItem('1')

      expect(result).toEqual({ error: 'FK constraint' })
    })
  })
})
