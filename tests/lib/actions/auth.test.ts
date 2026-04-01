import { describe, it, expect, vi, beforeEach } from 'vitest'
import { login, logout } from '@/lib/actions/auth-actions'
import { redirect } from 'next/navigation'

// Mock next/cache and next/navigation
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn()
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn()
}))

// Mock Supabase Server Client
const mockSupabase = {
  auth: {
    signInWithPassword: vi.fn(),
    signOut: vi.fn()
  }
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase))
}))

describe('Auth Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects to dashboard when login is successful', async () => {
    const formData = new FormData()
    formData.append('email', 'test@test.com')
    formData.append('password', 'password123')

    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      error: null,
      data: { user: {} }
    })

    await login(formData)

    expect(redirect).toHaveBeenCalledWith('/dashboard')
  })

  it('returns an error message when login fails', async () => {
    const formData = new FormData()
    formData.append('email', 'wrong@test.com')
    formData.append('password', 'wrong')

    mockSupabase.auth.signInWithPassword.mockResolvedValueOnce({
      error: { message: 'Invalid login' },
      data: null
    })

    const result = await login(formData)
    expect(result).toEqual({ error: 'Invalid login' })
    expect(redirect).not.toHaveBeenCalled()
  })

  it('redirects to login when logging out', async () => {
    mockSupabase.auth.signOut.mockResolvedValueOnce({ error: null })
    await logout()
    expect(redirect).toHaveBeenCalledWith('/login')
  })
})
