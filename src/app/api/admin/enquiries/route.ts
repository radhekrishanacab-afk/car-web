import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

async function requireAdmin() {
  const session = await getSession()
  if (!session) return null
  return session
}

export async function GET(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const perPage = 20
  const search = searchParams.get('search') ?? ''
  const unreadOnly = searchParams.get('unread') === 'true'

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { phone: { contains: search } },
      { email: { contains: search } },
    ]
  }
  if (unreadOnly) where.isRead = false

  const [enquiries, total] = await Promise.all([
    prisma.contactEnquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.contactEnquiry.count({ where }),
  ])

  return Response.json({ enquiries, total, pages: Math.ceil(total / perPage) })
}

