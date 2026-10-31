import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'

interface City {
  id: number
  name: string
  slug: string
  routeCount: number
}

interface Props {
  cities: City[]
}

const fallbackCities = [
  { id: 1, name: 'Ahmedabad', slug: 'ahmedabad', routeCount: 0 },
  { id: 2, name: 'Surat', slug: 'surat', routeCount: 0 },
  { id: 3, name: 'Vadodara', slug: 'vadodara', routeCount: 0 },
  { id: 4, name: 'Rajkot', slug: 'rajkot', routeCount: 0 },
  { id: 5, name: 'Gandhinagar', slug: 'gandhinagar', routeCount: 0 },
  { id: 6, name: 'Bhavnagar', slug: 'bhavnagar', routeCount: 0 },
  { id: 7, name: 'Jamnagar', slug: 'jamnagar', routeCount: 0 },
  { id: 8, name: 'Anand', slug: 'anand', routeCount: 0 },
]

export default function PopularCitiesSection({ cities }: Props) {
  const list = cities.length > 0 ? cities : fallbackCities

  return (
    <section className="py-16 section-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold text-[#08A9EE] uppercase tracking-widest">
            EXPLORE INDIA
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold mt-2 mb-3">Popular Cities</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm">
            We serve all major cities and towns across India reliably.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
          {list.map((city) => (
            <Link
              key={city.id}
              href={`/routes?city=${city.slug}`}
              className="group flex flex-col items-center gap-2 bg-white/5 hover:bg-[#08A9EE]/20 border border-white/10 hover:border-[#08A9EE]/50 rounded-xl p-4 text-center transition-all"
            >
              <MapPin className="w-5 h-5 text-[#08A9EE]" />
              <div className="font-semibold text-sm">{city.name}</div>
              {city.routeCount > 0 && (
                <div className="text-xs text-gray-400">{city.routeCount} routes</div>
              )}
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/routes"
            className="inline-flex items-center gap-2 bg-[#08A9EE] hover:bg-[#0798d4] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Explore All Routes <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
