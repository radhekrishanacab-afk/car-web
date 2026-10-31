import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CityForm from '@/components/admin/CityForm'

export const metadata: Metadata = { title: 'Add City' }

export default function NewCityPage() {
  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/cities" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Cities
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add City</h1>
      </div>
      <CityForm />
    </div>
  )
}
