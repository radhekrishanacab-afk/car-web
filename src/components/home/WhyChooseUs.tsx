'use client'

import Link from 'next/link'
import {
  ArrowRight, Car,
  BadgeIndianRupee, Armchair, Zap, Headphones,
} from 'lucide-react'

const reasons = [
  {
    icon: BadgeIndianRupee,
    number: '01',
    title: 'Transparent Pricing',
    description:
      'See the full fare before you confirm. No surge pricing, no hidden fees — just honest, upfront rates for every route.',
    gradient: 'linear-gradient(135deg, #EAF6FF 0%, #c8e8fa 100%)',
    iconColor: '#08A9EE',
    ring: 'rgba(8,169,238,0.18)',
  },
  {
    icon: Armchair,
    number: '02',
    title: 'Comfortable Vehicles',
    description:
      'Travel in spotless, premium cars — Sedan, SUV, or Innova Crysta — maintained for a smooth, relaxing ride.',
    gradient: 'linear-gradient(135deg, #FFF7ED 0%, #fed7aa 100%)',
    iconColor: '#D97706',
    ring: 'rgba(217,119,6,0.18)',
  },
  {
    icon: Zap,
    number: '03',
    title: 'Instant Confirmation',
    description:
      'Enquire via WhatsApp or phone and get a booking confirmation in minutes ',
    gradient: 'linear-gradient(135deg, #F0FDF4 0%, #bbf7d0 100%)',
    iconColor: '#16A34A',
    ring: 'rgba(22,163,74,0.18)',
  },
  {
    icon: Headphones,
    number: '04',
    title: '24 / 7 Support',
    description:
      'A real person is always available to help — whether it\'s a last-minute change, a query, or support during your journey.',
    gradient: 'linear-gradient(135deg, #FAF5FF 0%, #e9d5ff 100%)',
    iconColor: '#9333EA',
    ring: 'rgba(147,51,234,0.18)',
  },
]

export default function WhyChooseUs() {
  return (
    <>
      {/* ── Why Choose Us ── */}
      <section
        className="py-16 lg:py-24 relative overflow-hidden"
        style={{
          background: '#EAF6FF',
        }}
      >
        {/* Decorative background glow blobs */}
        <div style={{
          position: 'absolute', top: '-120px', left: '-120px', pointerEvents: 'none',
          width: '480px', height: '480px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(8,169,238,0.10) 0%, transparent 65%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-80px', right: '-80px', pointerEvents: 'none',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(8,169,238,0.08) 0%, transparent 65%)',
        }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position: 'relative', zIndex: 1 }}>

          {/* Section header */}
          <div className="text-center mb-8 sm:mb-12 lg:mb-14">
            <span className="section-overline">OUR ADVANTAGES</span>
            <h2 style={{ color: '#10264A', marginTop: '0.5rem', marginBottom: '1rem' }}>
              Why Choose Radhe Krishna Cab?
            </h2>
            <p style={{
              color: '#6B7280',
              fontSize: '1rem',
              lineHeight: 1.8,
              maxWidth: '36rem',
              margin: '0 auto',
              textAlign: 'center',
            }}>
              Built on trust and driven by care — here&apos;s what makes us the
              preferred cab service across Gujarat.
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {reasons.map((r) => (
              <div
                key={r.number}
                className="w-full max-w-md mx-auto sm:max-w-none" 
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #dbeafe',
                  borderRadius: '1.25rem',
                  padding: '2rem 1.625rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                  boxShadow: '0 2px 16px rgba(8,169,238,0.08)',
                  transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.boxShadow = '0 8px 32px rgba(8,169,238,0.18)'
                  el.style.borderColor = r.iconColor + '88'
                  el.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement
                  el.style.boxShadow = '0 2px 16px rgba(8,169,238,0.08)'
                  el.style.borderColor = '#dbeafe'
                  el.style.transform = 'translateY(0)'
                }}
              >
                {/* Icon circle */}
                <div style={{ position: 'relative', width: 'fit-content' }}>
                  <div style={{
                    width: '4.5rem',
                    height: '4.5rem',
                    borderRadius: '50%',
                    background: r.ring,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <div style={{
                      width: '3.25rem',
                      height: '3.25rem',
                      borderRadius: '50%',
                      background: r.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <r.icon size={22} color={r.iconColor} strokeWidth={2} />
                    </div>
                  </div>
                </div>

                {/* Text */}
                <div>
                  <h3 style={{
                    color: '#10264A',
                    fontSize: '1rem',
                    fontWeight: 700,
                    marginBottom: '0.625rem',
                    lineHeight: 1.3,
                  }}>
                    {r.title}
                  </h3>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#6B7280',
                    lineHeight: 1.75,
                  }}>
                    {r.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA row */}
          <div style={{
            marginTop: '3rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/contact#enquiry" className="btn btn-primary" style={{ padding: '0.875rem 2rem' }}>
                Book Your Cab
              </Link>
              <Link href="/vehicles" className="btn btn-outline" style={{ padding: '0.875rem 2rem' }}>
                Explore Our Fleet
              </Link>
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
