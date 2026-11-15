import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import TouristPlaceForm from '@/components/admin/TouristPlaceForm'

export const metadata: Metadata = { title: 'New Tourist Place' }

export default function NewTouristPlacePage() {
  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/tourist-places" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Tourist Places
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Tourist Place</h1>
      </div>
      <TouristPlaceForm />
    </div>
  )
}
