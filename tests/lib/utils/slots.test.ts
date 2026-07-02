import { describe, it, expect } from 'vitest'
import { generateTimeSlots, START_HOUR, END_HOUR } from '@/lib/utils/slots'

describe('generateTimeSlots', () => {
  const slots = generateTimeSlots()

  it('generates correct number of slots', () => {
    // 14:00-22:30 = 18 slots + 23:00 = 19
    expect(slots).toHaveLength(19)
  })

  it('starts at START_HOUR:00', () => {
    expect(slots[0]).toBe(`${String(START_HOUR).padStart(2, '0')}:00`)
  })

  it('ends at END_HOUR:00', () => {
    expect(slots[slots.length - 1]).toBe(`${String(END_HOUR).padStart(2, '0')}:00`)
  })

  it('does not include END_HOUR:30', () => {
    expect(slots).not.toContain('23:30')
  })

  it('has 30-minute intervals', () => {
    for (let i = 0; i < slots.length - 1; i++) {
      const [h1, m1] = slots[i].split(':').map(Number)
      const [h2, m2] = slots[i + 1].split(':').map(Number)
      const diff = (h2 * 60 + m2) - (h1 * 60 + m1)
      expect(diff).toBe(30)
    }
  })

  it('includes both :00 and :30 for each hour except last', () => {
    for (let h = START_HOUR; h < END_HOUR; h++) {
      expect(slots).toContain(`${String(h).padStart(2, '0')}:00`)
      expect(slots).toContain(`${String(h).padStart(2, '0')}:30`)
    }
    expect(slots).toContain(`${String(END_HOUR).padStart(2, '0')}:00`)
  })

  it('returns fresh array on each call (no shared state)', () => {
    const a = generateTimeSlots()
    const b = generateTimeSlots()
    expect(a).toEqual(b)
    expect(a).not.toBe(b)
  })
})
