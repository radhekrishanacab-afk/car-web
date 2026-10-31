import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import CityForm from '@/components/admin/CityForm'

export const metadata: Metadata = { title: 'Edit City' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditCityPage({ params }: PageProps) {
  const { id } = await params
  const city = await prisma.city.findUnique({ where: { id: parseInt(id) } }).catch(() => null)
  if (!city) notFound()

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/cities" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Cities
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit City — {city.name}</h1>
      </div>
      <CityForm city={city} />
    </div>
  )
}
