'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, ArrowRight, MessageCircle, Compass } from 'lucide-react'

interface Place {
  id: number
  name: string
  slug: string
  shortDescription: string | null
  featuredImage: string | null
  cityName: string | null
  category: { name: string; icon: string | null; slug: string } | null
  state: { name: string; slug: string }
  district: { name: string; slug: string } | null
}

interface Category {
  id: number
  name: string
  slug: string
  icon: string | null
  placeCount: number
}

interface Props {
  featuredPlaces: Place[]
  categories: Category[]
}

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832'

const REGION_STATES = [
  { label: 'Gujarat', slug: 'gujarat', places: 'Statue of Unity, Dwarka, Rann of Kutch' },
  { label: 'Rajasthan', slug: 'rajasthan', places: 'Jaipur, Udaipur, Jaisalmer' },
  { label: 'Delhi', slug: 'delhi', places: 'India Gate, Red Fort, Qutub Minar' },
  { label: 'Himachal Pradesh', slug: 'himachal-pradesh', places: 'Shimla, Manali, Dharamshala' },
  { label: 'Kerala', slug: 'kerala', places: 'Munnar, Alleppey, Kovalam' },
  { label: 'Uttar Pradesh', slug: 'uttar-pradesh', places: 'Taj Mahal, Varanasi, Mathura' },
  { label: 'Karnataka', slug: 'karnataka', places: 'Mysore, Coorg, Hampi' },
  { label: 'Goa', slug: 'goa', places: 'Beaches, Churches, Spice Plantations' },
]

function PlaceCard({ place }: { place: Place }) {
  const href = `/explore-india/${place.state.slug}/${place.district?.slug ?? '_'}/${place.slug}`
  return (
    <Link href={href}
      style={{
        display: 'block', textDecoration: 'none',
        background: '#ffffff', borderRadius: 14,
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, transform 0.2s',
        boxShadow: '0 2px 8px rgba(10,22,40,0.06)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.boxShadow = '0 8px 28px rgba(10,22,40,0.14)'
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLAnchorElement
        el.style.boxShadow = '0 2px 8px rgba(10,22,40,0.06)'
        el.style.transform = 'translateY(0)'
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: 180, background: '#e8edf5', overflow: 'hidden' }}>
        {place.featuredImage ? (
          <Image
            src={place.featuredImage}
            alt={place.name}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 48 }}>
            {place.category?.icon ?? '🏛️'}
          </div>
        )}
        {/* Category badge */}
        {place.category && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: 'rgba(10,22,40,0.75)',
            color: '#fff', fontSize: 11, fontWeight: 600,
            padding: '3px 10px', borderRadius: 50,
            backdropFilter: 'blur(4px)',
          }}>
            {place.category.icon} {place.category.name}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '14px 16px' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0a1628', margin: '0 0 5px', lineHeight: 1.3 }}>{place.name}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b', marginBottom: 8 }}>
          <MapPin size={11} />
          {place.cityName ? `${place.cityName}, ` : ''}{place.state.name}
        </div>
        {place.shortDescription && (
          <p style={{ fontSize: 12, color: '#64748b', margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {place.shortDescription}
          </p>
        )}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#08A9EE' }}>
          View Details <ArrowRight size={12} />
        </div>
      </div>
    </Link>
  )
}

export default function ExploreIndiaSection({ featuredPlaces, categories }: Props) {
  const waMsg = encodeURIComponent('Hello Radhe Krishna Cabs! I want to plan a tourist trip across India. Please share taxi options and fares.')

  return (
    <section style={{ background: '#f8fafc', padding: '72px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>

        {/* ── Section header ────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#EAF6FF', border: '1px solid rgba(8,169,238,0.2)',
            color: '#08A9EE', fontSize: 11, fontWeight: 700,
            padding: '5px 14px', borderRadius: 50, marginBottom: 14,
            letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            <Compass size={13} /> Explore Incredible India
          </div>

          <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', fontWeight: 800, color: '#0a1628', margin: '0 0 12px', lineHeight: 1.2 }}>
            Discover Amazing Tourist Places
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', maxWidth: 560, margin: '0 auto 8px', lineHeight: 1.75 }}>
            Explore temples, beaches, hill stations, historical landmarks, wildlife destinations, waterfalls,
            and unforgettable family travel experiences across India.
          </p>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
            Radhe Krishna Cabs &amp; Taxi Service — your trusted travel partner across India.
          </p>
        </div>

        {/* ── Categories strip ──────────────────────────────────────── */}
        {categories.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 48 }}>
            {categories.slice(0, 8).map(cat => (
              <Link key={cat.slug} href={`/explore-india?category=${cat.slug}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: '#ffffff', border: '1px solid #e2e8f0',
                  color: '#334155', fontSize: 13, fontWeight: 500,
                  padding: '7px 16px', borderRadius: 50, textDecoration: 'none',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#0a1628'; (e.currentTarget as HTMLAnchorElement).style.color = '#ffffff'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#0a1628' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#ffffff'; (e.currentTarget as HTMLAnchorElement).style.color = '#334155'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e2e8f0' }}
              >
                <span>{cat.icon}</span>
                {cat.name}
                {cat.placeCount > 0 && (
                  <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 50 }}>
                    {cat.placeCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* ── India map + featured places ───────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>

          {/* Map visual + state browser */}
          <div style={{ background: '#ffffff', borderRadius: 20, border: '1px solid #e2e8f0', padding: 28, boxShadow: '0 2px 12px rgba(10,22,40,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #FF6B35, #FF9F1C)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                🗺️
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0a1628', margin: 0 }}>Browse by State / Region</h3>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Select a state to explore its tourist destinations</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {REGION_STATES.map(s => (
                <Link key={s.slug} href={`/explore-india?state=${s.slug}`}
                  style={{
                    display: 'block', textDecoration: 'none',
                    background: '#f8fafc', border: '1px solid #e2e8f0',
                    borderRadius: 10, padding: '12px 14px',
                    transition: 'background 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = '#eff6ff'; el.style.borderColor = '#bfdbfe' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.background = '#f8fafc'; el.style.borderColor = '#e2e8f0' }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0a1628', marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>{s.places}</div>
                </Link>
              ))}
            </div>

            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <Link href="/explore-india"
                style={{ fontSize: 13, color: '#08A9EE', fontWeight: 600, textDecoration: 'none' }}>
                View interactive map &amp; all states →
              </Link>
            </div>
          </div>

          {/* Featured destination cards */}
          {featuredPlaces.length > 0 && (
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0a1628', margin: '0 0 18px' }}>
                Featured Destinations
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 }}>
                {featuredPlaces.map(p => <PlaceCard key={p.id} place={p} />)}
              </div>
            </div>
          )}

          {featuredPlaces.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#ffffff', borderRadius: 16, border: '1px dashed #e2e8f0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏛️</div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#475569', margin: '0 0 8px' }}>Destinations Coming Soon</h3>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>
                Tourist destinations are being added. Explore all available destinations on the full page.
              </p>
            </div>
          )}
        </div>

        {/* ── Bottom CTAs ───────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginTop: 40 }}>
          <Link href="/explore-india"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#0a1628', color: '#ffffff',
              fontWeight: 700, fontSize: 14,
              padding: '13px 28px', borderRadius: 50,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(10,22,40,0.25)',
            }}>
            <Compass size={16} /> Explore All Destinations
          </Link>
          <a href={`https://wa.me/${WA}?text=${waMsg}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#22c55e', color: '#ffffff',
              fontWeight: 700, fontSize: 14,
              padding: '13px 28px', borderRadius: 50,
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(34,197,94,0.3)',
            }}>
            <MessageCircle size={16} /> Plan Your Trip on WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
