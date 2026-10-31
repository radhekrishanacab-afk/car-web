import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const VehicleSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  passengerCapacity: z.number().int().min(1).max(20),
  luggageCapacity: z.number().int().min(0).max(20),
  perKmRate: z.number().positive(),
  minimumFare: z.number().positive(),
  minimumBillableKm: z.number().positive().optional().nullable(),
  roundTripRateMultiplier: z.number().min(1).max(5).optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
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

  const where = search ? { name: { contains: search, mode: 'insensitive' } } : {}

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      include: { _count: { select: { routePrices: true } } },
      orderBy: { displayOrder: 'asc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.vehicle.count({ where }),
  ])

  return Response.json({ vehicles, total, pages: Math.ceil(total / perPage) })
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = VehicleSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const { name, slug } = parsed.data
  const existing = await prisma.vehicle.findFirst({
    where: { OR: [{ name }, { slug }] },
  })
  if (existing) {
    return Response.json({ error: 'A vehicle with this name or slug already exists' }, { status: 409 })
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description,
      imageUrl: parsed.data.imageUrl || null,
      passengerCapacity: parsed.data.passengerCapacity,
      luggageCapacity: parsed.data.luggageCapacity,
      perKmRate: parsed.data.perKmRate,
      minimumFare: parsed.data.minimumFare,
      minimumBillableKm: parsed.data.minimumBillableKm ?? null,
      roundTripRateMultiplier: parsed.data.roundTripRateMultiplier ?? 1.9,
      isActive: parsed.data.isActive ?? true,
      displayOrder: parsed.data.displayOrder ?? 0,
    },
  })

  return Response.json({ vehicle }, { status: 201 })
}

