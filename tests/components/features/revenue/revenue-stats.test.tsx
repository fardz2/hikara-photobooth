import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RevenueStats } from '@/components/features/revenue/revenue-stats'
import { revenueService } from '@/lib/services/revenue-service'
import { render, screen } from '@testing-library/react'

// Mock dependencies
vi.mock('@/lib/services/revenue-service', () => ({
  revenueService: {
    getRevenueStats: vi.fn(),
  },
}))

vi.mock('next/server', () => ({
  connection: vi.fn(),
}))

vi.mock('@/components/features/revenue/log-transaction-form', () => ({
  LogTransactionForm: () => <div data-testid="log-form" />,
}))

vi.mock('@/components/features/revenue/revenue-chart', () => ({
  RevenueChart: () => <div data-testid="revenue-chart" />,
}))

describe('RevenueStats Server Component', () => {
  const mockStats = {
    total: 100000,
    breakdown: {
      tunai: 60000,
      qris_manual: 40000,
      extraPrint: 10000,
      extraPeople: 5000,
    },
    transactionCount: 2,
    chartData: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders stats correctly when data is available', async () => {
    vi.mocked(revenueService.getRevenueStats).mockResolvedValue(mockStats)

    // Invoke the server component (async function)
    const jsx = await RevenueStats({ 
      searchParams: Promise.resolve({ range: 'today' }) 
    })
    
    // Render the resulting JSX
    render(jsx)

    expect(screen.getByText(/Rp 100.000/i)).toBeInTheDocument()
    expect(screen.getByText(/2 Transaksi Selesai/i)).toBeInTheDocument()
    expect(screen.getByText(/Rp 60.000/i)).toBeInTheDocument() // Tunai
    expect(screen.getByText(/Rp 40.000/i)).toBeInTheDocument() // QRIS
  })

  it('renders error message when stats loading fails', async () => {
    vi.mocked(revenueService.getRevenueStats).mockResolvedValue(null as any)

    const jsx = await RevenueStats({ 
      searchParams: Promise.resolve({}) 
    })
    render(jsx)

    expect(screen.getByText(/Gagal memuat data pendapatan/i)).toBeInTheDocument()
  })
})
