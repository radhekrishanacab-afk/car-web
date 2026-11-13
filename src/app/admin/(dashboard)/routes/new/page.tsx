import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import RouteForm from '@/components/admin/RouteForm'

export const metadata: Metadata = { title: 'Add Route' }

export default async function NewRoutePage() {
  const [cities, vehicles] = await Promise.all([
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }).catch(() => []),
    prisma.vehicle.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true, perKmRate: true, minimumFare: true, minimumBillableKm: true, roundTripRateMultiplier: true },
    }).catch(() => []),
  ])

  const serialisedVehicles = vehicles.map(v => ({
    id: v.id,
    name: v.name,
    perKmRate: Number(v.perKmRate),
    minimumFare: Number(v.minimumFare),
    minimumBillableKm: v.minimumBillableKm ? Number(v.minimumBillableKm) : 100,
    roundTripRateMultiplier: Number(v.roundTripRateMultiplier),
  }))

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/routes" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Routes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Route</h1>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-700">
        <strong>Auto System:</strong> Select two cities → Distance auto-fetches → Fares auto-calculate for all vehicles → Click Save.
      </div>
      <RouteForm cities={cities} vehicles={serialisedVehicles} />
    </div>
  )
}
