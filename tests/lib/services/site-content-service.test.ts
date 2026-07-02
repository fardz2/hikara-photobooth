import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSiteContent, getAllSiteContent, upsertSiteContent, upsertSectionContent } from '@/lib/services/site-content-service'
import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/supabase/public', () => ({ createPublicClient: vi.fn() }))
vi.mock('next/cache', () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }))

function makeSupabaseMock() {
  const m: Record<string, any> = {}
  m.from = vi.fn().mockReturnValue(m)
  m.select = vi.fn().mockReturnValue(m)
  m.eq = vi.fn().mockResolvedValue({ data: null, error: null })
  m.in = vi.fn().mockResolvedValue({ data: null, error: null })
  m.upsert = vi.fn().mockResolvedValue({ error: null })
  return m
}

describe('site-content-service', () => {
  let mockAdmin: ReturnType<typeof makeSupabaseMock>
  let mockPublic: ReturnType<typeof makeSupabaseMock>

  beforeEach(() => {
    vi.clearAllMocks()
    mockAdmin = makeSupabaseMock()
    mockPublic = makeSupabaseMock()
    vi.mocked(createClient).mockResolvedValue(mockAdmin as any)
    vi.mocked(createPublicClient).mockReturnValue(mockPublic as any)
  })

  describe('getSiteContent (cached, public)', () => {
    it('returns key-value map for a section', async () => {
      mockPublic.eq.mockResolvedValueOnce({
        data: [{ key: 'title', value: 'Hello' }, { key: 'desc', value: 'World' }],
        error: null,
      })

      const result = await getSiteContent('hero')

      expect(vi.mocked(createPublicClient)).toHaveBeenCalled()
      expect(mockPublic.from).toHaveBeenCalledWith('site_content')
      expect(mockPublic.select).toHaveBeenCalledWith('key, value')
      expect(mockPublic.eq).toHaveBeenCalledWith('section', 'hero')
      expect(result).toEqual({ title: 'Hello', desc: 'World' })
    })

    it('returns null when DB returns null data', async () => {
      mockPublic.eq.mockResolvedValueOnce({ data: null, error: null })

      const result = await getSiteContent('nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('getAllSiteContent (admin, single query)', () => {
    it('fetches multiple sections with single .in() query', async () => {
      mockAdmin.in.mockResolvedValueOnce({
        data: [
          { section: 'hero', key: 't', value: 'A' },
          { section: 'footer', key: 'd', value: 'B' },
        ],
        error: null,
      })

      const result = await getAllSiteContent(['hero', 'footer'])

      expect(vi.mocked(createClient)).toHaveBeenCalled()
      expect(mockAdmin.from).toHaveBeenCalledTimes(1)
      expect(mockAdmin.select).toHaveBeenCalledWith('section, key, value')
      expect(mockAdmin.in).toHaveBeenCalledWith('section', ['hero', 'footer'])
      expect(result).toEqual({ hero: { t: 'A' }, footer: { d: 'B' } })
    })

    it('returns empty object on error', async () => {
      mockAdmin.in.mockResolvedValueOnce({ data: null, error: { message: 'fail' } })

      const result = await getAllSiteContent(['a', 'b'])
      expect(result).toEqual({})
    })

    it('groups multiple keys in same section', async () => {
      mockAdmin.in.mockResolvedValueOnce({
        data: [
          { section: 'hero', key: 'title', value: 'Hi' },
          { section: 'hero', key: 'subtitle', value: 'World' },
          { section: 'footer', key: 'year', value: 2026 },
        ],
        error: null,
      })

      const result = await getAllSiteContent(['hero', 'footer'])
      expect(result).toEqual({
        hero: { title: 'Hi', subtitle: 'World' },
        footer: { year: 2026 },
      })
    })
  })

  describe('upsertSiteContent', () => {
    it('returns success on insert', async () => {
      mockAdmin.upsert.mockResolvedValueOnce({ error: null })

      const result = await upsertSiteContent('hero', 'title', 'Hi')

      expect(mockAdmin.from).toHaveBeenCalledWith('site_content')
      expect(mockAdmin.upsert).toHaveBeenCalledWith(
        { section: 'hero', key: 'title', value: 'Hi' },
        { onConflict: 'section, key' },
      )
      expect(result).toEqual({ success: true })
    })

    it('returns error on failure', async () => {
      mockAdmin.upsert.mockResolvedValueOnce({ error: { message: 'dup' } })

      const result = await upsertSiteContent('hero', 'title', 'Hi')
      expect(result).toEqual({ error: 'dup' })
    })
  })

  describe('upsertSectionContent', () => {
    it('bulk upserts entries for a section', async () => {
      mockAdmin.upsert.mockResolvedValueOnce({ error: null })

      const entries = [{ key: 'a', value: 1 }, { key: 'b', value: 2 }]
      const result = await upsertSectionContent('footer', entries)

      expect(mockAdmin.upsert).toHaveBeenCalledWith(
        [
          { section: 'footer', key: 'a', value: 1 },
          { section: 'footer', key: 'b', value: 2 },
        ],
        { onConflict: 'section, key' },
      )
      expect(result).toEqual({ success: true })
    })

    it('returns error on failure', async () => {
      mockAdmin.upsert.mockResolvedValueOnce({ error: { message: 'fail' } })

      const result = await upsertSectionContent('x', [{ key: 'k', value: 'v' }])
      expect(result).toEqual({ error: 'fail' })
    })
  })
})
