import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Upload } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import BulkImportClient from '@/components/admin/BulkImportClient'

export const metadata: Metadata = { title: 'Bulk Import Routes' }

export default async function BulkImportPage() {
  const [vehicles, cities] = await Promise.all([
    prisma.vehicle.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.city.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/admin/routes" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Routes
        </Link>
        <div className="flex items-center gap-2">
          <div className="bg-[#0a1628] rounded-lg p-1.5">
            <Upload className="w-4 h-4 text-[#f59e0b]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Import Routes</h1>
        </div>
      </div>

      <BulkImportClient vehicles={vehicles} cities={cities} />
    </div>
  )
}
