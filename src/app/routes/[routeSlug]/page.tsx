import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import {
  MapPin, Clock, IndianRupee, ArrowRight, Phone,
  MessageCircle, ChevronRight, Users, CheckCircle, Navigation,
} from 'lucide-react'
import { getRouteBySlug, getRoutesByOriginCity } from '@/lib/services/route-service'
import { getFareEstimates } from '@/lib/pricing'
import { generateRouteContent } from '@/lib/content-generator'

interface PageProps {
  params: Promise<{ routeSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { routeSlug } = await params
  const route = await getRouteBySlug(routeSlug).catch(() => null)
  if (!route) return {}
  const { originCity: o, destinationCity: d } = route
  const fares = await getFareEstimates(route.id).catch(() => [])
  const gen = generateRouteContent({
    originCity: o.name, destinationCity: d.name,
    distanceKm: route.distanceKm ? Number(route.distanceKm) : null,
    vehicles: fares.map(f => ({ name: f.vehicleName, oneWayFare: f.oneWayFare })),
    slug: route.slug,
  })
  const title = route.seoTitle || gen.seoTitle
  const description = route.seoDescription || gen.seoDescription
  const keywords = route.seoKeywords || gen.seoKeywords
  const canonical = `https://radhekrishanacab.com/routes/${route.slug}`
  return {
    title, description,
    keywords: keywords.split(',').map(k => k.trim()),
    alternates: { canonical },
    openGraph: { title, description, type: 'website', url: canonical },
  }
}

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? '+91 97230 97832'

function capacityFor(name: string) {
  const n = name.toLowerCase()
  if (n.includes('premium') || n.includes('crysta') || n.includes('innova')) return '6–7 Passengers'
  if (n.includes('suv (7') || n.includes('7+1')) return '7 Passengers'
  if (n.includes('suv (6') || n.includes('ertiga') || n.includes('6+1')) return '6 Passengers'
  if (n.includes('van') || n.includes('traveller')) return 'Up to 12'
  return '4 Passengers'
}

export default async function RouteDetailPage({ params }: PageProps) {
  const { routeSlug } = await params
  const route = await getRouteBySlug(routeSlug).catch(() => null)
  if (!route) notFound()

  const fares = await getFareEstimates(route.id).catch(() => [])
  const { originCity: o, destinationCity: d } = route
  const distanceKm = route.distanceKm ? Number(route.distanceKm) : null
  const estimatedHours = route.estimatedHours ? Number(route.estimatedHours) : null

  const cheapestFare = fares.reduce<number | null>((min, f) => {
    if (f.oneWayFare == null) return min
    return min == null ? f.oneWayFare : Math.min(min, f.oneWayFare)
  }, null)

  const content = generateRouteContent({
    originCity: o.name, destinationCity: d.name, distanceKm,
    vehicles: fares.map(f => ({ name: f.vehicleName, oneWayFare: f.oneWayFare })),
    slug: route.slug,
  })

  const routeDesc = route.description || content.routeDescription
  const waMsg = encodeURIComponent(`Hello! I want to book a taxi from ${o.name} to ${d.name}. Please share availability and fare.`)
  const allOriginRoutes = await getRoutesByOriginCity(o.slug).catch(() => [])
  const relatedRoutes = allOriginRoutes.filter(r => r.id !== route.id).slice(0, 8)

  return (
    <>
      <Header />
      <main>

        {/* ── HERO ────────────────────────────────────────────────────────── */}
        <div style={{ background: '#0a1628' }}>
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px 36px' }}>

            {/* Breadcrumb */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', marginBottom: 24, flexWrap: 'wrap' }}>
              <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link>
              <ChevronRight size={12} />
              <Link href="/routes" style={{ color: '#94a3b8', textDecoration: 'none' }}>Routes</Link>
              <ChevronRight size={12} />
              <Link href={`/routes/city/${o.slug}`} style={{ color: '#94a3b8', textDecoration: 'none' }}>{o.name}</Link>
              <ChevronRight size={12} />
              <span style={{ color: '#e2e8f0' }}>{d.name}</span>
            </nav>

            {/* Title row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24 }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 700, color: '#ffffff', margin: '0 0 12px', lineHeight: 1.3 }}>
                  {o.name} → {d.name} Taxi
                </h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontSize: 14, color: '#94a3b8' }}>
                  {distanceKm && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Navigation size={14} style={{ color: '#64748b' }} />
                      {distanceKm} km
                    </span>
                  )}
                  {estimatedHours && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} style={{ color: '#64748b' }} />
                      ~{estimatedHours} hrs
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={14} style={{ color: '#4ade80' }} />
                    One-way cab
                  </span>
                </div>
              </div>

              {/* Fare box */}
              {cheapestFare != null && (
                <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, padding: '20px 24px', minWidth: 220 }}>
                  <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 6px' }}>Starting fare</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#ffffff', fontWeight: 700, fontSize: 30, marginBottom: 16 }}>
                    <IndianRupee size={22} />
                    {cheapestFare.toLocaleString('en-IN')}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={`tel:${PHONE.replace(/\s/g, '')}`}
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#ffffff', color: '#0a1628', fontWeight: 600, fontSize: 13, padding: '10px 18px', borderRadius: 8, textDecoration: 'none' }}>
                      <Phone size={14} /> Call
                    </a>
                    <a href={`https://wa.me/${WA}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#22c55e', color: '#ffffff', fontWeight: 600, fontSize: 13, padding: '10px 18px', borderRadius: 8, textDecoration: 'none' }}>
                      <MessageCircle size={14} /> WhatsApp
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── PAGE BODY ────────────────────────────────────────────────────── */}
        <div style={{ background: '#f8fafc', minHeight: '60vh' }}>
          <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>

            {/* ── VEHICLE PRICING ─────────────────────────────────────────── */}
            {fares.length > 0 && (
              <section style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 28 }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: 0 }}>Vehicle Options &amp; Pricing</h2>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        {['Vehicle', 'Passengers', 'One-Way Fare', 'Round Trip', ''].map(h => (
                          <th key={h} style={{ padding: '11px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {fares.map((fare, idx) => (
                        <tr key={fare.vehicleId} style={{ borderBottom: idx < fares.length - 1 ? '1px solid #f1f5f9' : 'none', background: '#ffffff' }}>
                          <td style={{ padding: '16px 20px', fontWeight: 600, color: '#0f172a' }}>{fare.vehicleName}</td>
                          <td style={{ padding: '16px 20px', color: '#64748b' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Users size={14} style={{ color: '#94a3b8' }} />
                              {capacityFor(fare.vehicleName)}
                            </span>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            {fare.oneWayFare != null
                              ? <span style={{ fontWeight: 700, fontSize: 16, color: '#0f172a' }}>₹{fare.oneWayFare.toLocaleString('en-IN')}</span>
                              : <span style={{ color: '#94a3b8', fontSize: 12 }}>Call for fare</span>}
                          </td>
                          <td style={{ padding: '16px 20px', color: '#64748b' }}>
                            {fare.roundTripFare != null ? `₹${fare.roundTripFare.toLocaleString('en-IN')}` : '—'}
                          </td>
                          <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                            <a href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hello! I want to book ${fare.vehicleName} from ${o.name} to ${d.name}.`)}`}
                              target="_blank" rel="noopener noreferrer"
                              style={{ display: 'inline-block', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', fontWeight: 600, fontSize: 12, padding: '6px 14px', borderRadius: 8, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                              Book
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* ── ROUTE INFO + DESCRIPTION ────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 28, marginBottom: 28 }}>

              {/* Two column on lg */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>

                {/* Route Info */}
                <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '0 0 18px' }}>Route Details</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {[
                      { label: 'From', value: o.name },
                      { label: 'To', value: d.name },
                      ...(distanceKm ? [{ label: 'Distance', value: `${distanceKm} km` }] : []),
                      ...(estimatedHours ? [{ label: 'Duration', value: `~${estimatedHours} hrs` }] : []),
                      { label: 'Trip Type', value: 'One Way', green: true },
                      ...(cheapestFare ? [{ label: 'Fare from', value: `₹${cheapestFare.toLocaleString('en-IN')}`, bold: true }] : []),
                    ].map((row, i, arr) => (
                      <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                        <span style={{ fontSize: 13, color: '#64748b' }}>{row.label}</span>
                        <span style={{ fontSize: 13, fontWeight: (row as { bold?: boolean }).bold ? 700 : 600, color: (row as { green?: boolean }).green ? '#16a34a' : '#0f172a' }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
                  <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: '0 0 14px' }}>
                    {o.name} to {d.name} — Cab Service
                  </h2>
                  <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.8, margin: 0 }}>{routeDesc}</p>
                </div>
              </div>
            </div>

            {/* ── WHY CHOOSE US ─────────────────────────────────────────────── */}
            <section style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 28, marginBottom: 28 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '0 0 22px' }}>
                Why Book {o.name} to {d.name} Taxi with Us
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                {content.whyChooseUs.map(item => (
                  <div key={item.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: 16, background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
                    <div style={{ width: 34, height: 34, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                      <CheckCircle size={16} style={{ color: '#2563eb' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: '0 0 5px' }}>{item.title}</p>
                      <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ── TRAVEL TIPS ───────────────────────────────────────────────── */}
            <section style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 28, marginBottom: 28 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '0 0 14px' }}>
                Travel Tips — {o.name} to {d.name}
              </h2>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.8, margin: '0 0 22px' }}>{content.travelGuide}</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                {[
                  { title: 'Before Your Journey', items: ['Book in advance to confirm your vehicle and driver.', 'Share your pickup address clearly when booking.', `Save our number: ${PHONE}`] },
                  { title: 'During Your Journey', items: ['All vehicles are air-conditioned and regularly serviced.', 'Your driver holds a valid licence and vehicle documents.', 'Our team is available 24/7 if you need assistance.'] },
                ].map(s => (
                  <div key={s.title} style={{ background: '#f8fafc', borderRadius: 10, padding: 18, border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: '0 0 14px' }}>{s.title}</p>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {s.items.map(item => (
                        <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                          <CheckCircle size={14} style={{ color: '#22c55e', marginTop: 2, flexShrink: 0 }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            {/* ── MORE ROUTES ───────────────────────────────────────────────── */}
            {relatedRoutes.length > 0 && (
              <section style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 28, marginBottom: 28 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: '#0f172a', margin: '0 0 18px' }}>
                  More Cabs from {o.name}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
                  {relatedRoutes.map(r => (
                    <Link key={r.id} href={`/routes/${r.slug}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500, color: '#334155', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', textDecoration: 'none' }}>
                      <ArrowRight size={13} style={{ color: '#94a3b8', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.destinationCity.name}</span>
                    </Link>
                  ))}
                </div>
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                  <Link href={`/routes/city/${o.slug}`}
                    style={{ fontSize: 13, fontWeight: 600, color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    View all {o.name} routes <ArrowRight size={13} />
                  </Link>
                </div>
              </section>
            )}

            {/* ── DESTINATION TAGS ──────────────────────────────────────────── */}
            {relatedRoutes.length > 0 && (
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 10px' }}>Other destinations from {o.name}:</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {relatedRoutes.map(r => (
                    <Link key={r.id} href={`/routes/${r.slug}`}
                      style={{ fontSize: 12, fontWeight: 500, color: '#475569', background: '#ffffff', border: '1px solid #e2e8f0', padding: '6px 14px', borderRadius: 20, textDecoration: 'none' }}>
                      {o.name} → {r.destinationCity.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* ── BOTTOM CTA ────────────────────────────────────────────────── */}
            <section style={{ background: '#0a1628', borderRadius: 12, padding: 28 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', margin: '0 0 6px' }}>
                    Book {o.name} to {d.name} Taxi
                  </h2>
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                    Fixed price · Verified driver · Instant confirmation
                    {cheapestFare ? ` · From ₹${cheapestFare.toLocaleString('en-IN')}` : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  <Link href="/contact#enquiry"
                    style={{ background: '#f59e0b', color: '#0a1628', fontWeight: 700, fontSize: 13, padding: '10px 20px', borderRadius: 8, textDecoration: 'none' }}>
                    Book Now
                  </Link>
                  <a href={`tel:${PHONE.replace(/\s/g, '')}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', color: '#ffffff', fontWeight: 500, fontSize: 13, padding: '10px 16px', borderRadius: 8, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Phone size={13} /> {PHONE}
                  </a>
                  <a href={`https://wa.me/${WA}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#22c55e', color: '#ffffff', fontWeight: 500, fontSize: 13, padding: '10px 16px', borderRadius: 8, textDecoration: 'none' }}>
                    <MessageCircle size={13} /> WhatsApp
                  </a>
                </div>
              </div>
            </section>

            <div style={{ textAlign: 'center', paddingTop: 24, paddingBottom: 8 }}>
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
