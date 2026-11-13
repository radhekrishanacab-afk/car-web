/**
 * POST /api/admin/vehicles/recalculate
 * Recalculates ALL route prices based on current vehicle per-km rates.
 * Call this after editing a vehicle's perKmRate or minimumFare.
 */
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(_req: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Load all active vehicles with their rates
  const vehicles = await prisma.vehicle.findMany({
    where: { isActive: true },
    select: { id: true, name: true, perKmRate: true, minimumFare: true, minimumBillableKm: true, roundTripRateMultiplier: true },
  })

  // Load all routes with distances
  const routes = await prisma.route.findMany({
    select: { id: true, distanceKm: true },
    where: { isActive: true },
  })

  function calcFare(distKm: number, perKm: number, minFare: number, minBillable = 100) {
    const billable = Math.max(distKm, minBillable)
    return Math.ceil(Math.max(billable * perKm, minFare) / 100) * 100
  }

  let updated = 0
  const BATCH = 500

  // Build all price upserts
  const priceData: { routeId: number; vehicleId: number; oneWayFare: number; roundTrip: number; isActive: boolean }[] = []

  for (const route of routes) {
    const distKm = route.distanceKm ? Number(route.distanceKm) : 100
    for (const v of vehicles) {
      const perKm      = Number(v.perKmRate)
      const minFare    = Number(v.minimumFare)
      const minBillable = v.minimumBillableKm ? Number(v.minimumBillableKm) : 100
      const multiplier  = Number(v.roundTripRateMultiplier)
      const oneWay = calcFare(distKm, perKm, minFare, minBillable)
      const roundTrip = Math.ceil(oneWay * multiplier / 100) * 100
      priceData.push({ routeId: route.id, vehicleId: v.id, oneWayFare: oneWay, roundTrip, isActive: true })
    }
  }

  // Upsert in batches
  for (let i = 0; i < priceData.length; i += BATCH) {
    const batch = priceData.slice(i, i + BATCH)
    await prisma.$transaction(
      batch.map(p =>
        prisma.routePrice.upsert({
          where: { routeId_vehicleId: { routeId: p.routeId, vehicleId: p.vehicleId } },
          update: { oneWayFare: p.oneWayFare, roundTrip: p.roundTrip, isActive: true },
          create: p,
        })
      )
    )
    updated += batch.length
  }

  return Response.json({
    success: true,
    message: `Recalculated ${updated} route prices for ${vehicles.length} vehicles across ${routes.length} routes.`,
    vehicles: vehicles.map(v => ({ name: v.name, perKmRate: Number(v.perKmRate) })),
  })
}
