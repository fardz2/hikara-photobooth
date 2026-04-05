import { z } from 'zod';

export const ReservationSchema = z.object({
    name: z.string().nonempty("Name is required"),
    phone: z.string().regex(/^8\\d+$/, "Phone must start with 8 and contain only digits"),
    date: z.string().nonempty("Date is required"),
    time: z.string().nonempty("Time is required"),
    package: z.string().nonempty("Package is required"),
    addons: z.array(z.string()),
    extraPeopleCount: z.number().min(0).optional(),
    extraPrintCount: z.number().min(0).optional(),
    paymentMethod: z.string().nonempty("Payment method is required"),
    paymentProof: z.string().url("Payment proof must be a valid URL")
});

export const ReservationValues = ReservationSchema.safeParse;
