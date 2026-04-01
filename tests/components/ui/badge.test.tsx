import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  it('renders correctly with default variant', () => {
    const { asFragment } = render(<Badge>Default</Badge>)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders correctly with secondary variant', () => {
    const { asFragment } = render(<Badge variant="secondary">Secondary</Badge>)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders correctly with destructive variant', () => {
    const { asFragment } = render(<Badge variant="destructive">Destructive</Badge>)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders correctly with outline variant', () => {
    const { asFragment } = render(<Badge variant="outline">Outline</Badge>)
    expect(asFragment()).toMatchSnapshot()
  })
})
