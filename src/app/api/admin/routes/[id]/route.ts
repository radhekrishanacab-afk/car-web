import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const UpdateRouteSchema = z.object({
  originCityId: z.number().int().positive().optional(),
  destinationCityId: z.number().int().positive().optional(),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/).optional(),
  distanceKm: z.number().positive().optional().nullable(),
  estimatedHours: z.number().positive().optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  highlights: z.string().max(1000).optional().nullable(),
  seoTitle: z.string().max(100).optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
  seoKeywords: z.string().max(500).optional().nullable(),
  isActive: z.boolean().optional(),
})

async function requireAdmin() {
  const session = await getSession()
  if (!session) return null
  return session
}

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/admin/routes/[id]'>
) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const route = await prisma.route.findUnique({
    where: { id: parseInt(id) },
    include: {
      originCity: true,
      destinationCity: true,
      priceOverrides: { include: { vehicle: { select: { id: true, name: true } } } },
    },
  })
  if (!route) return Response.json({ error: 'Route not found' }, { status: 404 })
  return Response.json({ route })
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/admin/routes/[id]'>
) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const routeId = parseInt(id)

  const body = await request.json()
  const parsed = UpdateRouteSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const route = await prisma.route.update({
    where: { id: routeId },
    data: {
      ...(parsed.data.slug !== undefined && { slug: parsed.data.slug }),
      ...(parsed.data.distanceKm !== undefined && { distanceKm: parsed.data.distanceKm }),
      ...(parsed.data.estimatedHours !== undefined && { estimatedHours: parsed.data.estimatedHours }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      ...(parsed.data.highlights !== undefined && { highlights: parsed.data.highlights }),
      ...(parsed.data.seoTitle !== undefined && { seoTitle: parsed.data.seoTitle }),
      ...(parsed.data.seoDescription !== undefined && { seoDescription: parsed.data.seoDescription }),
      ...(parsed.data.seoKeywords !== undefined && { seoKeywords: parsed.data.seoKeywords }),
      ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
    },
    include: { originCity: true, destinationCity: true },
  })

  return Response.json({ route })
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/admin/routes/[id]'>
) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const routeId = parseInt(id)

  const bookingCount = await prisma.booking.count({ where: { routeId } })
  if (bookingCount > 0) {
    return Response.json(
      { error: `Cannot delete route — it has ${bookingCount} bookings. Deactivate it instead.` },
      { status: 409 }
    )
  }

  // RoutePrice records cascade-delete via onDelete: Cascade in schema
  await prisma.route.delete({ where: { id: routeId } })
  return Response.json({ success: true })
}
