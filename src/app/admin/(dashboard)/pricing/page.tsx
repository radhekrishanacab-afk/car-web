import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import PricingManager from '@/components/admin/PricingManager'

export const metadata: Metadata = { title: 'Route Pricing' }

interface PageProps {
  searchParams: Promise<{ routeId?: string; page?: string }>
}

export default async function PricingPage({ searchParams }: PageProps) {
  const params = await searchParams
  const selectedRouteId = params.routeId ? parseInt(params.routeId) : null
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const perPage = 30

  const [routes, vehicles] = await Promise.all([
    prisma.route.findMany({
      where: { isActive: true },
      include: {
        originCity: { select: { name: true } },
        destinationCity: { select: { name: true } },
      },
      orderBy: [{ originCity: { name: 'asc' } }, { destinationCity: { name: 'asc' } }],
    }),
    prisma.vehicle.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true, perKmRate: true, minimumFare: true },
    }),
  ])

  const where = selectedRouteId ? { routeId: selectedRouteId } : {}

  const [prices, total] = await Promise.all([
    prisma.routePrice.findMany({
      where,
      include: {
        route: {
          include: {
            originCity: { select: { name: true } },
            destinationCity: { select: { name: true } },
          },
        },
        vehicle: { select: { id: true, name: true } },
      },
      orderBy: [{ route: { originCity: { name: 'asc' } } }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.routePrice.count({ where }),
  ])

  const pages = Math.ceil(total / perPage)

  const serialisedRoutes = routes.map((r) => ({
    id: r.id,
    label: `${r.originCity.name} → ${r.destinationCity.name}`,
    distanceKm: r.distanceKm != null ? Number(r.distanceKm) : null,
  }))
  const serialisedVehicles = vehicles.map((v) => ({
    id: v.id,
    name: v.name,
    perKmRate: Number(v.perKmRate),
    minimumFare: Number(v.minimumFare),
  }))
  const serialisedPrices = prices.map((p) => ({
    id: p.id,
    routeId: p.routeId,
    routeLabel: `${p.route.originCity.name} → ${p.route.destinationCity.name}`,
    vehicleId: p.vehicleId,
    vehicleName: p.vehicle.name,
    oneWayFare: Number(p.oneWayFare),
    roundTrip: p.roundTrip != null ? Number(p.roundTrip) : null,
    driverAllowance: p.driverAllowance != null ? Number(p.driverAllowance) : null,
    tollCharges: p.tollCharges != null ? Number(p.tollCharges) : null,
    parkingCharges: p.parkingCharges != null ? Number(p.parkingCharges) : null,
    nightCharges: p.nightCharges != null ? Number(p.nightCharges) : null,
    otherCharges: p.otherCharges != null ? Number(p.otherCharges) : null,
    isActive: p.isActive,
  }))

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Route Pricing</h1>
          <p className="text-gray-500 text-sm mt-1">
            Configure fares per route and vehicle. {total} price entries.
          </p>
        </div>
      </div>

      <PricingManager
        routes={serialisedRoutes}
        vehicles={serialisedVehicles}
        prices={serialisedPrices}
        selectedRouteId={selectedRouteId}
        page={page}
        pages={pages}
        total={total}
      />
    </div>
  )
}
