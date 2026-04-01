import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ProofPreview } from '@/components/features/dashboard/proof-preview'

// Use vi.hoisted to define the mock behavior before vi.mock hoisting
const { mockDialog } = vi.hoisted(() => ({
  mockDialog: {
    Dialog: vi.fn(({ children, open }: any) => <div data-state={open ? 'open' : 'closed'}>{children}</div>),
    DialogTrigger: vi.fn(({ children }: any) => <div>{children}</div>),
    DialogContent: vi.fn(({ children }: any) => <div>{children}</div>),
    DialogTitle: vi.fn(({ children }: any) => <div>{children}</div>),
    DialogDescription: vi.fn(({ children }: any) => <div>{children}</div>),
  }
}))

// Mock Dialog UI primitive
vi.mock('@/components/ui/dialog', () => ({
  Dialog: mockDialog.Dialog,
  DialogTrigger: mockDialog.DialogTrigger,
  DialogContent: mockDialog.DialogContent,
  DialogTitle: mockDialog.DialogTitle,
  DialogDescription: mockDialog.DialogDescription,
}))

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useAnimation: () => ({ start: vi.fn() }),
  useMotionValue: () => ({ set: vi.fn(), get: vi.fn() }),
}))

describe('ProofPreview', () => {
  const mockUrl = 'https://example.com/proof.jpg'

  it('renders trigger button correctly', () => {
    mockDialog.Dialog.mockImplementation(({ children }: any) => <div>{children}</div>)
    render(<ProofPreview url={mockUrl} />)
    expect(screen.getByText(/Cek Bukti/i)).toBeInTheDocument()
  })

  it('contains download link with correct URL', () => {
    // Force open/render content
    mockDialog.Dialog.mockImplementation(({ children }: any) => <div>{children}</div>)
    
    render(<ProofPreview url={mockUrl} />)
    const downloadLink = screen.getByRole('link')
    expect(downloadLink).toHaveAttribute('href', mockUrl)
    expect(downloadLink).toHaveAttribute('download')
  })
})
