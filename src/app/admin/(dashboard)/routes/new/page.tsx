  import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import RouteForm from '@/components/admin/RouteForm'

export const metadata: Metadata = { title: 'Add Route' }

export default async function NewRoutePage() {
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  })

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/routes" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Routes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add Route</h1>
      </div>
      <RouteForm cities={cities} />
    </div>
  )
}
