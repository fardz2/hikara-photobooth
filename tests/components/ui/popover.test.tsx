import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { 
  Popover, 
  PopoverTrigger, 
  PopoverContent 
} from '@/components/ui/popover'

describe('Popover Component', () => {
  it('renders trigger correctly', () => {
    render(
      <Popover>
        <PopoverTrigger>Toggle Popover</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>
    )
    expect(screen.getByText('Toggle Popover')).toBeDefined()
  })

  it('renders open content correctly', () => {
    render(
      <Popover open={true}>
        <PopoverContent>Visible Content</PopoverContent>
      </Popover>
    )
    expect(screen.getByText('Visible Content')).toBeDefined()
  })
})
