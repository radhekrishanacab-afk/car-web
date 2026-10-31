import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  email: z.string().email().optional().or(z.literal('')),
  subject: z.string().max(200).optional(),
  message: z.string().min(5).max(1000),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = ContactSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
    }

    const { name, phone, email, subject, message } = parsed.data

    await prisma.contactEnquiry.create({
      data: {
        name,
        phone,
        email: email || null,
        subject: subject || null,
        message,
      },
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Contact form error:', error)
    return Response.json({ error: 'Failed to save enquiry' }, { status: 500 })
  }
}

