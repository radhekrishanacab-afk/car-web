import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: 'Bookings' }

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string; status?: string }>
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

const tripTypeLabel: Record<string, string> = {
  ONE_WAY: 'One Way',
  ROUND_TRIP: 'Round Trip',
  AIRPORT: 'Airport',
}

export default async function BookingsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page ?? '1'))
  const search = params.search ?? ''
  const status = params.status ?? ''
  const perPage = 20

  const where: Record<string, unknown> = {}
  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerPhone: { contains: search, mode: 'insensitive' } },
      { reference: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (status) where.status = status

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: {
        vehicle: { select: { name: true } },
        route: {
          include: {
            originCity: { select: { name: true } },
            destinationCity: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.booking.count({ where }),
  ])

  const pages = Math.ceil(total / perPage)

  const statuses = ['', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
          <p className="text-gray-500 text-sm mt-1">{total} total booking{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filters */}
      <form className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search name, phone or ref…"
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628] w-64"
        />
        <select
          name="status"
          defaultValue={status}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628]"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s || 'All Statuses'}</option>
          ))}
        </select>
        <button type="submit" className="px-4 py-2 bg-[#0a1628] text-white rounded-lg text-sm font-medium hover:bg-[#1a3a6b] transition-colors">
          Filter
        </button>
        {(search || status) && (
          <Link href="/admin/bookings" className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">
            Clear
          </Link>
        )}
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {bookings.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No bookings found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">Ref</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Customer</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Route</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Trip</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Vehicle</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{b.reference}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{b.customerName}</div>
                      <div className="text-gray-400 text-xs">{b.customerPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {b.route
                        ? `${b.route.originCity.name} → ${b.route.destinationCity.name}`
                        : `${b.pickupLocation.substring(0, 20)} → ${b.destination.substring(0, 20)}`}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{tripTypeLabel[b.tripType] ?? b.tripType}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(b.pickupDate).toLocaleDateString('en-IN')}
                      <div className="text-gray-400">{b.pickupTime}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{b.vehicle?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/bookings/${b.id}`}
                        className="text-xs text-[#1a3a6b] hover:text-[#f59e0b] font-medium"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Page {page} of {pages} ({total} results)
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/bookings?page=${page - 1}&search=${search}&status=${status}`}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                ← Prev
              </Link>
            )}
            {page < pages && (
              <Link
                href={`/admin/bookings?page=${page + 1}&search=${search}&status=${status}`}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
