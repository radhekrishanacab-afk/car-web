'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  Users, Phone, ArrowRight,
  CheckCircle2, Sparkles
} from 'lucide-react'

const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? '+91 97230 97832'

export interface AboutVehicle {
  id: string
  name: string
  seats: string
  passengers: number
  transmission: 'Manual' | 'Auto'
  type: string
  bestFor: string
  desc: string
  img: string
}

export const POPULAR_3_VEHICLES: AboutVehicle[] = [
  {
    id: 'swift-dzire',
    name: 'Swift Dzire',
    seats: '4+1 Seaters',
    passengers: 4,
    transmission: 'Manual',
    type: 'Compact Sedan',
    bestFor: 'City rides, airport drops & economical outstation trips',
    desc: 'India’s most trusted compact sedan. Outstanding mileage, smooth ride, and great comfort for city rides & outstation journeys.',
    img: '/images/vehicles/fleet-1-swift-desire.png',
  },
  {
    id: 'hyundai-aura',
    name: 'Hyundai Aura',
    seats: '4+1 Seaters',
    passengers: 4,
    transmission: 'Manual',
    type: 'Executive Sedan',
    bestFor: 'Executive travel, plush legroom & deep boot luggage',
    desc: 'Modern and stylish sedan with generous boot space and plush legroom. Ideal for families and business travelers.',
    img: '/images/vehicles/fleet-2-hyundai-aura.png',
  },
  {
    id: 'maruti-suzuki-ertiga',
    name: 'Maruti Suzuki Ertiga',
    seats: '6+1 Seaters',
    passengers: 6,
    transmission: 'Manual',
    type: '7-Seater Family MUV',
    bestFor: 'Family vacations, weekend tours & airport luggage runs',
    desc: 'The best-value 7-seater MPV with flexible seating, ample boot space, and smooth ride for family vacations and airport trips.',
    img: '/images/vehicles/fleet-3-maruti-suzuki-ertiga.png',
  },
]

export default function AboutFleetSection() {
  const rawPhone = PHONE.replace(/[^0-9+]/g, '')

  return (
    <section className="py-16 lg:py-24 bg-slate-50 relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header — Centered */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-[#EAF6FF] border border-[#bae6fd] px-3.5 py-1.5 rounded-full mb-3">
            <Sparkles size={13} className="text-[#08A9EE]" />
            <span className="text-xs font-extrabold text-[#0369a1] tracking-wider uppercase">
              Our Featured Fleet
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#10264A] leading-tight mb-3 tracking-tight">
            Popular Vehicles for <span className="text-[#08A9EE]">Your Journey</span>
          </h2>

          <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto leading-relaxed">
            Every car in our fleet is verified, sanitized before departure, and driven by professional chauffeurs. Explore our top choices below or view our full 9-vehicle fleet.
          </p>
        </div>

        {/* 3 Featured Vehicles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {POPULAR_3_VEHICLES.map((v) => (
            <article
              key={v.id}
              className="w-full max-w-md mx-auto sm:max-w-none rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#08A9EE]/60 transition-all duration-200 flex flex-col group bg-white"
            >
              {/* Image Frame */}
              <div className="relative h-48 sm:h-52 bg-gradient-to-b from-white to-slate-100 border-b border-slate-200 overflow-hidden">
                {/* Seating badge */}
                <div className="absolute top-3 right-3 z-10 bg-[#EAF6FF] text-[#0369a1] border border-[#bae6fd] text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Users size={12} className="text-[#08A9EE]" />
                  <span>{v.seats}</span>
                </div>

                <Image
                  src={v.img}
                  alt={v.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-contain p-3.5 transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-extrabold text-[#08A9EE] uppercase tracking-wider">
                    {v.type}
                  </span>
                  <span className="text-xs text-gray-500 font-bold bg-slate-100 px-2 py-0.5 rounded">
                    {v.transmission}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-extrabold text-[#10264A] mb-2 leading-snug">
                  {v.name}
                </h3>

                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-4 flex-1">
                  {v.desc}
                </p>

                {/* Recommended Scenario Chip */}
                <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 mb-4">
                  <span className="text-[10px] font-extrabold text-[#0369a1] block uppercase tracking-wider mb-0.5">
                    RECOMMENDED FOR:
                  </span>
                  <span className="text-xs text-gray-700 font-medium leading-snug">
                    {v.bestFor}
                  </span>
                </div>

                {/* Dual Buttons — Book redirects to /vehicles */}
                <div className="grid grid-cols-2 gap-2.5 mt-auto">
                  <a
                    href={`tel:${rawPhone}`}
                    className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-[#10264A] font-bold text-xs sm:text-sm py-2.5 px-3 rounded-lg border border-slate-300 transition-colors"
                  >
                    <Phone size={13} className="text-[#08A9EE]" />
                    <span>Call</span>
                  </a>

                  <Link
                    href="/vehicles"
                    className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#08A9EE] to-[#0284c7] hover:brightness-105 text-white font-extrabold text-xs sm:text-sm py-2.5 px-3 rounded-lg shadow-md shadow-[#08A9EE]/30 transition-all cursor-pointer"
                  >
                    <span>Book Now</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Vehicles Button (Redirects to /vehicles) */}
        <div className="text-center mt-10">
          <Link
            href="/vehicles"
            className="btn btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-sm sm:text-base font-bold shadow-lg shadow-[#08A9EE]/30 hover:scale-105 transition-all"
          >
            <span>View All 9 Fleet Vehicles</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Bottom Fleet Standards Banner */}
        <div className="mt-12 sm:mt-16 bg-[#10264A] rounded-2xl p-6 sm:p-8 text-white grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { title: '100% Verified Chauffeurs', desc: 'Commercial license & police background checks' },
            { title: 'Zero Hidden Charges', desc: 'Full fare clarity: toll, driver & fuel upfront' },
            { title: 'Sanitized Before Departure', desc: 'Clean, spotless interior & fresh cabin' },
            { title: '24/7 Roadside Assistance', desc: 'Dedicated trip support anytime, anywhere' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#08A9EE]/15 flex items-center justify-center shrink-0">
                <CheckCircle2 size={18} className="text-[#08A9EE]" />
              </div>
              <div>
                <h5 className="text-sm font-extrabold text-white mb-0.5">
                  {item.title}
                </h5>
                <p className="text-xs text-gray-300 leading-snug">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
