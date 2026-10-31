import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import AboutFleetSection from '@/components/about/AboutFleetSection'
import Link from 'next/link'
import Image from 'next/image'
import {
  Shield, Clock, Users, MapPin, Phone, MessageCircle,
  CheckCircle2, Car, IndianRupee, HeadphonesIcon,
  Star, CalendarCheck,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us — Radhe Krishna Cab | Trusted Taxi Service in Gujarat',
  description:
    'Radhe Krishna Cab is a trusted taxi & outstation cab service since 2020. Professional drivers, well-maintained vehicles, transparent pricing across 250+ cities in Gujarat & India.',
}

const WA    = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? '+91 97230 97832'

const stats = [
  { value: '1,200+', label: 'Happy Customers',   icon: Users },
  { value: '10+',    label: 'Branch Locations',  icon: MapPin },
  { value: '250+',   label: 'Cities Covered',    icon: Car },
  { value: 'Since 2020', label: 'Years of Trust', icon: CalendarCheck },
]

const features = [
  'Background-verified professional drivers',
  'Well-maintained clean vehicles',
  'Sedans, SUVs, Innova & Tempo Travellers',
  'Quick booking confirmation',
  'Transparent upfront pricing',
  '250+ cities across India',
]

const values = [
  {
    icon: Shield,
    title: 'Safety First',
    desc: 'All drivers undergo thorough background checks and vehicle inspections before every trip.',
    iconBg: '#EAF6FF', iconColor: '#08A9EE',
  },
  {
    icon: IndianRupee,
    title: 'Transparent Pricing',
    desc: 'Fares shared before confirmation. No hidden charges, no surprise bills at the end.',
    iconBg: '#FFF7ED', iconColor: '#D97706',
  },
  {
    icon: Clock,
    title: 'Always On Time',
    desc: 'Punctual pickups and professional conduct — every single trip, without compromise.',
    iconBg: '#F0FDF4', iconColor: '#16A34A',
  },
  {
    icon: HeadphonesIcon,
    title: '24 / 7 Support',
    desc: 'Our team is available around the clock for booking queries and mid-trip assistance.',
    iconBg: '#FAF5FF', iconColor: '#9333EA',
  },
]

export default function AboutPage() {
  const rawPhone = PHONE.replace(/[^0-9+]/g, '')

  return (
    <>
      <Header />
      <main>

        {/* ── Page Hero ── */}
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
              <span style={{ color: '#ffffff' }}>About Us</span>
            </nav>
            <span className="section-overline">WHO WE ARE</span>
            <h1 style={{ color: '#ffffff', marginTop: '0.5rem', marginBottom: '1rem', lineHeight: 1.2,
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)' }}>
              About <span style={{ color: '#08A9EE' }}>Radhe Krishna Cab</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '36rem' }}>
              Your trusted partner for outstation cab service across Gujarat & India —
              operating since 2020 with 100% verified drivers and transparent pricing.
            </p>
          </div>
        </section>

        {/* ── Main About ── */}
        <section className="py-12 sm:py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

              {/* Image */}
              <div className="relative max-w-xl mx-auto lg:max-w-none w-full">
                <div style={{
                  borderRadius: '1.375rem', overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                  border: '1.5px solid #e5e7eb',
                  lineHeight: 0,
                }}>
                  <Image
                    src="/images/about-ertiga.jpg"
                    alt="Radhe Krishna Cab — trusted taxi service"
                    width={680} height={460}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Content */}
              <div className="text-center lg:text-left">
                <span className="section-overline">OUR STORY</span>
                <h2 style={{ color: '#10264A', marginTop: '0.5rem', marginBottom: '1.125rem', lineHeight: 1.25 }}>
                  Your Trusted Travel<br />
                  <span style={{ color: '#08A9EE' }}>Partner in India</span>
                </h2>
                <p style={{ color: '#6B7280', fontSize: '1rem', lineHeight: 1.85, marginBottom: '2rem' }}>
                  Radhe Krishna Cab is a professional taxi and outstation cab service
                  operating across India since 2020. We connect cities with safe,
                  comfortable, and reliable intercity taxi service for individuals,
                  families, and corporate travellers. Our fleet covers Ahmedabad,
                  Vadodara, Rajkot, Gandhinagar, Anand, Bhavnagar, Jamnagar and
                  250+ cities beyond.
                </p>

                {/* Checklist */}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 max-w-md mx-auto lg:mx-0 text-left list-none p-0">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 size={16} color="#08A9EE" className="shrink-0 mt-0.5" />
                      <span style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.5 }}>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 max-w-md mx-auto lg:mx-0">
                  <a href={`tel:${rawPhone}`} className="btn btn-primary">
                    <Phone size={15} /> Call Now: {PHONE}
                  </a>
                  <a
                    href={`https://wa.me/${WA}`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn btn-outline"
                  >
                    <MessageCircle size={15} /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Our Values ── */}
        <section
          className="py-12 sm:py-16 lg:py-24 relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, #0d1f3c 0%, #10264A 100%)',
          }}
        >
          <div style={{
            position: 'absolute', top: '-100px', left: '-100px', pointerEvents: 'none',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(8,169,238,0.07) 0%, transparent 65%)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-80px', right: '-80px', pointerEvents: 'none',
            width: '360px', height: '360px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(8,169,238,0.06) 0%, transparent 65%)',
          }} />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position: 'relative' }}>

            <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
              <span className="section-overline">OUR PROMISE</span>
              <h2 style={{ color: '#ffffff', marginTop: '0.5rem', marginBottom: '1rem' }}>
                What We Stand For
              </h2>
              <p style={{
                color: 'rgba(156,163,175,0.85)', fontSize: '1rem',
                lineHeight: 1.8, maxWidth: '36rem', margin: '0 auto', textAlign: 'center',
              }}>
                Every ride we operate is built on these four core principles — no exceptions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {values.map((v) => (
                <div key={v.title} style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '1.25rem',
                  padding: '2rem 1.625rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.125rem',
                  transition: 'background 0.2s, border-color 0.2s',
                }}>
                  <div style={{
                    width: '4rem', height: '4rem', borderRadius: '50%',
                    background: v.iconBg.replace(')', ', 0.15)').replace('rgb', 'rgba'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <div style={{
                      width: '2.875rem', height: '2.875rem', borderRadius: '50%',
                      background: v.iconBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <v.icon size={20} color={v.iconColor} strokeWidth={2.1} />
                    </div>
                  </div>

                  <div>
                    <h3 style={{
                      color: '#ffffff', fontSize: '1rem',
                      fontWeight: 700, marginBottom: '0.625rem', lineHeight: 1.3,
                    }}>
                      {v.title}
                    </h3>
                    <p style={{
                      fontSize: '0.875rem', color: 'rgba(156,163,175,0.85)',
                      lineHeight: 1.75, margin: 0,
                    }}>
                      {v.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── REDESIGNED ABOUT US FLEET SHOWCASE: DISTINCT LIGHT-THEME SECTION ── */}
        <AboutFleetSection />

        {/* ── Testimonial ── */}
        <section className="py-16 lg:py-20 bg-slate-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8" style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginBottom: '1.25rem' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={18} style={{ fill: '#f59e0b', color: '#f59e0b' }} />
              ))}
            </div>
            <blockquote style={{
              fontSize: '1.125rem', fontWeight: 600, color: '#10264A',
              lineHeight: 1.75, fontStyle: 'italic', marginBottom: '1rem',
            }}>
              &ldquo;Radhe Krishna Cab has been my go-to for all outstation trips.
              Punctual, clean cars, and the drivers are always professional.&rdquo;
            </blockquote>
            <cite style={{ fontSize: '0.8125rem', color: '#9CA3AF', fontStyle: 'normal' }}>
              — Satisfied Customer, Gujarat
            </cite>
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
            <span className="section-overline">READY TO TRAVEL?</span>
            <h2 style={{ color: '#ffffff', marginTop: '0.5rem', marginBottom: '1rem' }}>
              Book Your Cab Today
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '1rem', lineHeight: 1.8, marginBottom: '2.25rem' }}>
              No advance payment. Transparent pricing. Available 24/7 across Gujarat & India.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem' }}>
              <Link href="/contact#enquiry" className="btn btn-primary" style={{ padding: '0.875rem 2rem' }}>
                <CalendarCheck size={16} /> Book Your Cab
              </Link>
              <a
                href={`https://wa.me/${WA}`}
                target="_blank" rel="noopener noreferrer"
                className="btn btn-outline-white"
                style={{ padding: '0.875rem 2rem' }}
              >
                <MessageCircle size={16} /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
    </>
  )
}
