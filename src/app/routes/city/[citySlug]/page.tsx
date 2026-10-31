import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import Link from 'next/link'
import { ChevronRight, Phone, MessageCircle, MapPin, Search } from 'lucide-react'
import { getCityBySlug } from '@/lib/services/city-service'
import { prisma } from '@/lib/prisma'
import CityRoutesClient from '@/components/routes/CityRoutesClient'

interface PageProps {
  params: Promise<{ citySlug: string }>
  searchParams: Promise<{ search?: string; page?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { citySlug } = await params
  const city = await getCityBySlug(citySlug).catch(() => null)
  if (!city) return {}
  return {
    title: `Taxi from ${city.name} — All One-Way Routes & Fares | Radhe Krishna Cab`,
    description: `Browse all one-way taxi routes from ${city.name}. Fixed fares, AC vehicles, verified drivers. Book your outstation cab from ${city.name} now.`,
  }
}

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832'
const PER_PAGE = 20

export default async function CityRoutesPage({ params, searchParams }: PageProps) {
  const { citySlug } = await params
  const sp = await searchParams
  const search = sp.search ?? ''
  const page = Math.max(1, parseInt(sp.page ?? '1'))

  const city = await getCityBySlug(citySlug).catch(() => null)
  if (!city) notFound()

  const where = {
    isActive: true,
    originCityId: city.id,
    ...(search ? { destinationCity: { name: { contains: search } } } : {}),
  }

  const [routes, total] = await Promise.all([
    prisma.route.findMany({
      where,
      include: {
        originCity: { select: { name: true, slug: true } },
        destinationCity: { select: { name: true, slug: true } },
        priceOverrides: {
          where: { isActive: true },
          orderBy: { oneWayFare: 'asc' },
          take: 1,
        },
      },
      orderBy: { destinationCity: { name: 'asc' } },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.route.count({ where }),
  ])

  const pages = Math.ceil(total / PER_PAGE)

  const serialisedRoutes = routes.map(r => ({
    id: r.id,
    slug: r.slug,
    originName: r.originCity.name,
    originSlug: r.originCity.slug,
    destinationName: r.destinationCity.name,
    destinationSlug: r.destinationCity.slug,
    lowestFare: r.priceOverrides[0]?.oneWayFare != null ? Number(r.priceOverrides[0].oneWayFare) : null,
  }))

  return (
    <>
      <Header />
      <main>

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <div style={{ background: '#0a1628' }}>
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '36px 24px 32px' }}>

            {/* Breadcrumb */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', marginBottom: 20, flexWrap: 'wrap' }}>
              <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link>
              <ChevronRight size={12} />
              <Link href="/routes" style={{ color: '#94a3b8', textDecoration: 'none' }}>Routes</Link>
              <ChevronRight size={12} />
              <span style={{ color: '#e2e8f0' }}>{city.name}</span>
            </nav>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20 }}>
              <div>
                <Link href="/routes" style={{ fontSize: 12, color: '#64748b', textDecoration: 'none', display: 'inline-block', marginBottom: 10 }}>
                  ← Back to All Cities
                </Link>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: '#ffffff', margin: '0 0 8px', lineHeight: 1.3 }}>
                  Taxi from <span style={{ color: '#f59e0b' }}>{city.name}</span>
                </h1>
                <p style={{ fontSize: 14, color: '#94a3b8', margin: 0 }}>
                  {total > 0
                    ? <><strong style={{ color: '#e2e8f0' }}>{total}</strong> destinations · fixed fares · AC vehicles</>
                    : `Explore taxi routes from ${city.name}`}
                </p>
              </div>

              {/* Search */}
              <form method="GET" style={{ width: '100%', maxWidth: 280 }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                  <input
                    name="search"
                    defaultValue={search}
                    placeholder="Search destination…"
                    style={{ width: '100%', padding: '9px 12px 9px 34px', borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                {search && (
                  <div style={{ marginTop: 6, textAlign: 'right' }}>
                    <Link href={`/routes/city/${citySlug}`} style={{ fontSize: 11, color: '#64748b', textDecoration: 'underline' }}>
                      Clear search
                    </Link>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* ── CONTENT ────────────────────────────────────────────────────── */}
        <div style={{ background: '#f8fafc', minHeight: '60vh' }}>
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>

            {/* Search notice */}
            {search && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: '#1e40af' }}>
                <Search size={14} />
                <span><strong>{total}</strong> result{total !== 1 ? 's' : ''} for &quot;{search}&quot; from {city.name}</span>
                <Link href={`/routes/city/${citySlug}`} style={{ marginLeft: 'auto', color: '#2563eb', fontWeight: 600, textDecoration: 'none', fontSize: 12 }}>
                  Clear
                </Link>
              </div>
            )}

            {routes.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 24px', background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <MapPin size={40} style={{ color: '#e2e8f0', margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: 17, fontWeight: 600, color: '#475569', margin: '0 0 8px' }}>
                  {search ? `No destinations found for "${search}"` : 'Routes Coming Soon'}
                </h2>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 20px' }}>
                  {search
                    ? `No match found in ${city.name} routes. Try a different city name.`
                    : `Routes from ${city.name} are being configured. Call us for bookings.`}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
                  {search && (
                    <Link href={`/routes/city/${citySlug}`}
                      style={{ background: '#0a1628', color: '#ffffff', fontWeight: 600, fontSize: 13, padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>
                      All {city.name} Routes
                    </Link>
                  )}
                  <a href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hello! I need a taxi from ${city.name}.`)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#22c55e', color: '#ffffff', fontWeight: 600, fontSize: 13, padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>
                    <MessageCircle size={14} /> WhatsApp Us
                  </a>
                </div>
              </div>
            ) : (
              <>
                {/* Count row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                    Showing <strong style={{ color: '#0f172a' }}>{(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)}</strong> of <strong style={{ color: '#0f172a' }}>{total}</strong> routes
                  </p>
                  {pages > 1 && <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Page {page} of {pages}</p>}
                </div>

                <CityRoutesClient routes={serialisedRoutes} />

                {/* Pagination */}
                {pages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, paddingTop: 20, borderTop: '1px solid #e2e8f0' }}>
                    <div>
                      {page > 1 && (
                        <Link href={`/routes/city/${citySlug}?page=${page - 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                          style={{ fontSize: 13, fontWeight: 500, color: '#475569', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 16px', textDecoration: 'none', background: '#ffffff' }}>
                          ← Previous
                        </Link>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                        const p = page <= 3 ? i + 1 : page - 2 + i
                        if (p < 1 || p > pages) return null
                        return (
                          <Link key={p}
                            href={`/routes/city/${citySlug}?page=${p}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                            style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', background: p === page ? '#0a1628' : '#ffffff', color: p === page ? '#ffffff' : '#64748b', border: p === page ? '1px solid #0a1628' : '1px solid #e2e8f0' }}>
                            {p}
                          </Link>
                        )
                      })}
                    </div>
                    <div>
                      {page < pages && (
                        <Link href={`/routes/city/${citySlug}?page=${page + 1}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                          style={{ fontSize: 13, fontWeight: 500, color: '#475569', border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 16px', textDecoration: 'none', background: '#ffffff' }}>
                          Next →
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* CTA strip */}
            <div style={{ background: '#0a1628', borderRadius: 12, padding: '24px 28px', marginTop: 32, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', margin: '0 0 4px' }}>
                  Need help planning your trip from {city.name}?
                </p>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Our team is available 24/7 for bookings and queries.</p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <a href="tel:+919723097832"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ffffff', color: '#0a1628', fontWeight: 700, fontSize: 13, padding: '10px 18px', borderRadius: 8, textDecoration: 'none' }}>
                  <Phone size={14} /> Call Now
                </a>
                <a href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hello! I need a taxi from ${city.name}.`)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#22c55e', color: '#ffffff', fontWeight: 700, fontSize: 13, padding: '10px 18px', borderRadius: 8, textDecoration: 'none' }}>
                  <MessageCircle size={14} /> WhatsApp
                </a>
              </div>
            </div>

            <div style={{ textAlign: 'center', paddingTop: 24 }}>
              <Link href="/routes" style={{ fontSize: 13, color: '#64748b', textDecoration: 'none', fontWeight: 500 }}>
                ← Back to All Routes
              </Link>
            </div>

          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
    </>
  )
}
