import { describe, it, expect } from 'vitest'
import { ReservationSchema } from '@/lib/validations/reservation'

describe('ReservationSchema', () => {
  const validData = {
    name: 'Test Member',
    phone: '8123456789',
    date: new Date(),
    time: '14:00',
    package: 'paket_utama',
    addons: [],
    extraPeopleCount: 0,
    extraPrintCount: 2,
    paymentMethod: 'tunai'
  }

  it('validates a correct reservation object', () => {
    const result = ReservationSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('rejects phone numbers starting with 0', () => {
    const data = { ...validData, phone: '08123456789' }
    const result = ReservationSchema.safeParse(data)
    
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map(e => e.message)
      expect(messages).toContain('Jangan awali dengan 0 (contoh: 82148645084)')
    }
  })

  it('rejects names shorter than 2 characters', () => {
    const data = { ...validData, name: 'A' }
    const result = ReservationSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('enforces maximum 5 extra people', () => {
    const data = { ...validData, extraPeopleCount: 6 }
    const result = ReservationSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it('requires a reservation date', () => {
    const data = { ...validData, date: null }
    const result = ReservationSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})
