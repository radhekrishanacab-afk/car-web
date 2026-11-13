/**
 * POST /api/admin/routes/update-fares
 * Updates distance and prices for a specific route (by origin+dest city names).
 * Creates the route if it doesn't exist.
 */
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { z } from 'zod'

const Schema = z.object({
  originCity:  z.string().min(1),
  destCity:    z.string().min(1),
  distanceKm:  z.number().positive(),
  prices: z.array(z.object({
    vehicleId:   z.number(),
    oneWayFare:  z.number(),
    roundTrip:   z.number().optional(),
  })),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Invalid input' }, { status: 400 })

  const { originCity, destCity, distanceKm, prices } = parsed.data

  const [oCity, dCity] = await Promise.all([
    prisma.city.findFirst({ where: { name: { equals: originCity, mode: 'insensitive' } } }),
    prisma.city.findFirst({ where: { name: { equals: destCity,   mode: 'insensitive' } } }),
  ])

  if (!oCity) return Response.json({ error: `City "${originCity}" not found` }, { status: 404 })
  if (!dCity) return Response.json({ error: `City "${destCity}" not found` },   { status: 404 })

  const estimatedHours = Math.round((distanceKm / 50) * 10) / 10

  // Upsert route
  let route = await prisma.route.findFirst({
    where: { originCityId: oCity.id, destinationCityId: dCity.id },
  })

  if (route) {
    route = await prisma.route.update({
      where: { id: route.id },
      data: { distanceKm, estimatedHours },
    })
  } else {
    const slug = `${oCity.slug}-to-${dCity.slug}-taxi`
    route = await prisma.route.create({
      data: {
        originCityId: oCity.id, destinationCityId: dCity.id,
        slug, distanceKm, estimatedHours, isActive: true,
      },
    })
  }

  // Upsert prices
  await prisma.$transaction(
    prices.map(p =>
      prisma.routePrice.upsert({
        where: { routeId_vehicleId: { routeId: route!.id, vehicleId: p.vehicleId } },
        update: { oneWayFare: p.oneWayFare, roundTrip: p.roundTrip ?? null, isActive: true },
        create: { routeId: route!.id, vehicleId: p.vehicleId, oneWayFare: p.oneWayFare, roundTrip: p.roundTrip ?? null, isActive: true },
      })
    )
  )

  return Response.json({ success: true, routeId: route.id, distanceKm, pricesUpdated: prices.length })
}
