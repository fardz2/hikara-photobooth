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

const mockPricing = [
  { label: "Foto per Sesi + 2 Photostrip (Maks 3 Orang)", price: 35000, maxPeople: 3, note: "MAX. 3 ORANG" },
  { label: "Tambahan per Orang", price: 5000 },
  { label: "Extra Print", price: 10000 },
  { label: "Custom Frame Birthday, Dll", price: 15000 },
]

describe('ReservationForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<ReservationForm pricing={mockPricing} />)
  })

  it('shows the correct package name', () => {
    render(<ReservationForm pricing={mockPricing} />)
    expect(screen.getByText(/Foto per Sesi/i)).toBeDefined()
  })

  it('shows extra price info', () => {
    render(<ReservationForm pricing={mockPricing} />)
    expect(screen.getByText(/5.000/i)).toBeDefined()
  })
})
