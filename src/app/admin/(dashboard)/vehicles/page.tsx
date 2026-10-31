import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Plus, Users, Briefcase } from 'lucide-react'
import VehicleAdminActions from '@/components/admin/VehicleAdminActions'

export const metadata: Metadata = { title: 'Vehicles' }

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>
}

export default async function VehiclesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const search = params.search ?? ''
  const perPage = 20

  const where = search ? { name: { contains: search } } : {}

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      include: { _count: { select: { routePrices: true, bookings: true } } },
      orderBy: { displayOrder: 'asc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.vehicle.count({ where }),
  ])

  const pages = Math.ceil(total / perPage)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-gray-500 text-sm mt-1">{total} vehicles total</p>
        </div>
        <Link href="/admin/vehicles/new"
          className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#1a3a6b] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Vehicle
        </Link>
      </div>

      <form className="flex gap-3 mb-6">
        <input type="text" name="search" defaultValue={search} placeholder="Search vehicles…"
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628] w-64" />
        <button type="submit" className="px-4 py-2 bg-[#0a1628] text-white rounded-lg text-sm font-medium hover:bg-[#1a3a6b] transition-colors">Search</button>
        {search && <Link href="/admin/vehicles" className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Clear</Link>}
      </form>

      {vehicles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
          {search ? `No vehicles matching "${search}"` : 'No vehicles yet. Add your first vehicle.'}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">Vehicle</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Capacity</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Rate</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Min. Fare</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Prices</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{v.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{v.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{v.passengerCapacity}</span>
                        <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{v.luggageCapacity}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">₹{Number(v.perKmRate).toFixed(0)}/km</td>
                    <td className="px-4 py-3 text-gray-600">₹{Number(v.minimumFare).toFixed(0)}</td>
                    <td className="px-4 py-3 text-gray-600">{v._count.routePrices} routes</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {v.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/vehicles/${v.id}/edit`} className="text-xs text-[#1a3a6b] hover:text-[#f59e0b] font-medium">Edit</Link>
                        <VehicleAdminActions vehicleId={v.id} vehicleName={v.name} bookingCount={v._count.bookings} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Page {page} of {pages}</p>
          <div className="flex gap-2">
            {page > 1 && <Link href={`/admin/vehicles?page=${page - 1}&search=${search}`} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">← Prev</Link>}
            {page < pages && <Link href={`/admin/vehicles?page=${page + 1}&search=${search}`} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Next →</Link>}
          </div>
        </div>
      )}
    </div>
  )
}
