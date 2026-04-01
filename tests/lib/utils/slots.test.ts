import { describe, it, expect } from 'vitest'
import { generateTimeSlots, START_HOUR, END_HOUR } from '@/lib/utils/slots'

describe('generateTimeSlots', () => {
  it('generates the correct number of slots', () => {
    const slots = generateTimeSlots()
    // (23 - 10) * 2 = 26 slots
    expect(slots).toHaveLength(26)
  })

  it('starts at the correct hour', () => {
    const slots = generateTimeSlots()
    expect(slots[0]).toBe(`${START_HOUR}:00`)
    expect(slots[1]).toBe(`${START_HOUR}:30`)
  })

  it('ends at the correct hour', () => {
    const slots = generateTimeSlots()
    expect(slots[slots.length - 1]).toBe(`${END_HOUR - 1}:30`)
  })
})
