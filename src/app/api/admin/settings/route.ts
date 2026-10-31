import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const SettingsSchema = z.object({
  businessName: z.string().min(2).max(200),
  phone: z.string().min(5).max(30),
  whatsappNumber: z.string().min(5).max(20),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  logoUrl: z.string().url().optional().nullable().or(z.literal('')),
  metaDescription: z.string().max(500).optional().nullable(),
})

async function requireAdmin() {
  const session = await getSession()
  if (!session) return null
  return session
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = SettingsSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const d = parsed.data
  const existing = await prisma.contactSettings.findFirst()

  const settings = existing
    ? await prisma.contactSettings.update({
        where: { id: existing.id },
        data: {
          businessName: d.businessName,
          phone: d.phone,
          whatsappNumber: d.whatsappNumber,
          email: d.email || '',
          address: d.address || '',
          logoUrl: d.logoUrl || null,
          metaDescription: d.metaDescription || null,
        },
      })
    : await prisma.contactSettings.create({
        data: {
          businessName: d.businessName,
          phone: d.phone,
          whatsappNumber: d.whatsappNumber,
          email: d.email || '',
          address: d.address || '',
          logoUrl: d.logoUrl || null,
          metaDescription: d.metaDescription || null,
        },
      })

  return Response.json({ settings })
}
