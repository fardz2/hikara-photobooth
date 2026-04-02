import { describe, it, expect } from 'vitest'
import { formatRevenueStats, type RawRevenueRow } from '@/lib/utils/revenue'

describe('formatRevenueStats', () => {
  const mockData: RawRevenueRow[] = [
    {
      total_price: 50000,
      payment_method: 'tunai',
      date: '2024-03-01',
      extra_print_count: 1,
      extra_people_count: 1
    },
    {
      total_price: 45000,
      payment_method: 'qris',
      date: '2024-03-01',
      extra_print_count: 0,
      extra_people_count: 2
    },
    {
      total_price: 35000,
      payment_method: 'tunai',
      date: '2024-03-02',
      extra_print_count: 0,
      extra_people_count: 0
    }
  ]

  it('calculates total revenue correctly', () => {
    const stats = formatRevenueStats(mockData)
    expect(stats.total).toBe(130000)
    expect(stats.transactionCount).toBe(3)
  })

  it('calculates payment method breakdown correctly', () => {
    const stats = formatRevenueStats(mockData)
    expect(stats.breakdown.tunai).toBe(85000) // 50000 + 35000
    expect(stats.breakdown.qris).toBe(45000)
  })

  it('calculates addon revenues correctly', () => {
    const stats = formatRevenueStats(mockData)
    // Row 1: 1 print (10k), 1 person (5k)
    // Row 2: 0 print (0k), 2 people (10k)
    // Row 3: 0 print (0k), 0 people (0k)
    expect(stats.breakdown.extraPrint).toBe(10000)
    expect(stats.breakdown.extraPeople).toBe(15000)
  })

  it('generates correct chart data sorted by date', () => {
    const stats = formatRevenueStats(mockData)
    expect(stats.chartData).toHaveLength(2)
    expect(stats.chartData[0]).toEqual({ date: '2024-03-01', amount: 95000 })
    expect(stats.chartData[1]).toEqual({ date: '2024-03-02', amount: 35000 })
  })

  it('handles empty data', () => {
    const stats = formatRevenueStats([])
    expect(stats.total).toBe(0)
    expect(stats.breakdown.tunai).toBe(0)
    expect(stats.chartData).toHaveLength(0)
  })
})
