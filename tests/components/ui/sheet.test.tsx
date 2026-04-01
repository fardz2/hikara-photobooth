import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { 
  Sheet, 
  SheetTrigger, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet'

describe('Sheet Component', () => {
  it('renders trigger correctly', () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sidebar</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    )
    expect(screen.getByText('Open Sidebar')).toBeDefined()
  })
})
