import Link from 'next/link'
import VehicleCard from '@/components/vehicles/VehicleCard'
import { ArrowRight } from 'lucide-react'

interface Vehicle {
  id: number
  name: string
  slug: string
  description: string
  imageUrl: string | null
  passengerCapacity: number
  luggageCapacity: number
  perKmRate: unknown
  minimumFare: unknown
}

interface Props {
  vehicles: Vehicle[]
}

export default function VehiclesSection({ vehicles }: Props) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-[#08A9EE] uppercase tracking-widest">
            OUR FLEET
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#10264A] mt-2 mb-3">
            Our Fleet
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm">
            Choose from our range of well-maintained AC vehicles. All cars are regularly
            serviced for your safety and comfort.
          </p>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Vehicle details will appear here once configured.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {vehicles.slice(0, 3).map((v) => (
              <VehicleCard
                key={v.id}
                name={v.name}
                description={v.description}
                imageUrl={v.imageUrl}
                passengerCapacity={v.passengerCapacity}
                luggageCapacity={v.luggageCapacity}
                perKmRate={v.perKmRate as string}
                minimumFare={v.minimumFare as string}
              />
            ))}
          </div>
        )}

        <div className="text-center">
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-2 bg-[#10264A] hover:bg-[#1a3a6b] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            View All Vehicles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
