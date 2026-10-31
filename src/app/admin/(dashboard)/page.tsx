import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import {
  CalendarCheck, MapPin, Navigation, Car, MessageSquare,
  IndianRupee, TrendingUp, Clock,
} from 'lucide-react'

export const metadata: Metadata = { title: 'Dashboard' }

async function getStats() {
  const [bookings, cities, routes, vehicles, enquiries, pendingBookings] = await Promise.all([
    prisma.booking.count(),
    prisma.city.count({ where: { isActive: true } }),
    prisma.route.count({ where: { isActive: true } }),
    prisma.vehicle.count({ where: { isActive: true } }),
    prisma.contactEnquiry.count({ where: { isRead: false } }),
    prisma.booking.count({ where: { status: 'PENDING' } }),
  ])
  return { bookings, cities, routes, vehicles, enquiries, pendingBookings }
}

async function getRecentBookings() {
  return prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      vehicle: { select: { name: true } },
      route: {
        include: {
          originCity: { select: { name: true } },
          destinationCity: { select: { name: true } },
        },
      },
    },
  })
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}

export default async function AdminDashboard() {
  const [stats, recentBookings] = await Promise.all([
    getStats().catch(() => ({
      bookings: 0, cities: 0, routes: 0, vehicles: 0, enquiries: 0, pendingBookings: 0,
    })),
    getRecentBookings().catch(() => []),
  ])

  const cards = [
    { label: 'Total Bookings', value: stats.bookings, icon: CalendarCheck, href: '/admin/bookings', color: 'text-blue-600 bg-blue-50' },
    { label: 'Pending Bookings', value: stats.pendingBookings, icon: Clock, href: '/admin/bookings?status=PENDING', color: 'text-yellow-600 bg-yellow-50' },
    { label: 'Unread Enquiries', value: stats.enquiries, icon: MessageSquare, href: '/admin/enquiries', color: 'text-purple-600 bg-purple-50' },
    { label: 'Active Cities', value: stats.cities, icon: MapPin, href: '/admin/cities', color: 'text-green-600 bg-green-50' },
    { label: 'Active Routes', value: stats.routes, icon: Navigation, href: '/admin/routes', color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Active Vehicles', value: stats.vehicles, icon: Car, href: '/admin/vehicles', color: 'text-orange-600 bg-orange-50' },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your taxi service.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-all group"
          >
            <div className={`inline-flex p-2 rounded-lg ${card.color} mb-3`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-gray-900 group-hover:text-[#0a1628]">
              {card.value}
            </div>
            <div className="text-xs text-gray-500 mt-0.5 leading-tight">{card.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#f59e0b]" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/admin/cities/new', label: '+ Add City' },
              { href: '/admin/routes/new', label: '+ Add Route' },
              { href: '/admin/vehicles/new', label: '+ Add Vehicle' },
              { href: '/admin/pricing', label: 'Manage Pricing' },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="px-3 py-2 text-sm font-medium text-center border border-gray-200 rounded-lg hover:bg-[#0a1628] hover:text-white hover:border-[#0a1628] transition-all"
              >
                {a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Revenue hint */}
        <div className="bg-[#0a1628] rounded-xl p-5 text-white">
          <h2 className="font-semibold mb-2 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-[#f59e0b]" />
            Pricing Notice
          </h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Set route-specific prices under <strong className="text-white">Route Pricing</strong>.
            Vehicle base rates are configured under <strong className="text-white">Vehicles</strong>.
            Public fare pages update automatically when you save changes.
          </p>
          <Link
            href="/admin/pricing"
            className="mt-3 inline-block text-xs text-[#f59e0b] hover:text-[#fbbf24] font-medium"
          >
            Go to Pricing →
          </Link>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-xs text-[#1a3a6b] hover:text-[#f59e0b] font-medium">
            View all →
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="px-5 py-10 text-center text-gray-400 text-sm">
            No bookings yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-3 font-medium text-gray-500">Ref</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Customer</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Route</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Date</th>
                  <th className="px-5 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((b) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <Link href={`/admin/bookings/${b.id}`} className="font-mono text-xs text-[#1a3a6b] hover:text-[#f59e0b]">
                        {b.reference}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-gray-900">{b.customerName}</div>
                      <div className="text-gray-400 text-xs">{b.customerPhone}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs">
                      {b.route
                        ? `${b.route.originCity.name} → ${b.route.destinationCity.name}`
                        : `${b.pickupLocation.substring(0, 15)} → ${b.destination.substring(0, 15)}`}
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {new Date(b.pickupDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[b.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
