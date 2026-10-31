import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createSession } from '@/lib/auth'
import { cookies } from 'next/headers'
import { z } from 'zod'

const LoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = LoginSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { username, password } = parsed.data

    const admin = await prisma.adminUser.findFirst({
      where: {
        OR: [{ username }, { email: username }],
      },
    })

    if (!admin) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, admin.passwordHash)
    if (!valid) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = await createSession({ adminId: admin.id, username: admin.username })

    const cookieStore = await cookies()
    cookieStore.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return Response.json({ success: true, username: admin.username })
  } catch (error) {
    console.error('Login error:', error)
    return Response.json({ error: 'Login failed' }, { status: 500 })
  }
}

