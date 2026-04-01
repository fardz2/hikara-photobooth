import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { RevenueChart } from '@/components/features/revenue/revenue-chart'

// Mock Recharts to avoid measurement issues in JSDOM
vi.mock('recharts', () => ({
  Bar: () => <div data-testid="bar" />,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  CartesianGrid: () => <div data-testid="grid" />,
  XAxis: () => <div data-testid="xaxis" />,
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
}))

// Mock Chart UI components
vi.mock('@/components/ui/chart', () => ({
  ChartContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  ChartTooltip: () => <div data-testid="tooltip" />,
  ChartTooltipContent: () => <div data-testid="tooltip-content" />,
}))

describe('RevenueChart', () => {
  const mockData = [
    { date: '2024-03-01', amount: 50000 },
    { date: '2024-03-02', amount: 35000 },
  ]

  it('renders "no data" message when data is empty', () => {
    render(<RevenueChart data={[]} />)
    expect(screen.getByText(/Tidak ada data transaksi/i)).toBeInTheDocument()
  })

  it('renders the chart container when data is provided', () => {
    render(<RevenueChart data={mockData} />)
    expect(screen.getByTestId('chart-container')).toBeInTheDocument()
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
  })
})
