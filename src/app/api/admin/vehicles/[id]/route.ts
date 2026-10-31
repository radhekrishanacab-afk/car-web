import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const UpdateVehicleSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  passengerCapacity: z.number().int().min(1).max(20).optional(),
  luggageCapacity: z.number().int().min(0).max(20).optional(),
  perKmRate: z.number().positive().optional(),
  minimumFare: z.number().positive().optional(),
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

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/admin/vehicles/[id]'>
) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: parseInt(id) },
    include: { _count: { select: { routePrices: true, bookings: true } } },
  })
  if (!vehicle) return Response.json({ error: 'Vehicle not found' }, { status: 404 })
  return Response.json({ vehicle })
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/admin/vehicles/[id]'>
) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const vehicleId = parseInt(id)

  const body = await request.json()
  const parsed = UpdateVehicleSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const data = parsed.data
  const vehicle = await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
      ...(data.passengerCapacity !== undefined && { passengerCapacity: data.passengerCapacity }),
      ...(data.luggageCapacity !== undefined && { luggageCapacity: data.luggageCapacity }),
      ...(data.perKmRate !== undefined && { perKmRate: data.perKmRate }),
      ...(data.minimumFare !== undefined && { minimumFare: data.minimumFare }),
      ...(data.minimumBillableKm !== undefined && { minimumBillableKm: data.minimumBillableKm }),
      ...(data.roundTripRateMultiplier !== undefined && { roundTripRateMultiplier: data.roundTripRateMultiplier }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
    },
  })

  return Response.json({ vehicle })
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/admin/vehicles/[id]'>
) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const vehicleId = parseInt(id)

  const bookingCount = await prisma.booking.count({ where: { vehicleId } })
  if (bookingCount > 0) {
    return Response.json(
      { error: `Cannot delete vehicle — it has ${bookingCount} bookings. Deactivate it instead.` },
      { status: 409 }
    )
  }

  await prisma.vehicle.delete({ where: { id: vehicleId } })
  return Response.json({ success: true })
}
