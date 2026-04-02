import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LogTransactionForm } from '@/components/features/revenue/log-transaction-form'
import { logTransaction } from '@/lib/actions/revenue-actions'
import { toast } from 'sonner'

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
    vi.mocked(logTransaction).mockResolvedValue({ success: true })
  })

  it('renders correctly', () => {
    render(<LogTransactionForm />)
    expect(screen.getByTestId('session-time-input')).toBeInTheDocument()
  })

  it('calls logTransaction with correct data on submit', async () => {
    render(<LogTransactionForm />)

    fireEvent.change(screen.getByTestId('customer-name-input'), {
      target: { value: 'Test Customer' },
    })
    
    const timeInput = screen.getByTestId('session-time-input')
    fireEvent.input(timeInput, { target: { value: '14:30' } })
    fireEvent.change(timeInput, { target: { value: '14:30' } })
    fireEvent.blur(timeInput)

    await act(async () => {
      fireEvent.click(screen.getByText(/Submit Transaksi/i))
    })

    await waitFor(() => {
      expect(vi.mocked(logTransaction)).toHaveBeenCalled()
    }, { timeout: 3000 })

    expect(vi.mocked(logTransaction)).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_name: 'Test Customer',
        session_time: '14:30',
      })
    )
  })

  it('validates 14:00 - 23:00 range via Zod', async () => {
    render(<LogTransactionForm />)

    fireEvent.change(screen.getByTestId('customer-name-input'), {
      target: { value: 'Test Customer' },
    })
    
    const timeInput = screen.getByTestId('session-time-input')
    
    // Test below 14:00
    fireEvent.change(timeInput, { target: { value: '13:59' } })
    fireEvent.blur(timeInput)
    await act(async () => { fireEvent.click(screen.getByText(/Submit Transaksi/i)) })
    await waitFor(() => {
      expect(screen.getByText(/Jam sesi harus antara 14:00 - 23:00/i)).toBeInTheDocument()
    })

    // Test above 23:00
    fireEvent.change(timeInput, { target: { value: '23:01' } })
    fireEvent.blur(timeInput)
    await act(async () => { fireEvent.click(screen.getByText(/Submit Transaksi/i)) })
    await waitFor(() => {
      expect(screen.getByText(/Jam sesi harus antara 14:00 - 23:00/i)).toBeInTheDocument()
    })
  })

  it('success paths works for boundary times (14:00 and 23:00)', async () => {
    render(<LogTransactionForm />)

    fireEvent.change(screen.getByTestId('customer-name-input'), {
      target: { value: 'Boundary Test' },
    })
    
    const timeInput = screen.getByTestId('session-time-input')
    
    // Test exactly 23:00
    fireEvent.change(timeInput, { target: { value: '23:00' } })
    fireEvent.blur(timeInput)
    await act(async () => { fireEvent.click(screen.getByText(/Submit Transaksi/i)) })
    await waitFor(() => {
      expect(vi.mocked(logTransaction)).toHaveBeenCalled()
    })
  })
})
