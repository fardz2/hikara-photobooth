import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Checkbox } from '@/components/ui/checkbox'

describe('Checkbox Snapshot', () => {
  it('renders correctly', () => {
    const { container } = render(<Checkbox id="test" />)
    expect(container).toMatchSnapshot()
  })

  it('renders checked state correctly', () => {
    const { container } = render(<Checkbox id="test-checked" checked />)
    expect(container).toMatchSnapshot()
  })
})
