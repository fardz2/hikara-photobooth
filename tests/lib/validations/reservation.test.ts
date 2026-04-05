import { describe, it, expect } from 'vitest'
import { ReservationSchema } from '@/lib/validations/reservation'

describe('ReservationSchema', () => {
  const validData = {
    name: 'Test Member',
    phone: '628123456789',
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

  it('accepts and normalizes phone numbers starting with 08', () => {
    const data = { ...validData, phone: '08123456789' }
    const result = ReservationSchema.safeParse(data)
    
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.phone).toBe('628123456789')
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

  it('accepts reservation time between 14:00 and 23:00', () => {
    expect(ReservationSchema.safeParse({ ...validData, time: '14:00' }).success).toBe(true)
    expect(ReservationSchema.safeParse({ ...validData, time: '23:00' }).success).toBe(true)
    expect(ReservationSchema.safeParse({ ...validData, time: '18:30' }).success).toBe(true)
  })

  it('rejects reservation time before 14:00 or after 23:00', () => {
    expect(ReservationSchema.safeParse({ ...validData, time: '13:59' }).success).toBe(false)
    expect(ReservationSchema.safeParse({ ...validData, time: '23:01' }).success).toBe(false)
    expect(ReservationSchema.safeParse({ ...validData, time: '09:00' }).success).toBe(false)
  })
})
