import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import Link from 'next/link'
import {
  Car, Star, User, Shield, Users, Plane, MapPin,
  Briefcase, CheckCircle, Smartphone, Clock, Settings,
  ArrowRight, Phone, MessageCircle,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Our Services — Radhe Krishna Cab | Taxi & Cab Services',
  description:
    'Radhe Krishna Cab offers a wide range of taxi services — airport transfers, city rides, outstation trips, corporate travel, family transport and more across Gujarat & India.',
}

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832'

const services = [
  {
    number: '01',
    icon: Car,
    title: 'Easy Cab Delivery',
    desc: 'Quick doorstep cab delivery, ready when you need it. Book in minutes and your driver arrives at your location.',
    iconBg: '#EAF6FF', iconColor: '#08A9EE',
  },
  {
    number: '02',
    icon: Star,
    title: 'Premium Vehicles',
    desc: 'Drive in high-quality, well-maintained premium vehicles. Clean, premium, and serviced for every trip.',
    iconBg: '#FFF7ED', iconColor: '#D97706',
  },
  {
    number: '03',
    icon: User,
    title: 'Personal Driver',
    desc: 'Skilled, background-verified drivers for safe and comfortable journeys — professional and courteous.',
    iconBg: '#F0FDF4', iconColor: '#16A34A',
  },
  {
    number: '04',
    icon: Shield,
    title: 'Private Transfer',
    desc: 'Enjoy completely private rides with full comfort and privacy — ideal for individuals and couples.',
    iconBg: '#FAF5FF', iconColor: '#9333EA',
  },
  {
    number: '05',
    icon: Users,
    title: 'Family Transport',
    desc: 'Spacious vehicles perfect for family trips and outstation travel — Innova Crysta, Ertiga and more.',
    iconBg: '#EAF6FF', iconColor: '#08A9EE',
  },
  {
    number: '06',
    icon: Plane,
    title: 'Airport Transfer',
    desc: 'On-time airport pickup and drop, stress-free travel. We track your flight and ensure punctual service.',
    iconBg: '#FFF7ED', iconColor: '#D97706',
  },
  {
    number: '07',
    icon: MapPin,
    title: 'City Rental',
    desc: 'Easy city rides for daily commuting, local sightseeing, and short trips anywhere within the city.',
    iconBg: '#F0FDF4', iconColor: '#16A34A',
  },
  {
    number: '08',
    icon: Briefcase,
    title: 'Business Travel',
    desc: 'Professional, reliable rides tailored for corporate needs — presentations, meetings and conferences.',
    iconBg: '#FAF5FF', iconColor: '#9333EA',
  },
  {
    number: '09',
    icon: CheckCircle,
    title: 'Safe & Insured Trips',
    desc: 'Every trip comes with verified drivers and insured vehicles — travel with complete peace of mind.',
    iconBg: '#EAF6FF', iconColor: '#08A9EE',
  },
  {
    number: '10',
    icon: Smartphone,
    title: 'Easy Online Booking',
    desc: 'Fast and simple booking anytime, anywhere — via WhatsApp, phone call or our contact form.',
    iconBg: '#FFF7ED', iconColor: '#D97706',
  },
  {
    number: '11',
    icon: Clock,
    title: 'Flexible Rental Plans',
    desc: 'Choose one-way, round trip or outstation packages that fit your schedule, route and budget.',
    iconBg: '#F0FDF4', iconColor: '#16A34A',
  },
  {
    number: '12',
    icon: Settings,
    title: 'Well-Equipped Cars',
    desc: 'All vehicles come with charging ports, plush seating, and modern features for a smooth, comfortable ride.',
    iconBg: '#FAF5FF', iconColor: '#9333EA',
  },
]

export default function ServicesPage() {
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
            width: '500px', height: '500px',
            background: 'radial-gradient(circle at 80% 20%, rgba(8,169,238,0.12), transparent 60%)',
          }} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position: 'relative' }}>
            <nav style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem' }}>
              <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Home</Link>
              <span style={{ margin: '0 0.5rem' }}>/</span>
              <span style={{ color: '#ffffff' }}>Services</span>
            </nav>
            <span className="section-overline">WHAT WE OFFER</span>
            <h1 style={{
              color: '#ffffff', marginTop: '0.5rem', marginBottom: '1.125rem',
              lineHeight: 1.2, fontSize: 'clamp(1.875rem, 4vw, 2.875rem)',
            }}>
              Our <span style={{ color: '#08A9EE' }}>Services</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '38rem' }}>
              From daily city rides to long outstation journeys, airport transfers to
              corporate travel — we provide reliable, comfortable cab services across
              Gujarat and India.
            </p>
          </div>
        </section>

        {/* ── Services Grid ── */}
        <section className="py-12 sm:py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section header */}
            <div className="section-head">
              <span className="section-overline">12 SERVICES</span>
              <h2>Everything You Need for Your Journey</h2>
              <p>
                Reliable, affordable, and hassle-free cab services for every journey —
                from daily commutes to long outstation trips, available 24/7.
              </p>
            </div>

            {/* 4-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {services.map((s) => (
                <div
                  key={s.number}
                  style={{
                    background: '#ffffff',
                    borderRadius: '1.125rem',
                    border: '1.5px solid #e5e7eb',
                    padding: '1.875rem 1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    position: 'relative',
                    transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
                  }}
                  className="service-card"
                >


                  {/* Icon */}
                  <div style={{
                    width: '3.25rem', height: '3.25rem',
                    borderRadius: '0.875rem',
                    background: s.iconBg, color: s.iconColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <s.icon size={22} strokeWidth={2} />
                  </div>

                  {/* Text */}
                  <div>
                    <h3 style={{
                      color: '#10264A', fontSize: '1rem',
                      fontWeight: 700, marginBottom: '0.5rem', lineHeight: 1.3,
                    }}>
                      {s.title}
                    </h3>
                    <p style={{
                      fontSize: '0.875rem', color: '#9CA3AF',
                      lineHeight: 1.7, margin: 0,
                    }}>
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── Why Choose Us strip ── */}
        <section className="py-16 lg:py-24 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="section-head">
              <span className="section-overline">WHY RADHE KRISHNA CAB</span>
              <h2>The Preferred Choice Across Gujarat</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Shield,     title: 'Verified Drivers',       desc: '100% background-checked, trained professional drivers.' },
                { icon: Clock,      title: '24/7 Availability',      desc: 'Book anytime — we are available round the clock.' },
                { icon: CheckCircle,title: 'Transparent Pricing',    desc: 'Fixed fares with no hidden charges or surge pricing.' },
                { icon: Car,        title: 'Well-Maintained Fleet',  desc: 'Clean, comfortable, and serviced vehicles for every trip.' },
              ].map((item) => (
                <div key={item.title} style={{
                  background: '#ffffff', borderRadius: '1rem',
                  border: '1.5px solid #e5e7eb', padding: '1.75rem',
                  display: 'flex', flexDirection: 'column', gap: '0.875rem',
                }}>
                  <div style={{
                    width: '3rem', height: '3rem', borderRadius: '0.75rem',
                    background: '#EAF6FF', color: '#08A9EE',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <item.icon size={20} />
                  </div>
                  <div>
                    <h3 style={{ color: '#10264A', fontSize: '0.9375rem', fontWeight: 700, marginBottom: '0.4rem' }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#9CA3AF', lineHeight: 1.7, margin: 0 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Explore India strip ── */}
        <section className="py-10 sm:py-14 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div style={{ background: 'linear-gradient(135deg, #0a1628 0%, #1a3a6b 100%)', borderRadius: '1.5rem', padding: '3rem 2.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '2rem' }}>
              <div>
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#f59e0b', letterSpacing: '0.15em', textTransform: 'uppercase' as const, display: 'block', marginBottom: '0.5rem' }}>
                  🗺️ Explore Incredible India
                </span>
                <h3 style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 800, color: '#ffffff', margin: '0 0 0.75rem', lineHeight: 1.25 }}>
                  Plan Your Tourist Trip Across India
                </h3>
                <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.75, margin: 0, maxWidth: '32rem' }}>
                  Browse tourist destinations by state, district, and city. Book a taxi to temples, beaches, hill stations, wildlife parks, and more — all across India.
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.875rem', flexShrink: 0 }}>
                <Link href="/routes" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f59e0b', color: '#0a1628', fontWeight: 700, fontSize: '0.9375rem', padding: '0.875rem 1.75rem', borderRadius: '50px', textDecoration: 'none' }}>
                  <MapPin size={16} /> Explore All Routes
                </Link>
                <a href={`https://wa.me/${WA}?text=${encodeURIComponent('Hello! I want to plan a tourist trip across India. Please share taxi options.')}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#22c55e', color: '#ffffff', fontWeight: 700, fontSize: '0.9375rem', padding: '0.875rem 1.75rem', borderRadius: '50px', textDecoration: 'none' }}>
                  <MessageCircle size={16} /> WhatsApp Us
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          className="py-16 lg:py-24 relative overflow-hidden px-4"
          style={{
            background: 'linear-gradient(135deg, #0f1e3d 0%, #1a3a6b 55%, #0d1f3c 100%)',
          }}
        >
          <div style={{
            position: 'absolute', top: 0, right: 0, pointerEvents: 'none',
            width: '480px', height: '480px',
            background: 'radial-gradient(circle at 80% 20%, rgba(8,169,238,0.12), transparent 60%)',
          }} />
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" style={{ textAlign: 'center' }}>
            <span className="section-overline">GET IN TOUCH</span>
            <h2 style={{ color: '#ffffff', marginTop: '0.5rem', marginBottom: '1rem' }}>
              Ready to Book Your Ride?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2.25rem' }}>
              Call us or send a WhatsApp message — our team confirms your booking
              quickly with no advance payment required.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
              <a href="tel:+919723097832" className="btn btn-primary" style={{ padding: '0.875rem 2rem' }}>
                <Phone size={16} /> Call Now
              </a>
              <a
                href={`https://wa.me/${WA}`}
                target="_blank" rel="noopener noreferrer"
                className="btn btn-outline-white"
                style={{ padding: '0.875rem 2rem' }}
              >
                <MessageCircle size={16} /> WhatsApp Us
              </a>
              <Link href="/contact#enquiry" className="btn btn-outline-white" style={{ padding: '0.875rem 2rem' }}>
                Enquire Now <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
    </>
  )
}
