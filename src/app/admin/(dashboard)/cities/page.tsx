import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import CityActions from '@/components/admin/CityActions'
import { Plus } from 'lucide-react'

export const metadata: Metadata = { title: 'Cities' }

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>
}

export default async function CitiesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const search = params.search ?? ''
  const perPage = 24

  const where = search ? { name: { contains: search } } : {}

  const [cities, total] = await Promise.all([
    prisma.city.findMany({
      where,
      include: { _count: { select: { routesFrom: true } } },
      orderBy: { name: 'asc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.city.count({ where }),
  ])

  const pages = Math.ceil(total / perPage)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cities</h1>
          <p className="text-gray-500 text-sm mt-1">{total} cities total</p>
        </div>
        <Link
          href="/admin/cities/new"
          className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#1a3a6b] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> Add City
        </Link>
      </div>

      {/* Search */}
      <form className="flex gap-3 mb-6">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search cities…"
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628] w-64"
        />
        <button type="submit" className="px-4 py-2 bg-[#0a1628] text-white rounded-lg text-sm font-medium hover:bg-[#1a3a6b] transition-colors">
          Search
        </button>
        {search && (
          <Link href="/admin/cities" className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
            Clear
          </Link>
        )}
      </form>

      {cities.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
          {search ? `No cities matching "${search}"` : 'No cities yet. Add your first city.'}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">City</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Slug</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Routes</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Popular</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cities.map((city) => (
                  <tr key={city.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{city.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{city.slug}</td>
                    <td className="px-4 py-3 text-gray-600">{city._count.routesFrom}</td>
                    <td className="px-4 py-3">
                      {city.isPopular && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">Popular</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${city.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {city.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/cities/${city.id}/edit`} className="text-xs text-[#1a3a6b] hover:text-[#f59e0b] font-medium">Edit</Link>
                        <CityActions cityId={city.id} cityName={city.name} routeCount={city._count.routesFrom} />
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
            {page > 1 && (
              <Link href={`/admin/cities?page=${page - 1}&search=${search}`} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">← Prev</Link>
            )}
            {page < pages && (
              <Link href={`/admin/cities?page=${page + 1}&search=${search}`} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Next →</Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
