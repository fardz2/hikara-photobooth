import { describe, it, expect } from 'vitest'
import { formatRevenueStats, type RawRevenueRow } from '@/lib/utils/revenue'
import { type PricingItem } from "@/lib/services/pricing-service"

const mockPricing: PricingItem[] = [
  { id: "pkg1", label: "Foto per Sesi + 2 Photostrip (Maks 3 Orang)", price: 35000, maxQty: 3, category: "package" as const },
  { id: "ext1", label: "Tambahan per Orang", price: 5000, maxQty: 10, category: "extra" as const },
  { id: "ext2", label: "Extra Print", price: 10000, maxQty: null, category: "extra" as const },
  { id: "addon1", label: "Custom Frame Birthday, Dll", price: 15000, category: "addon" as const },
]

describe('formatRevenueStats', () => {
  const mockData: RawRevenueRow[] = [
    { total_price: 50000, payment_method: 'tunai', date: '2024-03-01', extra_print_count: 1, extra_people_count: 1 },
    { total_price: 45000, payment_method: 'qris', date: '2024-03-01', extra_print_count: 0, extra_people_count: 2 },
    { total_price: 35000, payment_method: 'tunai', date: '2024-03-02', extra_print_count: 0, extra_people_count: 0 },
  ]

  it('calculates total revenue correctly', () => {
    const stats = formatRevenueStats(mockData, mockPricing)
    expect(stats.total).toBe(130000)
    expect(stats.transactionCount).toBe(3)
  })

  it('calculates payment method breakdown correctly', () => {
    const stats = formatRevenueStats(mockData, mockPricing)
    expect(stats.breakdown.tunai).toBe(85000)
    expect(stats.breakdown.qris).toBe(45000)
  })

  it('calculates addon revenues correctly', () => {
    const stats = formatRevenueStats(mockData, mockPricing)
    expect(stats.breakdown.extraPrint).toBe(10000)
    expect(stats.breakdown.extraPeople).toBe(15000)
  })

  it('generates correct chart data sorted by date', () => {
    const stats = formatRevenueStats(mockData, mockPricing)
    expect(stats.chartData).toHaveLength(2)
    expect(stats.chartData[0]).toEqual({ date: '2024-03-01', amount: 95000 })
    expect(stats.chartData[1]).toEqual({ date: '2024-03-02', amount: 35000 })
  })

  it('handles empty data', () => {
    const stats = formatRevenueStats([], mockPricing)
    expect(stats.total).toBe(0)
    expect(stats.breakdown.tunai).toBe(0)
    expect(stats.chartData).toHaveLength(0)
    expect(stats.transactionCount).toBe(0)
  })

  it('falls back to defaults when pricing is incomplete', () => {
    const partialPricing: PricingItem[] = [
      { label: "Paket", price: 35000, maxQty: 3, category: "package" as const },
    ]
    const stats = formatRevenueStats(mockData, partialPricing)
    expect(stats.breakdown.extraPrint).toBe(10000)
    expect(stats.breakdown.extraPeople).toBe(15000)
  })

  it('handles null total_price as 0', () => {
    const data: RawRevenueRow[] = [
      { total_price: null, payment_method: 'tunai', date: '2024-03-01', extra_print_count: 0, extra_people_count: 0 },
    ]
    const stats = formatRevenueStats(data, mockPricing)
    expect(stats.total).toBe(0)
    expect(stats.breakdown.tunai).toBe(0)
  })

  it('handles null extra counts as 0', () => {
    const data: RawRevenueRow[] = [
      { total_price: 35000, payment_method: 'tunai', date: '2024-03-01', extra_print_count: null, extra_people_count: null },
    ]
    const stats = formatRevenueStats(data, mockPricing)
    expect(stats.breakdown.extraPrint).toBe(0)
    expect(stats.breakdown.extraPeople).toBe(0)
  })

  it('handles null date as "unknown"', () => {
    const data: RawRevenueRow[] = [
      { total_price: 10000, payment_method: 'tunai', date: null, extra_print_count: 0, extra_people_count: 0 },
    ]
    const stats = formatRevenueStats(data, mockPricing)
    expect(stats.chartData).toHaveLength(1)
    expect(stats.chartData[0].date).toBe('unknown')
  })

  it('handles null payment_method as tunai bucket (not qris)', () => {
    const data: RawRevenueRow[] = [
      { total_price: 10000, payment_method: null, date: '2024-03-01', extra_print_count: 0, extra_people_count: 0 },
    ]
    const stats = formatRevenueStats(data, mockPricing)
    expect(stats.breakdown.tunai).toBe(10000)
    expect(stats.breakdown.qris).toBe(0)
  })

  it('single row data', () => {
    const data: RawRevenueRow[] = [
      { total_price: 99000, payment_method: 'qris', date: '2024-06-15', extra_print_count: 3, extra_people_count: 0 },
    ]
    const stats = formatRevenueStats(data, mockPricing)
    expect(stats.total).toBe(99000)
    expect(stats.transactionCount).toBe(1)
    expect(stats.chartData).toHaveLength(1)
    expect(stats.breakdown.extraPrint).toBe(30000)
  })
})
