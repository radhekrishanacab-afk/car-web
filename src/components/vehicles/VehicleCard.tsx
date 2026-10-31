import Image from 'next/image'
import { Users, Briefcase, IndianRupee } from 'lucide-react'

interface VehicleCardProps {
  name: string
  description: string
  imageUrl?: string | null
  passengerCapacity: number
  luggageCapacity: number
  perKmRate: string | number
  minimumFare: string | number
}

export default function VehicleCard({
  name, description, imageUrl, passengerCapacity,
  luggageCapacity, perKmRate, minimumFare,
}: VehicleCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden border border-gray-100 group">
      <div className="relative h-48 bg-gradient-to-br from-[#0a1628] to-[#1a3a6b] overflow-hidden">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill
            className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="flex items-center justify-center h-full text-white/50">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.08 3.11H5.77L6.85 7zM19 17H5v-5h14v5zm-7-4c-.83 0-1.5.67-1.5 1.5S11.17 16 12 16s1.5-.67 1.5-1.5S12.83 13 12 13z" />
              </svg>
              <span className="text-sm">{name}</span>
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-[#f59e0b] text-[#0a1628] text-xs font-bold px-2 py-1 rounded">
          Available
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-[#0a1628] mb-1">{name}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4 text-[#1a3a6b]" />
            {passengerCapacity} Passengers
          </span>
          <span className="flex items-center gap-1">
            <Briefcase className="w-4 h-4 text-[#1a3a6b]" />
            {luggageCapacity} Bags
          </span>
        </div>
        <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-0.5 text-[#0a1628] font-semibold">
              <IndianRupee className="w-4 h-4" />
              <span>{Number(perKmRate).toFixed(0)}/km</span>
            </div>
            <div className="text-xs text-gray-500">Min. ₹{Number(minimumFare).toFixed(0)}</div>
          </div>
          <span className="text-xs text-[#f59e0b] font-medium bg-amber-50 px-2 py-1 rounded">
            Enquire for fare
          </span>
        </div>
      </div>
    </div>
  )
}
