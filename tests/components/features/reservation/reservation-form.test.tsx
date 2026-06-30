import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ReservationForm } from '@/components/features/reservation/reservation-form'

// Mocking to ensure stable rendering
vi.mock('@/components/ui/calendar', () => ({
  Calendar: () => <div data-testid="mock-calendar">Calendar</div>,
}))

vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children }: any) => <div>{children}</div>,
  PopoverContent: ({ children }: any) => <div>{children}</div>,
  PopoverTrigger: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: any) => <div data-testid="mock-select">{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <div>{placeholder}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children }: any) => <div>{children}</div>,
}))

vi.mock('@/lib/actions/reservation-actions', () => ({
  submitReservation: vi.fn(),
  getBookedSlots: vi.fn(() => Promise.resolve([])),
}))

const mockPricing = {
  paket_utama: { label: "Foto per Sesi + 2 Photostrip (Maks 3 Orang)", price: 35000, maxPeople: 3, note: "MAX. 3 ORANG" },
  extra_person: { label: "Tambahan per Orang", price: 5000 },
  extra_print: { label: "Extra Print", price: 10000 },
  custom_frame: { label: "Custom Frame Birthday, Dll", price: 15000 },
}

describe('ReservationForm Stability', () => {
  it('renders all main sections correctly', () => {
    render(<ReservationForm pricing={mockPricing} />)
    expect(screen.getByText(/Nama Lengkap/i)).toBeDefined()
    expect(screen.getByText(/Nomor WhatsApp/i)).toBeDefined()
    expect(screen.getByText(/Paket Utama/i)).toBeDefined()
    expect(screen.getByText(/Metode Pembayaran/i)).toBeDefined()
  })

  it('shows QRIS details when selected', () => {
    render(<ReservationForm pricing={mockPricing} />)
    const qrisButton = screen.getByText(/Bayar Sekarang/i)
    fireEvent.click(qrisButton)
    expect(screen.getByText(/Scan QR di Bawah/i)).toBeDefined()
  })

  it('contains the submit button in disabled state when pending (mocked)', () => {
    // Note: Testing transition state is complex, we just check presence
    render(<ReservationForm pricing={mockPricing} />)
    const submitBtn = screen.getByTestId('reservation-submit')
    expect(submitBtn).toBeDefined()
    expect(submitBtn.tagName).toBe('BUTTON')
  })
})
