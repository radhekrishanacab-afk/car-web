'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Users, Settings2, Phone, MessageCircle,
  ArrowRight, ChevronLeft, ChevronRight, Luggage, CheckCircle2, Sparkles
} from 'lucide-react'

const WA    = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? '+91 97230 97832'

export interface VehicleData {
  id: string
  number: string
  name: string
  seats: string
  passengers: number
  transmission: 'Manual' | 'Auto'
  type: string
  category: 'sedan' | 'suv' | 'traveller'
  categoryLabel: string
  luggage: string
  tagline: string
  desc: string
  image: string
  features: string[]
}

export const ALL_9_VEHICLES: VehicleData[] = [
  {
    id: 'swift-dzire',
    number: '01',
    name: 'Swift Dzire',
    seats: '4+1 Seaters',
    passengers: 4,
    transmission: 'Manual',
    type: 'Compact Sedan',
    category: 'sedan',
    categoryLabel: 'Sedan (4+1)',
    luggage: '2 Large + 1 Small Bag',
    tagline: 'Economical, Smooth & Comfortable Compact Sedan',
    desc: 'India’s most trusted compact sedan. Outstanding mileage, smooth ride, and great comfort for city rides & outstation journeys.',
    image: '/images/vehicles/fleet-1-swift-desire.png',
    features: ['Best fuel economy for intercity trips', 'Generous boot luggage space', 'Ideal for individuals & small families'],
  },
  {
    id: 'hyundai-aura',
    number: '02',
    name: 'Hyundai Aura',
    seats: '4+1 Seaters',
    passengers: 4,
    transmission: 'Manual',
    type: 'Executive Sedan',
    category: 'sedan',
    categoryLabel: 'Sedan (4+1)',
    luggage: '2 Large + 2 Small Bags',
    tagline: 'Executive Styling, Plush Legroom & Premium Comfort',
    desc: 'Modern and stylish sedan with generous boot space and plush legroom. Ideal for families and business travelers.',
    image: '/images/vehicles/fleet-2-hyundai-aura.png',
    features: ['Plush dual-tone spacious cabin', 'Deep boot capacity for airport luggage', 'Ultra quiet highway cruising'],
  },
  {
    id: 'maruti-suzuki-ertiga',
    number: '03',
    name: 'Maruti Suzuki Ertiga',
    seats: '6+1 Seaters',
    passengers: 6,
    transmission: 'Manual',
    type: '7-Seater Family MUV',
    category: 'suv',
    categoryLabel: 'MUV / SUV (6+1)',
    luggage: '3 Large Bags + Luggage Carrier',
    tagline: 'India’s Favorite 7-Seater Family MUV',
    desc: 'The best-value 7-seater MPV with flexible seating, ample boot space, and smooth ride for family vacations and airport trips.',
    image: '/images/vehicles/fleet-3-maruti-suzuki-ertiga.png',
    features: ['Flexible 3-row family seating', 'Smooth ride on state highways', 'Ample boot space for holiday bags'],
  },
  {
    id: 'kia-carens',
    number: '04',
    name: 'Kia Carens',
    seats: '6+1 Seaters',
    passengers: 6,
    transmission: 'Auto',
    type: 'Premium Highway MUV',
    category: 'suv',
    categoryLabel: 'MUV / SUV (6+1)',
    luggage: '3 Large Bags',
    tagline: 'Next-Gen Recreational Vehicle with Premium Comfort',
    desc: 'Next-gen recreational vehicle with comfortable seats and advanced safety features for long highway journeys.',
    image: '/images/vehicles/fleet-4-kia-carens.png',
    features: ['Executive captain comfort seating', 'Advanced highway safety suspension', 'Spacious headroom and legroom in all rows'],
  },
  {
    id: 'toyota-innova-cresta',
    number: '05',
    name: 'Toyota Innova Cresta',
    seats: '6+1 Seaters',
    passengers: 6,
    transmission: 'Auto',
    type: 'Luxury Highway SUV',
    category: 'suv',
    categoryLabel: 'MUV / SUV (6+1)',
    luggage: '4 Large Bags',
    tagline: 'Undisputed Highway King with Plush Captain Seats',
    desc: 'The undisputed king of Indian highways. Superior comfort, plush captain seats, and exceptional highway stability.',
    image: '/images/vehicles/fleet-5-toyota-innova-crysta.png',
    features: ['Supreme highway stability & safety', 'VIP plush captain seats', 'Best-in-class comfort for long distances'],
  },
  {
    id: 'tata-winger',
    number: '06',
    name: 'Tata Winger (12 Seater)',
    seats: '12 Seaters',
    passengers: 12,
    transmission: 'Manual',
    type: 'Maxi Van',
    category: 'traveller',
    categoryLabel: 'Van / Traveller',
    luggage: '6 Large Bags + Rear Storage',
    tagline: 'Spacious 12-Seater Van with Individual Bucket Seats',
    desc: 'Spacious 12-seater passenger van with individual bucket seats and superior headroom for corporate travel and group tours.',
    image: '/images/vehicles/fleet-6-tata-winger.png',
    features: ['Individual high-back bucket seats', 'Walk-through high headroom cabin', 'Perfect for corporate delegations & weddings'],
  },
  {
    id: 'tempo-traveller-14',
    number: '07',
    name: 'Tempo Traveller (14 Seater)',
    seats: '14 Seaters',
    passengers: 14,
    transmission: 'Manual',
    type: 'Group Traveller',
    category: 'traveller',
    categoryLabel: 'Van / Traveller',
    luggage: '8 Large Bags + Roof Carrier',
    tagline: '14-Seater Force Traveller with Pushback Recliners',
    desc: 'Dedicated 14-seater Force Tempo Traveller with push-back recliner seats and spacious luggage compartment for pilgrimages and group tours.',
    image: '/images/vehicles/fleet-7-tempo-traveller-14.png',
    features: ['Comfortable push-back recliner seats', 'Wide center aisle & roof luggage carrier', 'Top choice for pilgrimage & family yatras'],
  },
  {
    id: 'tempo-traveller-17',
    number: '08',
    name: 'Tempo Traveller (17 Seater)',
    seats: '17 Seaters',
    passengers: 17,
    transmission: 'Manual',
    type: 'Luxury Force Traveller',
    category: 'traveller',
    categoryLabel: 'Van / Traveller',
    luggage: '10 Large Bags + Roof Carrier',
    tagline: 'High-Roof 17-Seater Luxury Force Traveller',
    desc: 'High-roof 17-seater Force Tempo Traveller with premium pushback seats, wide aisle, and dedicated luggage space for large groups.',
    image: '/images/vehicles/fleet-8-tempo-traveller-17.png',
    features: ['High-roof spacious 17 passenger layout', 'Deep luggage hold & extra roof storage', 'Ideal for large group holidays & events'],
  },
  {
    id: 'urbania-traveller',
    number: '09',
    name: 'Urbania Traveller (17 Seater)',
    seats: '17 Seaters',
    passengers: 17,
    transmission: 'Auto',
    type: 'Executive Luxury Van',
    category: 'traveller',
    categoryLabel: 'Van / Traveller',
    luggage: '12 Large Bags',
    tagline: 'Executive World-Class Luxury Van with Airline Seats',
    desc: 'World-class Force Urbania executive van with panoramic windows, airline-style recliner seats, and whisper-quiet cabin luxury.',
    image: '/images/vehicles/fleet-9-urbania-traveller.png',
    features: ['Airline-style luxury recliner seating', 'Panoramic viewing windows', 'Whisper-quiet premium ride experience'],
  },
]

export default function VehicleSliderSection() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [filterCat, setFilterCat] = useState<'all' | 'sedan' | 'suv' | 'traveller'>('all')

  const rawPhone = PHONE.replace(/[^0-9+]/g, '')
  const activeCar = ALL_9_VEHICLES[activeIdx]

  const nextCar = () => {
    setActiveIdx((prev) => (prev >= ALL_9_VEHICLES.length - 1 ? 0 : prev + 1))
  }

  const prevCar = () => {
    setActiveIdx((prev) => (prev <= 0 ? ALL_9_VEHICLES.length - 1 : prev - 1))
  }

  const visibleGrid = ALL_9_VEHICLES.filter((v) => {
    if (filterCat === 'all') return true
    return v.category === filterCat
  })

  return (
    <section className="py-16 lg:py-24 relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #060d1e 0%, #0c1833 50%, #060d1e 100%)',
    }}>
      {/* Ambient background glows */}
      <div style={{
        position: 'absolute', top: '-140px', left: '15%', pointerEvents: 'none',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(8,169,238,0.12) 0%, transparent 65%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-160px', right: '15%', pointerEvents: 'none',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(2,132,199,0.10) 0%, transparent 65%)',
      }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Section Header — Perfectly Centered */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-[#08A9EE]/15 border border-[#08A9EE]/30 px-3.5 py-1.5 rounded-full mb-3">
            <Sparkles size={13} className="text-[#08A9EE]" />
            <span className="text-xs font-extrabold text-[#08A9EE] tracking-wider uppercase">
              Our Fleet of 9 Distinct Vehicles
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight mb-3 tracking-tight">
            Choose Your Ride from <span className="text-[#08A9EE]">9 Verified Vehicles</span>
          </h2>

          <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Every vehicle in our fleet is company-verified, cleaned before departure, and operated by professional background-checked chauffeurs.
          </p>
        </div>

        {/* 9-Vehicle Quick Navigation Bar — Centered on Desktop, Swipeable on Mobile */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none w-full">
          {ALL_9_VEHICLES.map((v, i) => {
            const isSelected = i === activeIdx
            return (
              <button
                key={v.id}
                onClick={() => setActiveIdx(i)}
                className={`shrink-0 inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#08A9EE] text-white shadow-lg shadow-[#08A9EE]/40 border border-[#08A9EE]'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                }`}
              >
                <span className="whitespace-nowrap">{v.name}</span>
              </button>
            )
          })}
        </div>

        {/* ── FEATURED SPOTLIGHT SHOWCASE (HERO CARD) — 100% PERFECTLY CENTERED ── */}
        <div className="w-full max-w-5xl mx-auto bg-gradient-to-br from-white/10 to-white/[0.03] border border-[#08A9EE]/30 rounded-2xl sm:rounded-3xl p-4 sm:p-7 lg:p-9 shadow-2xl mb-12 backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">

            {/* Left Col: High-impact vehicle image showcase — Centered */}
            <div className="lg:col-span-7 flex flex-col items-center w-full">
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] lg:h-[320px] max-w-xl mx-auto bg-gradient-to-b from-white to-slate-100 rounded-2xl overflow-hidden shadow-xl border border-white/40">
                <div className="absolute top-3.5 left-3.5 z-10 bg-slate-900/90 text-white text-[10px] sm:text-xs font-extrabold px-2.5 py-1 rounded-md tracking-wider uppercase">
                  {activeCar.type}
                </div>

                <div className="absolute top-3.5 right-3.5 z-10 bg-[#EAF6FF] text-[#0369a1] border border-[#bae6fd] text-[11px] sm:text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Users size={13} className="text-[#08A9EE]" />
                  <span>{activeCar.seats}</span>
                </div>

                {/* Car Photo */}
                <Image
                  src={activeCar.image}
                  alt={activeCar.name}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 600px"
                  className="object-contain p-3 sm:p-5"
                />
              </div>

              {/* Prev / Next controls — Perfectly Aligned & Never Squished */}
              <div className="flex items-center justify-between w-full max-w-xl mx-auto mt-4 px-1 gap-2">
                <button
                  onClick={prevCar}
                  aria-label="Previous Car"
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold cursor-pointer transition-colors"
                >
                  <ChevronLeft size={16} />
                  <span>Prev</span>
                </button>

                <div className="text-center">
                  <span className="text-xs sm:text-sm font-bold text-[#08A9EE]">
                    {activeCar.name}
                  </span>
                </div>

                <button
                  onClick={nextCar}
                  aria-label="Next Car"
                  className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-bold cursor-pointer transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Right Col: Vehicle Specs, Description & Action */}
            <div className="lg:col-span-5 flex flex-col text-center lg:text-left w-full">
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                <span className="text-[11px] font-extrabold text-[#08A9EE] uppercase tracking-wider">
                  {activeCar.type}
                </span>
                <span className="text-white/30">•</span>
                <span className="text-[11px] font-bold text-gray-300">
                  {activeCar.transmission} Transmission
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 leading-tight">
                {activeCar.name}
              </h3>

              <p className="text-xs sm:text-sm font-bold text-[#08A9EE] mb-3">
                {activeCar.tagline}
              </p>

              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-5 max-w-lg mx-auto lg:mx-0">
                {activeCar.desc}
              </p>

              {/* Spec Chips Row */}
              <div className="grid grid-cols-2 gap-2.5 mb-5 max-w-sm mx-auto lg:mx-0 w-full text-left">
                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider mb-0.5">
                    PASSENGERS
                  </span>
                  <span className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5">
                    <Users size={14} className="text-[#08A9EE]" />
                    {activeCar.seats}
                  </span>
                </div>

                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                  <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider mb-0.5">
                    LUGGAGE
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-white flex items-center gap-1.5">
                    <Luggage size={14} className="text-[#08A9EE]" />
                    {activeCar.luggage}
                  </span>
                </div>
              </div>

              {/* Feature Checklist */}
              <div className="mb-6 flex flex-col gap-2 max-w-sm mx-auto lg:mx-0 text-left w-full">
                {activeCar.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-2 text-xs sm:text-sm text-gray-200">
                    <CheckCircle2 size={15} className="text-[#08A9EE] shrink-0" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Action Buttons — Full Width on Mobile, Side by Side on Desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-sm mx-auto lg:mx-0 w-full">
                <a
                  href={`tel:${rawPhone}`}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/25 font-bold text-xs sm:text-sm py-3 px-4 rounded-xl transition-colors"
                >
                  <Phone size={15} className="text-[#08A9EE]" />
                  <span>Call Chauffeur</span>
                </a>

                <a
                  href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hello! I would like to book the ${activeCar.name} (${activeCar.seats}). Please share fare quote and availability.`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#08A9EE] to-[#0284c7] hover:brightness-105 text-white font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-lg shadow-[#08A9EE]/30 transition-all"
                >
                  <MessageCircle size={16} />
                  <span>Book on WhatsApp</span>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* ── ALL 9 CARS QUICK EXPLORER (GRID) ── */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 text-center sm:text-left">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-1">
                Explore All 9 Fleet Vehicles
              </h3>
              <p className="text-xs sm:text-sm text-gray-400">
                Click on any card to view full specifications in the spotlight above.
              </p>
            </div>

            {/* Filter by Category */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {[
                { id: 'all', label: 'All 9' },
                { id: 'sedan', label: 'Sedans (4+1)' },
                { id: 'suv', label: 'MUVs & SUVs (6+1)' },
                { id: 'traveller', label: 'Travellers (12-17)' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterCat(f.id as typeof filterCat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    filterCat === f.id
                      ? 'bg-[#08A9EE] text-white'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* 9 Unique Cards Grid — Perfectly Centered on Mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {visibleGrid.map((v) => {
              const actualIdx = ALL_9_VEHICLES.findIndex((car) => car.id === v.id)
              const isSelected = actualIdx === activeIdx

              return (
                <div
                  key={v.id}
                  onClick={() => setActiveIdx(actualIdx)}
                  className={`w-full max-w-md mx-auto sm:max-w-none rounded-2xl p-4 cursor-pointer transition-all duration-200 flex flex-col group ${
                    isSelected
                      ? 'bg-[#08A9EE]/15 border-2 border-[#08A9EE] shadow-lg shadow-[#08A9EE]/20'
                      : 'bg-white/[0.04] border border-white/10 hover:border-[#08A9EE]/60 hover:bg-white/[0.07]'
                  }`}
                >
                  {/* Image Frame */}
                  <div className="relative h-40 bg-gradient-to-b from-white to-slate-100 rounded-xl mb-3.5 overflow-hidden">
                    <span className="absolute top-2 right-2 z-10 bg-[#EAF6FF] text-[#0369a1] text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {v.seats}
                    </span>

                    <Image
                      src={v.image}
                      alt={v.name}
                      fill
                      sizes="320px"
                      className="object-contain p-2.5 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Title & Type */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold text-[#08A9EE] uppercase tracking-wider">
                      {v.type}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      {v.transmission}
                    </span>
                  </div>

                  <h4 className={`text-base font-extrabold mb-1.5 ${
                    isSelected ? 'text-[#08A9EE]' : 'text-white'
                  }`}>
                    {v.name}
                  </h4>

                  <p className="text-xs text-gray-400 leading-relaxed mb-3 flex-1 line-clamp-2">
                    {v.desc}
                  </p>

                  <div className="flex items-center justify-between pt-2.5 border-t border-white/10 text-xs font-bold text-[#08A9EE]">
                    <span>{isSelected ? '★ Active Selection' : 'Click to View'}</span>
                    <ArrowRight size={13} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 text-center p-5 sm:p-6 bg-white/[0.03] rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <span className="text-sm text-gray-300">
            Need customized outstation packages or multiple vehicles for events?
          </span>
          <Link
            href="/vehicles"
            className="text-sm font-bold text-[#08A9EE] hover:text-[#38bdf8] inline-flex items-center gap-1.5 transition-colors"
          >
            <span>View All 9 Specifications &amp; Rates</span>
            <ArrowRight size={15} />
          </Link>
        </div>

      </div>
    </section>
  )
}
