import { z } from 'zod';

export const reservationSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  phone: z.string().regex(/^8\d+$/, { message: 'Phone must start with 8' }),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: 'Invalid date format' }),
  time: z.string().refine((time) => /([01]?[0-9]|2[0-3]):[0-5][0-9]/.test(time), { message: 'Invalid time format' }),
  package: z.string().min(1, { message: 'Package is required' }),
  addons: z.array(z.string()).optional(),
  extraPeopleCount: z.number().min(0, { message: 'Extra people count must be at least 0' }),
  extraPrintCount: z.number().min(0, { message: 'Extra print count must be at least 0' }),
  paymentMethod: z.string().min(1, { message: 'Payment method is required' }),
  paymentProof: z.string().optional(),
});