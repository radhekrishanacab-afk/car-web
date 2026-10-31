import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const RouteSchema = z.object({
  originCityId: z.number().int().positive(),
  destinationCityId: z.number().int().positive(),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/).optional(),
  distanceKm: z.number().positive().optional().nullable(),
  estimatedHours: z.number().positive().optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  highlights: z.string().max(1000).optional().nullable(),
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
    ? {
        OR: [
          { originCity: { name: { contains: search } } },
          { destinationCity: { name: { contains: search } } },
        ],
      }
    : {}

  const [routes, total] = await Promise.all([
    prisma.route.findMany({
      where,
      include: {
        originCity: { select: { id: true, name: true, slug: true } },
        destinationCity: { select: { id: true, name: true, slug: true } },
        _count: { select: { priceOverrides: true, bookings: true } },
      },
      orderBy: [{ originCity: { name: 'asc' } }, { destinationCity: { name: 'asc' } }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.route.count({ where }),
  ])

  return Response.json({ routes, total, pages: Math.ceil(total / perPage) })
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = RouteSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const { originCityId, destinationCityId, slug, distanceKm, estimatedHours, description, highlights, isActive } = parsed.data

  if (originCityId === destinationCityId) {
    return Response.json({ error: 'Origin and destination cannot be the same city' }, { status: 400 })
  }

  // Auto-generate slug if not provided
  let routeSlug = slug
  if (!routeSlug) {
    const [origin, dest] = await Promise.all([
      prisma.city.findUnique({ where: { id: originCityId }, select: { slug: true } }),
      prisma.city.findUnique({ where: { id: destinationCityId }, select: { slug: true } }),
    ])
    if (!origin || !dest) {
      return Response.json({ error: 'One or both cities not found' }, { status: 404 })
    }
    routeSlug = `${origin.slug}-to-${dest.slug}`
  }

  const existing = await prisma.route.findFirst({
    where: {
      OR: [
        { slug: routeSlug },
        { originCityId, destinationCityId },
      ],
    },
  })
  if (existing) {
    return Response.json({ error: 'A route between these cities already exists' }, { status: 409 })
  }

  const route = await prisma.route.create({
    data: {
      originCityId,
      destinationCityId,
      slug: routeSlug,
      distanceKm: distanceKm ?? null,
      estimatedHours: estimatedHours ?? null,
      description: description ?? null,
      highlights: highlights ?? null,
      isActive: isActive ?? true,
    },
    include: {
      originCity: true,
      destinationCity: true,
    },
  })

  return Response.json({ route }, { status: 201 })
}

