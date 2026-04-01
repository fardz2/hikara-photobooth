import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('flex', 'items-center')).toBe('flex items-center')
  })

  it('handles conditional classes', () => {
    expect(cn('flex', true && 'items-center', false && 'justify-center')).toBe('flex items-center')
  })

  it('merges tailwind classes and resolves conflicts', () => {
    // p-4 and p-2 conflict, p-2 should win if it's later in the list
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('handles undefined and null values', () => {
    expect(cn('flex', undefined, null, 'items-center')).toBe('flex items-center')
  })
})
