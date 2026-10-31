import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const CitySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers and hyphens'),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isPopular: z.boolean().optional(),
  popularOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

async function requireAdmin() {
  const session = await getSession()
  if (!session) return null
  return session
}

export async function GET(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const search = searchParams.get('search') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const perPage = 20

  const where = search
    ? { name: { contains: search } }
    : {}

  const [cities, total] = await Promise.all([
    prisma.city.findMany({
      where,
      include: {
        _count: { select: { routesFrom: true } },
      },
      orderBy: { name: 'asc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.city.count({ where }),
  ])

  return Response.json({
    cities: cities.map((c) => ({ ...c, routeCount: c._count.routesFrom })),
    total,
    pages: Math.ceil(total / perPage),
  })
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = CitySchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const { name, slug, description, imageUrl, isPopular, popularOrder, isActive } = parsed.data

  const existing = await prisma.city.findFirst({
    where: { OR: [{ name }, { slug }] },
  })
  if (existing) {
    return Response.json({ error: 'A city with this name or slug already exists' }, { status: 409 })
  }

  const city = await prisma.city.create({
    data: {
      name,
      slug,
      description: description || null,
      imageUrl: imageUrl || null,
      isPopular: isPopular ?? false,
      popularOrder: popularOrder ?? 0,
      isActive: isActive ?? true,
    },
  })

  return Response.json({ city }, { status: 201 })
}

