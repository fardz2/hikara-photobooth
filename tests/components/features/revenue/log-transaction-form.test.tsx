import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LogTransactionForm } from '@/components/features/revenue/log-transaction-form'
import { logTransaction } from '@/lib/actions/revenue-actions'

// Mock the server action
vi.mock('@/lib/actions/revenue-actions', () => ({
  logTransaction: vi.fn(),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock Hugeicons
vi.mock('@hugeicons/react', () => ({
  HugeiconsIcon: () => <div data-testid="hugeicon" />,
}))

// Sync useTransition
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return {
    ...actual,
    useTransition: () => [false, (cb: () => void) => cb()],
  }
})

describe('LogTransactionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(logTransaction).mockResolvedValue({ success: true, message: 'Success' })
  })

  it('renders correctly', () => {
    render(<LogTransactionForm />)
    expect(screen.getByTestId('session-time-input')).toBeInTheDocument()
    expect(screen.getByText(/Nama Pelanggan/i)).toBeInTheDocument()
  })

  it('calls logTransaction with correct data on submit', async () => {
    const user = userEvent.setup()
    render(<LogTransactionForm />)

    const nameInput = screen.getByTestId('customer-name-input')
    const timeInput = screen.getByTestId('session-time-input')
    const submitBtn = screen.getByRole('button', { name: /Submit Transaksi/i })

    await user.type(nameInput, 'Test Customer')
    await user.type(timeInput, '14:30')
    await user.click(submitBtn)

    await waitFor(() => {
      expect(logTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_name: 'Test Customer',
          session_time: '14:30',
        })
      )
    }, { timeout: 4000 })
  })

  it('validates 14:00 - 23:00 range via Zod', async () => {
    const user = userEvent.setup()
    render(<LogTransactionForm />)

    const nameInput = screen.getByTestId('customer-name-input')
    const timeInput = screen.getByTestId('session-time-input')
    const submitBtn = screen.getByRole('button', { name: /Submit Transaksi/i })

    await user.type(nameInput, 'Validator User')
    
    // Test below 14:00
    await user.type(timeInput, '13:59')
    await user.click(submitBtn)
    
    await waitFor(() => {
      expect(screen.getByText((content) => content.includes('14:00 - 23:00'))).toBeInTheDocument()
    }, { timeout: 4000 })

    // Test above 23:00
    await user.clear(timeInput)
    await user.type(timeInput, '23:01')
    await user.click(submitBtn)
    
    await waitFor(() => {
      expect(screen.getAllByText((content) => content.includes('14:00 - 23:00')).length).toBeGreaterThan(0)
    }, { timeout: 4000 })
  })

  it('works for exactly 14:00', async () => {
    const user = userEvent.setup()
    render(<LogTransactionForm />)

    await user.type(screen.getByTestId('customer-name-input'), 'Start User')
    const timeInput = screen.getByTestId('session-time-input')
    
    fireEvent.change(timeInput, { target: { value: '14:00' } })
    fireEvent.blur(timeInput)
    
    await user.click(screen.getByRole('button', { name: /Submit Transaksi/i }))
    
    await waitFor(() => {
      expect(logTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ session_time: '14:00' })
      )
    }, { timeout: 4000 })
  })

  it('works for exactly 23:00', async () => {
    const user = userEvent.setup()
    render(<LogTransactionForm />)

    await user.type(screen.getByTestId('customer-name-input'), 'End User')
    const timeInput = screen.getByTestId('session-time-input')
    
    fireEvent.change(timeInput, { target: { value: '23:00' } })
    fireEvent.blur(timeInput)
    
    await user.click(screen.getByRole('button', { name: /Submit Transaksi/i }))
    
    await waitFor(() => {
      expect(logTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ session_time: '23:00' })
      )
    }, { timeout: 4000 })
  })
})
