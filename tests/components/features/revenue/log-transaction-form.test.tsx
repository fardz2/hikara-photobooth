import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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

describe('LogTransactionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with default values', () => {
    render(<LogTransactionForm />)
    expect(screen.getByText(/Entry Transaksi/i)).toBeInTheDocument()
    expect(screen.getByText(/Rp 35.000/i)).toBeInTheDocument()
  })

  it('updates total price when counters are incremented', () => {
    render(<LogTransactionForm />)
    
    // Find "Tambah Orang" + button
    // The buttons have text "+" and "-"
    const plusButtons = screen.getAllByText('+')
    const extraPeoplePlus = plusButtons[0] 
    
    fireEvent.click(extraPeoplePlus) // +1 person (5000)
    
    expect(screen.getByText(/Rp 40.000/i)).toBeInTheDocument()
  })

  it('toggles addons and updates price', () => {
    render(<LogTransactionForm />)
    
    const checkbox = screen.getByLabelText(/Custom Frame/i)
    fireEvent.click(checkbox) // +15000
    
    expect(screen.getByText(/Rp 50.000/i)).toBeInTheDocument()
  })

  it('submits the form successfully', async () => {
    vi.mocked(logTransaction).mockResolvedValueOnce({ success: true })
    
    render(<LogTransactionForm />)
    
    const submitButton = screen.getByText(/Submit Transaksi/i)
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(logTransaction).toHaveBeenCalled()
      expect(toast.success).toHaveBeenCalledWith('Transaksi berhasil dicatat')
    })
  })

  it('handles submission failure', async () => {
    vi.mocked(logTransaction).mockResolvedValueOnce({ success: false, message: 'Error' })
    
    render(<LogTransactionForm />)
    
    const submitButton = screen.getByText(/Submit Transaksi/i)
    fireEvent.click(submitButton)
    
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Gagal mencatat transaksi')
    })
  })
})
