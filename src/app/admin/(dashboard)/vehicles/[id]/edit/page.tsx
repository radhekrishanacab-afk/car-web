import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import VehicleForm from '@/components/admin/VehicleForm'

export const metadata: Metadata = { title: 'Edit Vehicle' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditVehiclePage({ params }: PageProps) {
  const { id } = await params
  const vehicle = await prisma.vehicle.findUnique({ where: { id: parseInt(id) } }).catch(() => null)
  if (!vehicle) notFound()

  // Serialize Decimal fields for client component
  const serialisedVehicle = {
    ...vehicle,
    perKmRate: Number(vehicle.perKmRate),
    minimumFare: Number(vehicle.minimumFare),
    minimumBillableKm: vehicle.minimumBillableKm != null ? Number(vehicle.minimumBillableKm) : null,
    roundTripRateMultiplier: Number(vehicle.roundTripRateMultiplier),
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/vehicles" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Vehicles
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Vehicle — {vehicle.name}</h1>
      </div>
      <VehicleForm vehicle={serialisedVehicle} />
    </div>
  )
}
