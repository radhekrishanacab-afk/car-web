import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import VehicleForm from '@/components/admin/VehicleForm'

export const metadata: Metadata = { title: 'Add Vehicle' }

export default function NewVehiclePage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/vehicles" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Vehicles
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Vehicle</h1>
      </div>
      <VehicleForm />
    </div>
  )
}
