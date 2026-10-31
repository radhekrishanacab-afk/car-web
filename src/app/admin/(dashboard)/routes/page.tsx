import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { Plus } from 'lucide-react'
import RouteActions from '@/components/admin/RouteActions'

export const metadata: Metadata = { title: 'Routes' }

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>
}

export default async function RoutesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const search = params.search ?? ''
  const perPage = 20

  const where = search
    ? {
        OR: [
          { originCity: { name: { contains: search, mode: 'insensitive' } } },
          { destinationCity: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }
    : {}

  const [routes, total] = await Promise.all([
    prisma.route.findMany({
      where,
      include: {
        originCity: { select: { name: true } },
        destinationCity: { select: { name: true } },
        _count: { select: { priceOverrides: true, bookings: true } },
      },
      orderBy: [{ originCity: { name: 'asc' } }, { destinationCity: { name: 'asc' } }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.route.count({ where }),
  ])

  const pages = Math.ceil(total / perPage)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Routes</h1>
          <p className="text-gray-500 text-sm mt-1">{total} routes total</p>
        </div>
        <Link
          href="/admin/routes/new"
          className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#1a3a6b] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Route
        </Link>
      </div>

      <form className="flex gap-3 mb-6">
        <input
          type="text" name="search" defaultValue={search}
          placeholder="Search city name…"
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628] w-64"
        />
        <button type="submit" className="px-4 py-2 bg-[#0a1628] text-white rounded-lg text-sm font-medium hover:bg-[#1a3a6b] transition-colors">
          Search
        </button>
        {search && (
          <Link href="/admin/routes" className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
            Clear
          </Link>
        )}
      </form>

      {routes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
          {search ? `No routes matching "${search}"` : 'No routes yet. Add your first route.'}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">Route</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Slug</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Distance</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Prices</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Bookings</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {routes.map((route) => (
                  <tr key={route.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {route.originCity.name} → {route.destinationCity.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{route.slug}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {route.distanceKm ? `${Number(route.distanceKm)} km` : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{route._count.priceOverrides}</td>
                    <td className="px-4 py-3 text-gray-600">{route._count.bookings}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${route.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {route.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/routes/${route.id}/edit`} className="text-xs text-[#1a3a6b] hover:text-[#f59e0b] font-medium">Edit</Link>
                        <Link href={`/admin/pricing?routeId=${route.id}`} className="text-xs text-purple-600 hover:text-purple-800 font-medium">Pricing</Link>
                        <RouteActions routeId={route.id} routeName={`${route.originCity.name} → ${route.destinationCity.name}`} bookingCount={route._count.bookings} />
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
            {page > 1 && <Link href={`/admin/routes?page=${page - 1}&search=${search}`} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">← Prev</Link>}
            {page < pages && <Link href={`/admin/routes?page=${page + 1}&search=${search}`} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Next →</Link>}
          </div>
        </div>
      )}
    </div>
  )
}
