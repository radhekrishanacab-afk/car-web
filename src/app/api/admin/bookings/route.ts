import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const CreateBookingSchema = z.object({
  tripType: z.enum(['ONE_WAY', 'ROUND_TRIP', 'AIRPORT']).optional(),
  customerName: z.string().min(2).max(100),
  customerPhone: z.string().regex(/^[6-9]\d{9}$/),
  customerEmail: z.string().email().optional().nullable().or(z.literal('')),
  pickupLocation: z.string().min(3).max(500),
  destination: z.string().min(3).max(500),
  pickupDate: z.string().min(1),
  pickupTime: z.string().min(1),
  returnDate: z.string().optional().nullable(),
  passengerCount: z.number().int().min(1).max(20).optional(),
  vehicleId: z.number().int().positive().optional().nullable(),
  routeId: z.number().int().positive().optional().nullable(),
  message: z.string().max(500).optional().nullable(),
  estimatedFare: z.number().min(0).optional().nullable(),
  fareSnapshot: z.string().optional().nullable(),
})

async function requireAdmin() {
  const session = await getSession()
  if (!session) return null
  return session
}

function generateRef(): string {
  const ts = Date.now().toString(36).toUpperCase()
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `RKC-${ts}-${rand}`
}

export async function GET(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = request.nextUrl
  const search = searchParams.get('search') ?? ''
  const status = searchParams.get('status') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const perPage = 20

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerPhone: { contains: search, mode: 'insensitive' } },
      { reference: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (status) where.status = status

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        vehicle: { select: { id: true, name: true } },
        route: {
          include: {
            originCity: { select: { name: true } },
            destinationCity: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.booking.count({ where }),
  ])

  return Response.json({ bookings, total, pages: Math.ceil(total / perPage) })
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const parsed = CreateBookingSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const d = parsed.data
  const booking = await prisma.booking.create({
    data: {
      reference: generateRef(),
      tripType: d.tripType ?? 'ONE_WAY',
      customerName: d.customerName,
      customerPhone: d.customerPhone,
      customerEmail: d.customerEmail || null,
      pickupLocation: d.pickupLocation,
      destination: d.destination,
      pickupDate: new Date(d.pickupDate),
      pickupTime: d.pickupTime,
      returnDate: d.returnDate ? new Date(d.returnDate) : null,
      passengerCount: d.passengerCount ?? 1,
      vehicleId: d.vehicleId ?? null,
      routeId: d.routeId ?? null,
      message: d.message ?? null,
      estimatedFare: d.estimatedFare ?? null,
      fareSnapshot: d.fareSnapshot ?? null,
    },
  })

  return Response.json({ booking }, { status: 201 })
}

