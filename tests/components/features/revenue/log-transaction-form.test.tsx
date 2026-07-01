import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { LogTransactionForm } from '@/components/features/revenue/log-transaction-form'
import { logTransaction } from '@/lib/actions/revenue-actions'
import type { PricingItem } from '@/lib/services/pricing-service'

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

const mockPricing: PricingItem[] = [
  { id: "pkg1", label: "Foto per Sesi + 2 Photostrip (Maks 3 Orang)", price: 35000, maxPeople: 3, note: "MAX. 3 ORANG", category: "package" as const },
  { id: "ext1", label: "Tambahan per Orang", price: 5000, category: "extra" as const },
  { id: "ext2", label: "Extra Print", price: 10000, category: "extra" as const },
  { id: "addon1", label: "Custom Frame Birthday, Dll", price: 15000, category: "addon" as const },
]

describe('LogTransactionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(logTransaction).mockResolvedValue({ success: true, message: 'Success' })
  })

  it('renders correctly', () => {
    render(<LogTransactionForm pricing={mockPricing} />)
    expect(screen.getByTestId('session-time-input')).toBeInTheDocument()
    expect(screen.getByText(/Nama Pelanggan/i)).toBeInTheDocument()
  })

  it('calls logTransaction with correct data on submit', async () => {
    const user = userEvent.setup()
    render(<LogTransactionForm pricing={mockPricing} />)

    const nameInput = screen.getByTestId('customer-name-input')
    const timeInput = screen.getByTestId('session-time-input')
    const submitBtn = screen.getByRole('button', { name: /Submit Transaksi/i })

    await user.type(nameInput, 'Test Customer')
    await user.type(timeInput, '14:30')

    // Select first package
    const pkgBtn = screen.getByText(/Foto per Sesi/i).closest('button')!
    await user.click(pkgBtn)

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

  it('allows any time to be submitted', async () => {
    const user = userEvent.setup()
    render(<LogTransactionForm pricing={mockPricing} />)

    const nameInput = screen.getByTestId('customer-name-input')
    const timeInput = screen.getByTestId('session-time-input')
    const submitBtn = screen.getByRole('button', { name: /Submit Transaksi/i })

    // Test with a time formerly outside the range (e.g., 08:00)
    await user.type(nameInput, 'Anytime User')
    fireEvent.change(timeInput, { target: { value: '08:00' } })

    // Select first package
    const pkgBtn = screen.getByText(/Foto per Sesi/i).closest('button')!
    await user.click(pkgBtn)

    await user.click(submitBtn)
    
    await waitFor(() => {
      expect(logTransaction).toHaveBeenCalledWith(
        expect.objectContaining({ session_time: '08:00' })
      )
    }, { timeout: 4000 })
  })
})
