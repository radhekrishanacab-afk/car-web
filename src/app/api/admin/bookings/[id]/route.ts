import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const UpdateBookingSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
  message: z.string().max(500).optional().nullable(),
})

async function requireAdmin() {
  const session = await getSession()
  if (!session) return null
  return session
}

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/admin/bookings/[id]'>
) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const booking = await prisma.booking.findUnique({
    where: { id: parseInt(id) },
    include: {
      vehicle: true,
      route: {
        include: {
          originCity: true,
          destinationCity: true,
        },
      },
    },
  })
  if (!booking) return Response.json({ error: 'Booking not found' }, { status: 404 })
  return Response.json({ booking })
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/admin/bookings/[id]'>
) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const bookingId = parseInt(id)

  const body = await request.json()
  const parsed = UpdateBookingSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      ...(parsed.data.status !== undefined && { status: parsed.data.status }),
      ...(parsed.data.message !== undefined && { message: parsed.data.message }),
    },
  })

  return Response.json({ booking })
}
