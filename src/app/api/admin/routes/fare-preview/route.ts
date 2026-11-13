/**
 * GET /api/admin/routes/fare-preview?originCity=Ahmedabad&destCity=Surat
 * Returns km distance and calculated fares for all vehicles.
 */
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

function calcFare(distKm: number, perKm: number, minFare: number, minBillable = 100) {
  const billable = Math.max(distKm, minBillable)
  return Math.ceil(Math.max(billable * perKm, minFare) / 100) * 100
}

export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const originName = searchParams.get('originCity') ?? ''
  const destName   = searchParams.get('destCity') ?? ''

  if (!originName || !destName)
    return Response.json({ error: 'originCity and destCity required' }, { status: 400 })

  const [originCity, destCity, vehicles] = await Promise.all([
    prisma.city.findFirst({ where: { name: { equals: originName, mode: 'insensitive' } } }),
    prisma.city.findFirst({ where: { name: { equals: destName,   mode: 'insensitive' } } }),
    prisma.vehicle.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } }),
  ])

  if (!originCity) return Response.json({ error: `City "${originName}" not found` }, { status: 404 })
  if (!destCity)   return Response.json({ error: `City "${destName}" not found` },   { status: 404 })

  // Look up existing route
  const route = await prisma.route.findFirst({
    where: { originCityId: originCity.id, destinationCityId: destCity.id },
    include: {
      priceOverrides: { where: { isActive: true }, include: { vehicle: true } },
    },
  })

  const distKm = route?.distanceKm ? Number(route.distanceKm) : null

  const fares = vehicles.map(v => {
    const perKm      = Number(v.perKmRate)
    const minFare    = Number(v.minimumFare)
    const minBillable = v.minimumBillableKm ? Number(v.minimumBillableKm) : 100
    const multiplier  = Number(v.roundTripRateMultiplier)

    const existing = route?.priceOverrides.find(p => p.vehicleId === v.id)
    const calculatedFare = distKm ? calcFare(distKm, perKm, minFare, minBillable) : null
    const roundTrip = calculatedFare ? Math.ceil(calculatedFare * multiplier / 100) * 100 : null

    return {
      vehicleId:    v.id,
      vehicleName:  v.name,
      perKmRate:    perKm,
      minimumFare:  minFare,
      oneWayFare:   existing ? Number(existing.oneWayFare) : calculatedFare,
      roundTrip:    existing?.roundTrip ? Number(existing.roundTrip) : roundTrip,
      formula:      distKm ? `max(${distKm}, ${minBillable}) × ₹${perKm} = ₹${calculatedFare ?? '?'}` : 'Distance unknown',
    }
  })

  return Response.json({
    originCity: originCity.name,
    destCity:   destCity.name,
    distanceKm: distKm,
    routeId:    route?.id ?? null,
    routeExists: !!route,
    fares,
  })
}
