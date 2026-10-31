import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const UpdateCitySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  isPopular: z.boolean().optional(),
  popularOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
})

async function requireAdmin() {
  const session = await getSession()
  if (!session) return null
  return session
}

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<'/api/admin/cities/[id]'>
) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const city = await prisma.city.findUnique({
    where: { id: parseInt(id) },
    include: { _count: { select: { routesFrom: true, routesTo: true } } },
  })
  if (!city) return Response.json({ error: 'City not found' }, { status: 404 })
  return Response.json({ city })
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<'/api/admin/cities/[id]'>
) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const cityId = parseInt(id)

  const body = await request.json()
  const parsed = UpdateCitySchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  if (parsed.data.slug || parsed.data.name) {
    const conflict = await prisma.city.findFirst({
      where: {
        AND: [
          { id: { not: cityId } },
          { OR: [
            parsed.data.name ? { name: parsed.data.name } : {},
            parsed.data.slug ? { slug: parsed.data.slug } : {},
          ]},
        ],
      },
    })
    if (conflict) {
      return Response.json({ error: 'Another city with this name or slug exists' }, { status: 409 })
    }
  }

  const city = await prisma.city.update({
    where: { id: cityId },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.slug !== undefined && { slug: parsed.data.slug }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      ...(parsed.data.imageUrl !== undefined && { imageUrl: parsed.data.imageUrl || null }),
      ...(parsed.data.isPopular !== undefined && { isPopular: parsed.data.isPopular }),
      ...(parsed.data.popularOrder !== undefined && { popularOrder: parsed.data.popularOrder }),
      ...(parsed.data.isActive !== undefined && { isActive: parsed.data.isActive }),
    },
  })

  return Response.json({ city })
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/admin/cities/[id]'>
) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const cityId = parseInt(id)

  const routeCount = await prisma.route.count({
    where: { OR: [{ originCityId: cityId }, { destinationCityId: cityId }] },
  })

  if (routeCount > 0) {
    return Response.json(
      { error: `Cannot delete city — it has ${routeCount} associated routes. Deactivate or delete the routes first.` },
      { status: 409 }
    )
  }

  await prisma.city.delete({ where: { id: cityId } })
  return Response.json({ success: true })
}
