import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import BookingStatusForm from '@/components/admin/BookingStatusForm'
import { ArrowLeft, MapPin, Calendar, Car, User, Phone, IndianRupee } from 'lucide-react'

export const metadata: Metadata = { title: 'Booking Detail' }

interface PageProps {
  params: Promise<{ id: string }>
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  COMPLETED: 'bg-green-100 text-green-700 border-green-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
}

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params
  const booking = await prisma.booking.findUnique({
    where: { id: parseInt(id) },
    include: {
      vehicle: true,
      route: { include: { originCity: true, destinationCity: true } },
    },
  }).catch(() => null)

  if (!booking) notFound()

  let fareSnapshot: Record<string, unknown> | null = null
  if (booking.fareSnapshot) {
    try { fareSnapshot = JSON.parse(booking.fareSnapshot) } catch { /* ignore */ }
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/admin/bookings" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Booking {booking.reference}</h1>
          <p className="text-gray-500 text-sm">Created {new Date(booking.createdAt).toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-[#f59e0b]" /> Customer Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 text-xs mb-0.5">Name</div>
                <div className="font-medium text-gray-900">{booking.customerName}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-0.5">Phone</div>
                <a href={`tel:${booking.customerPhone}`} className="font-medium text-[#1a3a6b] hover:text-[#f59e0b]">
                  {booking.customerPhone}
                </a>
              </div>
              {booking.customerEmail && (
                <div>
                  <div className="text-gray-500 text-xs mb-0.5">Email</div>
                  <div className="font-medium text-gray-900">{booking.customerEmail}</div>
                </div>
              )}
              <div>
                <div className="text-gray-500 text-xs mb-0.5">Passengers</div>
                <div className="font-medium text-gray-900">{booking.passengerCount}</div>
              </div>
            </div>
          </div>

          {/* Trip */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#f59e0b]" /> Trip Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 text-xs mb-0.5">Trip Type</div>
                <div className="font-medium">{booking.tripType.replace('_', ' ')}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-0.5">Pickup Date &amp; Time</div>
                <div className="font-medium">
                  {new Date(booking.pickupDate).toLocaleDateString('en-IN')} at {booking.pickupTime}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-0.5">Pickup Location</div>
                <div className="font-medium">{booking.pickupLocation}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-0.5">Destination</div>
                <div className="font-medium">{booking.destination}</div>
              </div>
              {booking.returnDate && (
                <div>
                  <div className="text-gray-500 text-xs mb-0.5">Return Date</div>
                  <div className="font-medium">{new Date(booking.returnDate).toLocaleDateString('en-IN')}</div>
                </div>
              )}
              {booking.route && (
                <div>
                  <div className="text-gray-500 text-xs mb-0.5">Route</div>
                  <div className="font-medium">{booking.route.originCity.name} → {booking.route.destinationCity.name}</div>
                </div>
              )}
            </div>
          </div>

          {/* Vehicle & Fare */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Car className="w-4 h-4 text-[#f59e0b]" /> Vehicle &amp; Fare
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 text-xs mb-0.5">Vehicle</div>
                <div className="font-medium">{booking.vehicle?.name ?? '—'}</div>
              </div>
              {booking.estimatedFare && (
                <div>
                  <div className="text-gray-500 text-xs mb-0.5">Estimated Fare</div>
                  <div className="font-medium flex items-center gap-0.5">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {Number(booking.estimatedFare).toLocaleString('en-IN')}
                  </div>
                </div>
              )}
            </div>
            {fareSnapshot && (
              <div className="mt-4 bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-2 font-medium">Fare Snapshot (locked at booking time)</div>
                <pre className="text-xs text-gray-700 overflow-x-auto">{JSON.stringify(fareSnapshot, null, 2)}</pre>
              </div>
            )}
          </div>

          {booking.message && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="font-semibold text-gray-900 mb-2">Customer Message</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{booking.message}</p>
            </div>
          )}
        </div>

        {/* Sidebar: Status */}
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Booking Status</h2>
            <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border mb-4 ${statusColors[booking.status] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {booking.status}
            </div>
            <BookingStatusForm bookingId={booking.id} currentStatus={booking.status} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#f59e0b]" /> Timeline
            </h2>
            <div className="space-y-2 text-gray-600">
              <div>
                <div className="text-xs text-gray-400">Created</div>
                <div>{new Date(booking.createdAt).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Last Updated</div>
                <div>{new Date(booking.updatedAt).toLocaleString('en-IN')}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Quick Contact</h2>
            <div className="space-y-2">
              <a
                href={`tel:${booking.customerPhone}`}
                className="flex items-center gap-2 px-3 py-2 bg-[#0a1628] text-white rounded-lg text-sm font-medium hover:bg-[#1a3a6b] transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call {booking.customerName}
              </a>
              <a
                href={`https://wa.me/91${booking.customerPhone}?text=${encodeURIComponent(`Hello ${booking.customerName}, regarding your taxi booking ${booking.reference} from Radhe Krishna Cab.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
