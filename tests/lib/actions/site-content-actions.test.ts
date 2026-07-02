import { describe, it, expect, vi, beforeEach } from 'vitest'
import { updateSiteContent, updateSectionContent } from '@/lib/actions/site-content-actions'
import * as siteContentService from "@/lib/services/site-content-service"
import { revalidatePath, updateTag } from 'next/cache'

vi.mock('@/lib/services/auth-service', () => ({
  getCurrentUser: vi.fn(),
}))

vi.mock('@/lib/services/site-content-service', () => ({
  upsertSiteContent: vi.fn(),
  upsertSectionContent: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  updateTag: vi.fn(),
}))

describe('site-content-actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('updateSiteContent', () => {
    it('returns error when not authenticated', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue(null)

      const result = await updateSiteContent('hero', 'title', 'Hello')
      expect(result).toEqual({ error: 'Unauthorized' })
      expect(siteContentService.upsertSiteContent).not.toHaveBeenCalled()
    })

    it('upserts and revalidates on success', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)
      vi.mocked(siteContentService.upsertSiteContent).mockResolvedValue({ success: true })

      const result = await updateSiteContent('hero', 'title', 'Hello')

      expect(result).toEqual({ success: true })
      expect(siteContentService.upsertSiteContent).toHaveBeenCalledWith('hero', 'title', 'Hello')
      expect(updateTag).toHaveBeenCalledTimes(2)
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard/settings')
    })

    it('returns service error when upsert fails', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)
      vi.mocked(siteContentService.upsertSiteContent).mockResolvedValue({ error: 'DB error' })

      const result = await updateSiteContent('hero', 'title', 'Hello')
      expect(result).toEqual({ error: 'DB error' })
    })
  })

  describe('updateSectionContent', () => {
    it('returns error when not authenticated', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue(null)

      const result = await updateSectionContent('hero', [{ key: 'title', value: 'X' }])
      expect(result).toEqual({ error: 'Unauthorized' })
    })

    it('bulk upserts and revalidates on success', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)
      vi.mocked(siteContentService.upsertSectionContent).mockResolvedValue({ success: true })

      const entries = [{ key: 'title', value: 'A' }, { key: 'subtitle', value: 'B' }]
      const result = await updateSectionContent('hero', entries)

      expect(result).toEqual({ success: true })
      expect(siteContentService.upsertSectionContent).toHaveBeenCalledWith('hero', entries)
    })

    it('returns service error on failure', async () => {
      const { getCurrentUser } = await import('@/lib/services/auth-service')
      vi.mocked(getCurrentUser).mockResolvedValue({ id: 'admin' } as any)
      vi.mocked(siteContentService.upsertSectionContent).mockResolvedValue({ error: 'fail' })

      const result = await updateSectionContent('hero', [{ key: 'x', value: 'y' }])
      expect(result).toEqual({ error: 'fail' })
    })
  })
})
