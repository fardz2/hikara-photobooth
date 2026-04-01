import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Skeleton } from '@/components/ui/skeleton'

describe('Skeleton', () => {
  it('renders correctly with default styles', () => {
    const { asFragment } = render(<Skeleton className="w-[100px] h-[20px]" />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders correctly with rounded full', () => {
    const { asFragment } = render(<Skeleton className="w-10 h-10 rounded-full" />)
    expect(asFragment()).toMatchSnapshot()
  })
})
