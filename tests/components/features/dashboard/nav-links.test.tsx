import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { NavLinks } from '@/components/features/dashboard/nav-links'
import { usePathname } from 'next/navigation'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}))

describe('NavLinks', () => {
  it('renders all links correctly', () => {
    vi.mocked(usePathname).mockReturnValue('/dashboard')
    render(<NavLinks />)
    
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Reservasi')).toBeInTheDocument()
    expect(screen.getByText('Pendapatan')).toBeInTheDocument()
    expect(screen.getByText('Kunjungi Situs')).toBeInTheDocument()
  })

  it('highlights the active link based on pathname', () => {
    vi.mocked(usePathname).mockReturnValue('/dashboard/reservations')
    render(<NavLinks />)
    
    const reservasiLink = screen.getByText('Reservasi')
    // Active link has specific background color class
    expect(reservasiLink).toHaveClass('bg-[#F6F4F0]')
    
    const overviewLink = screen.getByText('Overview')
    // Inactive link should NOT have that class
    expect(overviewLink).not.toHaveClass('bg-[#F6F4F0]')
  })
})
