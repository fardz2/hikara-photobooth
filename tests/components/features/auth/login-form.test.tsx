import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LoginForm } from '@/components/features/auth/login-form'
import { login } from '@/lib/actions/auth-actions'
import { toast } from 'sonner'

// Mock dependencies
vi.mock('@/lib/actions/auth-actions', () => ({
  login: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login form fields correctly', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Masuk ke Dashboard/i })).toBeInTheDocument()
  })
  it('shows error toast when login fails', async () => {
    vi.mocked(login).mockResolvedValueOnce({ error: 'Email atau password salah' })
    
    render(<LoginForm />)
    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'wrong@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } })
    
    fireEvent.click(screen.getByRole('button', { name: /Masuk ke Dashboard/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Email atau password salah')
    })
  })

  it('toggles password visibility', () => {
    render(<LoginForm />)
    const passwordInput = screen.getByLabelText(/Password/i)
    const toggleBtn = screen.getByLabelText(/Tampilkan kata sandi/i)

    expect(passwordInput).toHaveAttribute('type', 'password')
    
    fireEvent.click(toggleBtn)
    expect(passwordInput).toHaveAttribute('type', 'text')
    
    fireEvent.click(screen.getByLabelText(/Sembunyikan kata sandi/i))
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('calls login action on valid submission', async () => {
    render(<LoginForm />)
    
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } })
    
    fireEvent.click(screen.getByRole('button', { name: /Masuk ke Dashboard/i }))

    await waitFor(() => {
      expect(login).toHaveBeenCalledTimes(1)
    })
  })
})
