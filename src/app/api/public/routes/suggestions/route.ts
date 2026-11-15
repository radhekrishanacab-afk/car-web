import { NextRequest } from 'next/server'
import { findCityMatches, findRouteCityPair } from '@/lib/city-matcher'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim().slice(0, 100) ?? ''
  if (query.length < 2) return Response.json({ suggestions: [] })

  try {
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    })

    const pair = findRouteCityPair(query, cities)
    const suggestions: Array<{
      type: 'city' | 'route'
      label: string
      detail: string
      href: string
      fare?: number | null
    }> = []

    if (pair) {
      const route = await prisma.route.findFirst({
        where: {
          isActive: true,
          originCityId: pair.origin.city.id,
          destinationCityId: pair.destination.city.id,
        },
        select: {
          slug: true,
          distanceKm: true,
          priceOverrides: {
            where: { isActive: true },
            orderBy: { oneWayFare: 'asc' },
            take: 1,
            select: { oneWayFare: true },
          },
        },
      })

      if (route) {
        const fare = route.priceOverrides[0]?.oneWayFare ?? null
        const distance = route.distanceKm ? `${Math.round(route.distanceKm)} km` : null
        suggestions.push({
          type: 'route',
          label: `${pair.origin.city.name} to ${pair.destination.city.name}`,
          detail: [
            distance,
            fare != null ? `fares from ₹${Math.round(fare).toLocaleString('en-IN')}` : 'View route details',
          ].filter(Boolean).join(' · '),
          href: `/routes/${route.slug}`,
          fare: fare == null ? null : Number(fare),
        })
      }

      for (const match of [pair.origin, pair.destination]) {
        suggestions.push({
          type: 'city',
          label: match.city.name,
          detail: match === pair.origin ? 'Pickup city' : 'Destination city',
          href: `/routes/city/${match.city.slug}`,
        })
      }
    } else {
      suggestions.push(...findCityMatches(query, cities).map(({ city }) => ({
        type: 'city' as const,
        label: city.name,
        detail: 'Browse routes from this city',
        href: `/routes/city/${city.slug}`,
      })))
    }

    return Response.json({ suggestions: suggestions.slice(0, 6) })
  } catch {
    return Response.json({ suggestions: [] }, { status: 503 })
  }
}
