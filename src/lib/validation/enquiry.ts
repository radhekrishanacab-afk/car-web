import { z } from 'zod'
import { buildHomeBookingMessage } from '@/lib/whatsapp'

export const EnquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
  pickup: z.string().min(3, 'Pickup address is required').max(200),
  destination: z.string().min(3, 'Drop address is required').max(200),
  date: z.string().min(1, 'Travel date is required'),
  time: z.string().min(1, 'Pickup time is required'),
  vehicle: z.string().min(1, 'Please select a vehicle preference'),
  message: z.string().max(500).optional(),
})

export type EnquiryFormData = z.infer<typeof EnquirySchema>

export function buildWhatsAppMessage(data: EnquiryFormData): string {
  return buildHomeBookingMessage({
    name: data.name,
    mobile: data.mobile,
    pickup: data.pickup,
    drop: data.destination,
    date: data.date,
    time: data.time,
    vehicle: data.vehicle,
    notes: data.message,
    source: 'Enquiry Form',
  })
}
