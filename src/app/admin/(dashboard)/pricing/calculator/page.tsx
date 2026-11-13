import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import FareCalculatorClient from '@/components/admin/FareCalculatorClient'

export const metadata: Metadata = { title: 'Fare Calculator' }

export default async function FareCalculatorPage() {
  const [cities, vehicles] = await Promise.all([
    prisma.city.findMany({ where: { isActive: true }, select: { name: true }, orderBy: { name: 'asc' } }).catch(() => []),
    prisma.vehicle.findMany({ where: { isActive: true }, select: { id: true, name: true, perKmRate: true, minimumFare: true, minimumBillableKm: true, roundTripRateMultiplier: true }, orderBy: { displayOrder: 'asc' } }).catch(() => []),
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
    <div className="p-6 max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/pricing" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Route Pricing
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Fare Calculator</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Enter two cities to calculate the fare automatically based on distance × per-km rate. 
        You can manually override the distance if needed.
      </p>
      <FareCalculatorClient cities={cities.map(c => c.name)} vehicles={serialisedVehicles} />
    </div>
  )
}
