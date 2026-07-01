import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getCurrentUser } from '@/lib/services/auth-service'
import { createClient } from '@/lib/supabase/server'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

describe('auth-service', () => {
  let mockSupabase: { auth: { getUser: ReturnType<typeof vi.fn> } }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabase = { auth: { getUser: vi.fn() } }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
  })

  describe('getCurrentUser', () => {
    it('returns user when authenticated', async () => {
      const fakeUser = { id: 'u-1', email: 'test@test.com' }
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: fakeUser },
      })

      const result = await getCurrentUser()

      expect(result).toEqual(fakeUser)
      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
    })

    it('returns null when not logged in', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      })

      const result = await getCurrentUser()

      expect(result).toBeNull()
    })
  })
})
