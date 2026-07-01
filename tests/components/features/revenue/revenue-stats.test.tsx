import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RevenueStats } from '@/components/features/revenue/revenue-stats'
import * as revenueService from "@/lib/services/revenue-service";
import type { PricingItem } from "@/lib/services/site-content-service";
import { render, screen } from '@testing-library/react'

const mockPricing: PricingItem[] = [
  { label: "Foto per Sesi", price: 35000, maxPeople: 3, category: "package" as const },
  { label: "Tambahan per Orang", price: 5000, category: "extra" as const },
]

// Mock dependencies
vi.mock('@/lib/services/revenue-service', () => ({
  getRevenueStats: vi.fn(),
}))

vi.mock('@/lib/services/site-content-service', () => ({
  getPricing: vi.fn(),
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
      qris: 40000,
      extraPrint: 10000,
      extraPeople: 5000,
    },
    transactionCount: 2,
    chartData: [],
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    const siteContentService = await import('@/lib/services/site-content-service');
    vi.mocked(siteContentService.getPricing).mockResolvedValue(mockPricing);
    vi.mocked(revenueService.getRevenueStats).mockResolvedValue(mockStats)
    
  })

  it('renders stats correctly when data is available', async () => {
    const { getPricing } = await import('@/lib/services/site-content-service');
    vi.mocked(getPricing).mockResolvedValue(mockPricing);

    const jsx = await RevenueStats({ 
      searchParams: Promise.resolve({ range: 'today' }) 
    })
    
    render(jsx)

    expect(screen.getByText(/Rp 100.000/i)).toBeInTheDocument()
    expect(screen.getByText(/Rp 60.000/i)).toBeInTheDocument()
    expect(screen.getByText(/Rp 40.000/i)).toBeInTheDocument()
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
