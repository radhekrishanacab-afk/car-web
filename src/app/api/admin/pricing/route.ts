import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const PricingSchema = z.object({
  routeId: z.number().int().positive(),
  vehicleId: z.number().int().positive(),
  oneWayFare: z.number().min(0),
  roundTrip: z.number().min(0).optional().nullable(),
  driverAllowance: z.number().min(0).optional().nullable(),
  tollCharges: z.number().min(0).optional().nullable(),
  parkingCharges: z.number().min(0).optional().nullable(),
  nightCharges: z.number().min(0).optional().nullable(),
  otherCharges: z.number().min(0).optional().nullable(),
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
  const routeId = searchParams.get('routeId')
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const perPage = 30

  const where = routeId ? { routeId: parseInt(routeId) } : {}

  const [prices, total] = await Promise.all([
    prisma.routePrice.findMany({
      where,
      include: {
        route: {
          include: {
            originCity: { select: { name: true } },
            destinationCity: { select: { name: true } },
          },
        },
        vehicle: { select: { id: true, name: true } },
      },
      orderBy: [{ route: { originCity: { name: 'asc' } } }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.routePrice.count({ where }),
  ])

  return Response.json({ prices, total, pages: Math.ceil(total / perPage) })
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = PricingSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const { routeId, vehicleId, oneWayFare, roundTrip, driverAllowance, tollCharges, parkingCharges, nightCharges, otherCharges, isActive } = parsed.data

  const price = await prisma.routePrice.upsert({
    where: { routeId_vehicleId: { routeId, vehicleId } },
    create: {
      routeId,
      vehicleId,
      oneWayFare,
      roundTrip: roundTrip ?? null,
      driverAllowance: driverAllowance ?? null,
      tollCharges: tollCharges ?? null,
      parkingCharges: parkingCharges ?? null,
      nightCharges: nightCharges ?? null,
      otherCharges: otherCharges ?? null,
      isActive: isActive ?? true,
    },
    update: {
      oneWayFare,
      roundTrip: roundTrip ?? null,
      driverAllowance: driverAllowance ?? null,
      tollCharges: tollCharges ?? null,
      parkingCharges: parkingCharges ?? null,
      nightCharges: nightCharges ?? null,
      otherCharges: otherCharges ?? null,
      isActive: isActive ?? true,
    },
    include: {
      route: { include: { originCity: true, destinationCity: true } },
      vehicle: true,
    },
  })

  return Response.json({ price }, { status: 201 })
}

