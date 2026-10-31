import Link from 'next/link'
import { ArrowRight, Navigation, RefreshCw, Plane } from 'lucide-react'

const services = [
  {
    icon: Navigation,
    title: 'One Way Taxi',
    description:
      'Travel from one city to another without paying for the return trip. Ideal for single-direction intercity travel across India.',
    href: '/services#one-way',
    color: 'bg-[#EAF6FF] text-[#08A9EE]',
    border: 'hover:border-[#08A9EE]/40',
  },
  {
    icon: RefreshCw,
    title: 'Round Trip Cab',
    description:
      'Plan a comfortable round trip with the driver waiting at your destination. Best for outstation visits and day tours.',
    href: '/services#round-trip',
    color: 'bg-amber-50 text-amber-600',
    border: 'hover:border-amber-300/60',
  },
  {
    icon: Plane,
    title: 'Airport Transfer',
    description:
      'Reliable pickup and drop to/from airports across India. Flight tracking and punctual service guaranteed.',
    href: '/services#airport',
    color: 'bg-green-50 text-green-600',
    border: 'hover:border-green-300/60',
  },
]

export default function ServicesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-[#08A9EE] uppercase tracking-widest">
            WHAT WE OFFER
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#10264A] mt-2 mb-3">
            Our Taxi Services
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm">
            Choose the service that fits your travel needs. All vehicles are air-conditioned
            with professional licensed drivers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((s) => (
            <div
              key={s.title}
              className={`bg-white rounded-2xl border border-gray-100 ${s.border} p-6 hover:shadow-xl transition-all group`}
            >
              <div className={`inline-flex p-3.5 rounded-2xl ${s.color} mb-5`}>
                <s.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#10264A] mb-2">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-5">{s.description}</p>
              <Link
                href={s.href}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#08A9EE] hover:gap-2.5 transition-all"
              >
                Learn More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
