'use client'

import Link from 'next/link'
import { MapPin, ArrowRight, Navigation, Car } from 'lucide-react'

interface Route {
  id: number
  slug: string
  distanceKm: unknown
  originCity: { name: string; slug: string }
  destinationCity: { name: string; slug: string }
}

interface Props {
  routes: Route[]
}

export default function PopularRoutesSection({ routes }: Props) {
  return (
    <section style={{ padding: '5.5rem 0 6rem', background: '#ffffff' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header row */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '3rem',
          flexWrap: 'wrap',
        }}>
          <div>
            <span className="section-overline">POPULAR ROUTES</span>
            <h2 style={{ color: '#10264A', marginTop: '0.375rem', marginBottom: '0.75rem' }}>
              Popular One-Way Routes
            </h2>
            <p style={{ color: '#6B7280', fontSize: '1rem', lineHeight: 1.75, maxWidth: '34rem' }}>
              Fixed fares, no surge pricing. Find your route and enquire in seconds.
            </p>
          </div>
          <Link
            href="/routes"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#08A9EE',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              paddingBottom: '0.25rem',
            }}
          >
            View all routes
            <ArrowRight size={15} />
          </Link>
        </div>

        {routes.length === 0 ? (
          /* ── Empty state ── */
          <div style={{
            background: '#f8fafc',
            border: '1.5px dashed #e5e7eb',
            borderRadius: '1.25rem',
            padding: '4rem 2rem',
            textAlign: 'center',
          }}>
            <div style={{
              width: '4rem', height: '4rem',
              borderRadius: '50%',
              background: '#EAF6FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <Car size={22} color="#08A9EE" />
            </div>
            <p style={{ color: '#9CA3AF', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
              Routes will appear here once configured.
            </p>
            <Link href="/routes" className="btn btn-primary" style={{ display: 'inline-flex', padding: '0.75rem 1.75rem' }}>
              Browse All Routes
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <>
            {/* ── Route cards grid ── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem',
              marginBottom: '2.5rem',
            }}>
              {routes.map((route) => {
                const km = route.distanceKm ? Number(route.distanceKm) : null
                return (
                  <Link
                    key={route.id}
                    href={`/routes/${route.slug}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.875rem',
                      background: '#ffffff',
                      border: '1.5px solid #e5e7eb',
                      borderRadius: '1rem',
                      padding: '1rem 1.125rem',
                      textDecoration: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s, transform 0.2s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLAnchorElement
                      el.style.borderColor = '#08A9EE'
                      el.style.boxShadow = '0 6px 24px rgba(8,169,238,0.1)'
                      el.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLAnchorElement
                      el.style.borderColor = '#e5e7eb'
                      el.style.boxShadow = 'none'
                      el.style.transform = 'translateY(0)'
                    }}
                  >
                    {/* Origin icon */}
                    <div style={{
                      width: '2.5rem', height: '2.5rem',
                      borderRadius: '0.625rem',
                      background: '#EAF6FF',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <MapPin size={15} color="#08A9EE" strokeWidth={2.2} />
                    </div>

                    {/* Route text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'nowrap' }}>
                        <span style={{
                          fontSize: '0.9rem', fontWeight: 700, color: '#10264A',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          maxWidth: '6.5rem',
                        }}>
                          {route.originCity.name}
                        </span>
                        <Navigation size={11} color="#9CA3AF" style={{ flexShrink: 0, transform: 'rotate(90deg)' }} />
                        <span style={{
                          fontSize: '0.9rem', fontWeight: 700, color: '#10264A',
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                          maxWidth: '6.5rem',
                        }}>
                          {route.destinationCity.name}
                        </span>
                      </div>
                      {km && (
                        <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '0.2rem' }}>
                          {km} km
                        </div>
                      )}
                    </div>

                    {/* Arrow */}
                    <div style={{
                      width: '1.875rem', height: '1.875rem',
                      borderRadius: '50%',
                      border: '1.5px solid #e5e7eb',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'background 0.18s, border-color 0.18s',
                    }}>
                      <ArrowRight size={13} color="#9CA3AF" />
                    </div>
                  </Link>
                )
              })}
            </div>

            {/* Bottom CTA */}
            <div style={{ textAlign: 'center' }}>
              <Link
                href="/routes"
                className="btn btn-primary"
                style={{ display: 'inline-flex', padding: '0.875rem 2.25rem' }}
              >
                View All Routes
                <ArrowRight size={16} />
              </Link>
            </div>
          </>
        )}

      </div>
    </section>
  )
}
