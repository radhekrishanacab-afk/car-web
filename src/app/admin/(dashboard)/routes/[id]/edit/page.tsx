import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import RouteForm from '@/components/admin/RouteForm'

export const metadata: Metadata = { title: 'Edit Route' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditRoutePage({ params }: PageProps) {
  const { id } = await params
  const [route, cities] = await Promise.all([
    prisma.route.findUnique({
      where: { id: parseInt(id) },
    }).catch(() => null),
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    }),
  ])
  if (!route) notFound()

  // Serialize Decimal fields for client component
  const serialisedRoute = {
    ...route,
    distanceKm: route.distanceKm != null ? Number(route.distanceKm) : null,
    estimatedHours: route.estimatedHours != null ? Number(route.estimatedHours) : null,
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/routes" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Routes
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Route</h1>
      </div>
      <RouteForm route={serialisedRoute} cities={cities} />
    </div>
  )
}
