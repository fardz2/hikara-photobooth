import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Label } from '@/components/ui/label'

describe('Label', () => {
  it('renders correctly', () => {
    const { asFragment } = render(<Label htmlFor="test">Test Label</Label>)
    expect(asFragment()).toMatchSnapshot()
  })
})
