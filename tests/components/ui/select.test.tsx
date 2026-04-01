import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from '@/components/ui/select'

describe('Select Component', () => {
  it('renders trigger with placeholder', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Pilih paket" />
        </SelectTrigger>
      </Select>
    )
    expect(screen.getByText('Pilih paket')).toBeDefined()
  })
})
