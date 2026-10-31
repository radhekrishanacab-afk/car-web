import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const originId = searchParams.get('originId')
  const destinationId = searchParams.get('destinationId')

  if (!originId && !destinationId) {
    // Return all active routes with prices for the table
    const routes = await prisma.route.findMany({
      where: { isActive: true },
      include: {
        originCity: { select: { id: true, name: true, slug: true } },
        destinationCity: { select: { id: true, name: true, slug: true } },
        priceOverrides: {
          where: { isActive: true },
          include: { vehicle: { select: { id: true, name: true, displayOrder: true } } },
          orderBy: { vehicle: { displayOrder: 'asc' } },
        },
      },
      take: 20,
      orderBy: [{ originCity: { name: 'asc' } }, { destinationCity: { name: 'asc' } }],
    })
    return Response.json({ routes })
  }

  const where: Record<string, unknown> = { isActive: true }
  if (originId) where.originCityId = parseInt(originId)
  if (destinationId) where.destinationCityId = parseInt(destinationId)

  const routes = await prisma.route.findMany({
    where,
    include: {
      originCity: { select: { id: true, name: true, slug: true } },
      destinationCity: { select: { id: true, name: true, slug: true } },
      priceOverrides: {
        where: { isActive: true },
        include: { vehicle: { select: { id: true, name: true, displayOrder: true } } },
        orderBy: { vehicle: { displayOrder: 'asc' } },
      },
    },
    orderBy: { destinationCity: { name: 'asc' } },
  })

  return Response.json({ routes })
}
