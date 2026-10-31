import { prisma } from './prisma'

function toNum(d: unknown): number | null {
  if (d == null) return null
  return Number(String(d))
}

export interface FareEstimate {
  vehicleId: number
  vehicleName: string
  oneWayFare: number | null
  roundTripFare: number | null
  source: 'route-override' | 'calculated' | 'unknown'
  distanceKm: number | null
}

export async function getFareEstimates(routeId: number): Promise<FareEstimate[]> {
  const route = await prisma.route.findUnique({
    where: { id: routeId },
    include: { priceOverrides: true },
  })
  if (!route) return []

  const vehicles = await prisma.vehicle.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' },
  })

  const distanceKm = toNum(route.distanceKm)

  return vehicles.map((vehicle) => {
    const override = route.priceOverrides.find((p) => p.vehicleId === vehicle.id)

    if (override) {
      return {
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        oneWayFare: toNum(override.oneWayFare),
        roundTripFare: toNum(override.roundTrip),
        source: 'route-override' as const,
        distanceKm,
      }
    }

    if (distanceKm !== null) {
      const perKmRate = toNum(vehicle.perKmRate)!
      const minimumFare = toNum(vehicle.minimumFare)!
      const minimumBillableKm = toNum(vehicle.minimumBillableKm)
      const billableKm =
        minimumBillableKm ? Math.max(distanceKm, minimumBillableKm) : distanceKm
      const calculated = Math.max(billableKm * perKmRate, minimumFare)
      const multiplier = toNum(vehicle.roundTripRateMultiplier) ?? 1.9
      return {
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        oneWayFare: Math.ceil(calculated),
        roundTripFare: Math.ceil(calculated * multiplier),
        source: 'calculated' as const,
        distanceKm,
      }
    }

    return {
      vehicleId: vehicle.id,
      vehicleName: vehicle.name,
      oneWayFare: null,
      roundTripFare: null,
      source: 'unknown' as const,
      distanceKm: null,
    }
  })
}
