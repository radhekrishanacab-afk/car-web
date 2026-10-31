'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeftRight, Search, MapPin, Navigation, ArrowRight, IndianRupee } from 'lucide-react'

interface City {
  id: number
  name: string
  slug: string
}

interface VehiclePrice {
  vehicle: { id: number; name: string; displayOrder: number }
  oneWayFare: number
}

interface RouteResult {
  id: number
  slug: string
  distanceKm: number | null
  originCity: { id: number; name: string; slug: string }
  destinationCity: { id: number; name: string; slug: string }
  priceOverrides: VehiclePrice[]
}

interface Props {
  initialRoutes: RouteResult[]
  allCities: City[]
}

export default function RouteFareSection({ initialRoutes, allCities }: Props) {
  const [originId, setOriginId] = useState('')
  const [destId, setDestId] = useState('')
  const [routes, setRoutes] = useState<RouteResult[]>(initialRoutes)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // Collect all unique vehicle names from all routes
  const vehicleNames = Array.from(
    new Set(
      initialRoutes.flatMap((r) => r.priceOverrides.map((p) => p.vehicle.name))
    )
  ).slice(0, 3) // Show at most 3 vehicle columns

  const [displayVehicles, setDisplayVehicles] = useState<string[]>(vehicleNames)

  const handleSearch = useCallback(async () => {
    setLoading(true)
    setSearched(true)
    try {
      const params = new URLSearchParams()
      if (originId) params.set('originId', originId)
      if (destId) params.set('destinationId', destId)

      const res = await fetch(`/api/public/routes/search?${params}`)
      const data = await res.json()
      const found: RouteResult[] = data.routes ?? []
      setRoutes(found)

      // Update vehicle columns from results
      const names = Array.from(
        new Set(found.flatMap((r) => r.priceOverrides.map((p) => p.vehicle.name)))
      ).slice(0, 3)
      setDisplayVehicles(names.length > 0 ? names : vehicleNames)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [originId, destId, vehicleNames])

  const handleSwap = () => {
    const tmp = originId
    setOriginId(destId)
    setDestId(tmp)
  }

  const getFare = (route: RouteResult, vehicleName: string) => {
    const match = route.priceOverrides.find((p) => p.vehicle.name === vehicleName)
    if (!match) return null
    return Number(match.oneWayFare)
  }

  const buildBookingUrl = (route: RouteResult) => {
    const msg = encodeURIComponent(
      `🚖 *TAXI ENQUIRY*\n📍 From: ${route.originCity.name}\n🏁 To: ${route.destinationCity.name}\n\nPlease share fare details.`
    )
    return `https://wa.me/919723097832?text=${msg}`
  }

  return (
    <section className="py-16 lg:py-24 bg-[#EAF6FF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="section-overline">EXPLORE BEST ROUTES</span>
          <h2 className="text-[#10264A] mt-2 mb-4">
            Popular Routes &amp;{' '}
            <span className="text-[#08A9EE]">Travel Fares</span>
          </h2>
          <p
            style={{
              fontSize: '0.9375rem',
              color: '#6B7280',
              maxWidth: '36rem',
              margin: '0 auto',
              textAlign: 'center',
              lineHeight: '1.75',
            }}
          >
            Find the best routes across India and beyond. Transparent pricing with
            well-maintained vehicles and comfortable services for every destination.
          </p>
        </div>

        {/* Search controls */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
            {/* From */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                From City
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#08A9EE]" />
                <select
                  value={originId}
                  onChange={(e) => setOriginId(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#08A9EE] bg-white appearance-none"
                >
                  <option value="">Select pickup city</option>
                  {allCities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap */}
            <button
              onClick={handleSwap}
              type="button"
              className="self-center sm:mb-0 w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full border-2 border-[#08A9EE] text-[#08A9EE] hover:bg-[#08A9EE] hover:text-white transition-all"
              aria-label="Swap cities"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            {/* To */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                To City
              </label>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#08A9EE]" />
                <select
                  value={destId}
                  onChange={(e) => setDestId(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#08A9EE] bg-white appearance-none"
                >
                  <option value="">Select destination city</option>
                  {allCities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 bg-[#08A9EE] hover:bg-[#0798d4] disabled:opacity-60 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-md hover:scale-105"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Searching…' : 'Search Routes'}
            </button>
          </div>
        </div>

        {/* Results table */}
        {routes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <p className="text-gray-500 text-sm">
              {searched
                ? 'No routes found for the selected cities. Please try a different combination.'
                : 'Select cities above to search for routes and fares.'}
            </p>
            {!searched && (
              <p className="text-xs text-gray-400 mt-2">
                Or <Link href="/routes" className="text-[#08A9EE] underline">browse all routes</Link>.
              </p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="route-table-scroll">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-[#10264A] text-white">
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide">Route</th>
                    <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wide">Distance</th>
                    {displayVehicles.map((v) => (
                      <th key={v} className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wide">
                        {v.split(' ')[0]}
                      </th>
                    ))}
                    <th className="text-center px-4 py-3 font-semibold text-xs uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route, i) => (
                    <tr key={route.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#EAF6FF]/40'}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-[#08A9EE]/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-3 h-3 text-[#08A9EE]" />
                          </div>
                          <div>
                            <span className="font-semibold text-[#10264A]">
                              {route.originCity.name}
                            </span>
                            <span className="text-gray-400 mx-1">→</span>
                            <span className="font-semibold text-[#10264A]">
                              {route.destinationCity.name}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-500">
                        {route.distanceKm ? `${Number(route.distanceKm)} km` : '—'}
                      </td>
                      {displayVehicles.map((v) => {
                        const fare = getFare(route, v)
                        return (
                          <td key={v} className="px-4 py-3 text-center">
                            {fare !== null ? (
                              <span className="font-semibold text-[#10264A] flex items-center justify-center gap-0.5">
                                <IndianRupee className="w-3 h-3" />
                                {fare.toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">Contact for Price</span>
                            )}
                          </td>
                        )
                      })}
                      <td className="px-4 py-3 text-center">
                        <a
                          href={buildBookingUrl(route)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-[#08A9EE] hover:bg-[#0798d4] text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Book Now
                          <ArrowRight className="w-3 h-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Fares are indicative. Final fare confirmed by our team. Toll & night charges extra.
              </p>
              <Link
                href="/routes"
                className="text-xs font-semibold text-[#08A9EE] hover:underline flex items-center gap-1"
              >
                View all routes <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
