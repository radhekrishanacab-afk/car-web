import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const SetupSchema = z.object({
  secret: z.string().min(1),
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = SetupSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
    }

    const { secret, username, email, password } = parsed.data

    const setupSecret = process.env.SETUP_SECRET
    if (!setupSecret || secret !== setupSecret) {
      return Response.json({ error: 'Invalid setup secret' }, { status: 403 })
    }

    const existing = await prisma.adminUser.findFirst()
    if (existing) {
      return Response.json({ error: 'Admin already configured. Setup endpoint is disabled.' }, { status: 403 })
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const admin = await prisma.adminUser.create({
      data: { username, email, passwordHash },
    })

    return Response.json({
      success: true,
      message: 'Admin account created successfully',
      adminId: admin.id,
    })
  } catch (error) {
    console.error('Setup error:', error)
    return Response.json({ error: 'Setup failed' }, { status: 500 })
  }
}

