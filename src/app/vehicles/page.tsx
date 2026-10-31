import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import Link from 'next/link'
import Image from 'next/image'
import { Phone, MessageCircle, Users, Settings2, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Our Fleet — Radhe Krishna Cab | Cabs for Every Journey',
  description:
    'Explore our fleet — Swift Dzire, Hyundai Aura, Maruti Suzuki Ertiga, Kia Carens, Toyota Innova Cresta, Tata Winger, Tempo Traveller (14 & 17 Seater) and Urbania Traveller. Vehicles for every group size. Book now.',
}

const WA    = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? '+91 97230 97832'

interface Vehicle {
  slug: string
  name: string
  seats: string
  passengers: number
  transmission: 'Manual' | 'Automatic' | 'Auto'
  type: string
  desc: string
  image: string
}

const vehicles: Vehicle[] = [
  {
    slug: 'swift-dzire',
    name: 'Swift Dzire',
    seats: '4+1 Seaters',
    passengers: 4,
    transmission: 'Manual',
    type: 'Sedan',
    desc: 'India’s most trusted compact sedan. Outstanding mileage, smooth ride, and great comfort for city rides & outstation journeys.',
    image: '/images/vehicles/fleet-1-swift-desire.png',
  },
  {
    slug: 'hyundai-aura',
    name: 'Hyundai Aura',
    seats: '4+1 Seaters',
    passengers: 4,
    transmission: 'Manual',
    type: 'Sedan',
    desc: 'Modern and stylish sedan with generous boot space and plush legroom. Ideal for families and business travelers.',
    image: '/images/vehicles/fleet-2-hyundai-aura.png',
  },
  {
    slug: 'maruti-suzuki-ertiga',
    name: 'Maruti Suzuki Ertiga',
    seats: '6+1 Seaters',
    passengers: 6,
    transmission: 'Manual',
    type: 'MUV',
    desc: 'The best-value 7-seater MPV with flexible seating, ample boot space, and smooth ride for family vacations and airport trips.',
    image: '/images/vehicles/fleet-3-maruti-suzuki-ertiga.png',
  },
  {
    slug: 'kia-carens',
    name: 'Kia Carens',
    seats: '6+1 Seaters',
    passengers: 6,
    transmission: 'Auto',
    type: 'MUV',
    desc: 'Next-gen recreational vehicle with comfortable seats and advanced safety features for long highway journeys.',
    image: '/images/vehicles/fleet-4-kia-carens.png',
  },
  {
    slug: 'toyota-innova-cresta',
    name: 'Toyota Innova Cresta',
    seats: '6+1 Seaters',
    passengers: 6,
    transmission: 'Auto',
    type: 'SUV',
    desc: 'The undisputed king of Indian highways. Superior comfort, plush captain seats, and exceptional highway stability.',
    image: '/images/vehicles/fleet-5-toyota-innova-crysta.png',
  },
  {
    slug: 'tata-winger',
    name: 'Tata Winger',
    seats: '12 Seaters',
    passengers: 12,
    transmission: 'Manual',
    type: 'Maxi Van',
    desc: 'Spacious 12-seater passenger van with individual bucket seats and superior headroom for corporate travel and group tours.',
    image: '/images/vehicles/fleet-6-tata-winger.png',
  },
  {
    slug: 'tempo-traveller-14',
    name: 'Tempo Traveller (14 Seater)',
    seats: '14 Seaters',
    passengers: 14,
    transmission: 'Manual',
    type: 'Traveller',
    desc: 'Dedicated 14-seater Force Tempo Traveller with push-back recliner seats and spacious luggage compartment for pilgrimages and group tours.',
    image: '/images/vehicles/fleet-7-tempo-traveller-14.png',
  },
  {
    slug: 'tempo-traveller-17',
    name: 'Tempo Traveller (17 Seater)',
    seats: '17 Seaters',
    passengers: 17,
    transmission: 'Manual',
    type: 'Traveller',
    desc: 'High-roof 17-seater Force Tempo Traveller with premium pushback seats, wide aisle, and dedicated luggage space for large groups.',
    image: '/images/vehicles/fleet-8-tempo-traveller-17.png',
  },
  {
    slug: 'urbania-traveller',
    name: 'Urbania Traveller',
    seats: '17 Seaters',
    passengers: 17,
    transmission: 'Auto',
    type: 'Luxury Van',
    desc: 'World-class Force Urbania executive van with panoramic windows, airline-style recliner seats, and whisper-quiet cabin luxury.',
    image: '/images/vehicles/fleet-9-urbania-traveller.png',
  },
]

export default function VehiclesPage() {
  const rawPhone = PHONE.replace(/[^0-9+]/g, '')

  return (
    <>
      <Header />
      <main>

        {/* ── Hero ── */}
        <section style={{
          background: 'linear-gradient(135deg, #0f1e3d 0%, #1a3a6b 55%, #0d1f3c 100%)',
          padding: '4.5rem 0 5rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, right: 0, pointerEvents: 'none',
            width: '480px', height: '480px',
            background: 'radial-gradient(circle at 80% 20%, rgba(8,169,238,0.12), transparent 60%)',
          }} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position: 'relative' }}>
            <nav style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem' }}>
              <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Home</Link>
              <span style={{ margin: '0 0.5rem' }}>/</span>
              <span style={{ color: '#ffffff' }}>Our Fleet</span>
            </nav>
            <span className="section-overline">OUR FLEET</span>
            <h1 style={{
              color: '#ffffff', marginTop: '0.5rem', marginBottom: '1rem',
              lineHeight: 1.2, fontSize: 'clamp(1.85rem, 4vw, 2.85rem)', fontWeight: 900,
            }}>
              Vehicles for Every <span style={{ color: '#08A9EE' }}>Journey</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '38rem' }}>
              Explore our fleet of 9 well-maintained vehicles — from compact sedans to executive 17-seater luxury travellers. Clean, verified, and driven by professional chauffeurs.
            </p>
          </div>
        </section>

        {/* ── Vehicle Grid ── */}
        <section className="py-16 lg:py-24 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {vehicles.map((v) => (
                <article
                  key={v.slug}
                  style={{
                    background: '#ffffff',
                    borderRadius: '1.25rem',
                    border: '1.5px solid #e2e8f0',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(10,22,40,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.22s ease',
                  }}
                  className="w-full max-w-md mx-auto sm:max-w-none group hover:border-[#08A9EE]/50 hover:shadow-xl"
                >
                  {/* Top Image Frame */}
                  <div style={{
                    position: 'relative',
                    height: '220px',
                    background: 'linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%)',
                    overflow: 'hidden',
                    borderBottom: '1px solid #e2e8f0',
                  }}>
                    {/* Seating Badge */}
                    <div style={{
                      position: 'absolute', top: 12, right: 12, zIndex: 2,
                      background: '#EAF6FF', color: '#0369a1',
                      border: '1px solid #bae6fd',
                      fontSize: '0.75rem', fontWeight: 700,
                      padding: '4px 10px', borderRadius: '50px',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      <Users size={12} color="#08A9EE" />
                      <span>{v.seats}</span>
                    </div>

                    <Image
                      src={v.image}
                      alt={v.name}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                      style={{ padding: '1rem' }}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>

                  {/* Content */}
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#08A9EE', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        {v.type}
                      </span>
                    </div>

                    <h2 style={{
                      color: '#10264A',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      marginBottom: '0.5rem',
                    }}>
                      {v.name}
                    </h2>

                    <p style={{
                      fontSize: '0.84rem',
                      color: '#64748b',
                      lineHeight: 1.65,
                      marginBottom: '1.25rem',
                      flex: 1,
                    }}>
                      {v.desc}
                    </p>

                    {/* Specs Row without AC */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      background: '#f8fafc',
                      borderRadius: '0.75rem',
                      border: '1px solid #edf2f7',
                      marginBottom: '1.25rem',
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#334155', fontWeight: 600 }}>
                        <Users size={14} color="#08A9EE" />
                        {v.seats}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#334155', fontWeight: 600 }}>
                        <Settings2 size={14} color="#08A9EE" />
                        {v.transmission}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <a
                        href={`tel:${rawPhone}`}
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                          background: '#f1f5f9', color: '#10264A',
                          fontWeight: 700, fontSize: '0.84rem',
                          padding: '0.75rem', borderRadius: '0.625rem',
                          textDecoration: 'none', border: '1px solid #cbd5e1',
                          transition: 'background 0.15s',
                        }}
                      >
                        <Phone size={14} color="#08A9EE" />
                        Call
                      </a>
                      <a
                        href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hello! I want to book a ${v.name} (${v.seats}). Please share availability and pricing.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                          background: 'linear-gradient(135deg, #08A9EE 0%, #0284c7 100%)',
                          color: '#ffffff',
                          fontWeight: 700, fontSize: '0.84rem',
                          padding: '0.75rem', borderRadius: '0.625rem',
                          textDecoration: 'none',
                          boxShadow: '0 4px 14px rgba(8,169,238,0.3)',
                          transition: 'opacity 0.15s',
                        }}
                      >
                        <MessageCircle size={14} />
                        Book Now
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Bottom Help CTA */}
            <div style={{
              marginTop: '4.5rem',
              background: 'linear-gradient(135deg, #0f1e3d 0%, #1a3a6b 55%, #0d1f3c 100%)',
              borderRadius: '1.5rem',
              padding: '3rem 2rem',
              textAlign: 'center',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 16px 48px rgba(15,30,61,0.25)',
            }}>
              <div style={{
                position: 'absolute', top: 0, right: 0, pointerEvents: 'none',
                width: '400px', height: '400px',
                background: 'radial-gradient(circle at 80% 20%, rgba(8,169,238,0.12), transparent 60%)',
              }} />
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginBottom: '1rem' }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
                  ))}
                </div>
                <h2 style={{ color: '#ffffff', marginBottom: '0.75rem', fontSize: '1.75rem', fontWeight: 800 }}>
                  Need Help Choosing the Right Vehicle?
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.68)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2rem', maxWidth: '34rem', margin: '0 auto 2rem' }}>
                  Not sure which car best suits your route, family size, or luggage? Call our travel desk anytime — we will recommend the best cab for your journey.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                  <a href={`tel:${rawPhone}`} className="btn btn-primary" style={{ padding: '0.875rem 2rem' }}>
                    <Phone size={16} /> Call Now: {PHONE}
                  </a>
                  <a
                    href={`https://wa.me/${WA}?text=Hello!%20I%20need%20help%20choosing%20a%20vehicle%20for%20my%20trip.`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn btn-outline-white"
                    style={{ padding: '0.875rem 2rem' }}
                  >
                    <MessageCircle size={16} /> WhatsApp Us
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
    </>
  )
}
