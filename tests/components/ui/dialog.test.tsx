import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogTitle 
} from '@/components/ui/dialog'

describe('Dialog Component', () => {
  it('renders trigger correctly', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByText('Open Dialog')).toBeDefined()
  })

  it('contains the title in the DOM (mocked state)', () => {
    // In JSDOM with Radix, content might be hidden until clicked
    // but the presence of the structure is what we test here
    render(
      <Dialog open={true}>
        <DialogContent>
          <DialogTitle>Accessible Title</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByText('Accessible Title')).toBeDefined()
  })
})
