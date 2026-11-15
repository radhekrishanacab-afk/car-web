import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import TouristPlaceForm from '@/components/admin/TouristPlaceForm'

export const metadata: Metadata = { title: 'Edit Tourist Place' }

interface PageProps { params: Promise<{ id: string }> }

export default async function EditTouristPlacePage({ params }: PageProps) {
  const { id } = await params
  const place = await prisma.touristPlace.findUnique({ where: { id: parseInt(id) } }).catch(() => null)
  if (!place) notFound()

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/tourist-places" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Tourist Places
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Place — {place.name}</h1>
      </div>
      <TouristPlaceForm place={place} />
    </div>
  )
}
