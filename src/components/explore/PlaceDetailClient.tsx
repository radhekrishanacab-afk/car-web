'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { MapPin, Clock, IndianRupee, Calendar, ChevronRight, Phone, MessageCircle, ArrowLeft, Navigation } from 'lucide-react'

const SinglePlaceMap = dynamic(() => import('./SinglePlaceMap'), { ssr: false, loading: () => <div style={{ height: 260, background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#94a3b8' }}>Loading map…</div> })

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832'
const PHONE = '+91 97230 97832'

interface Place {
  id: number; name: string; slug: string
  shortDescription: string | null; description: string | null
  featuredImage: string | null; address: string | null
  latitude: number | null; longitude: number | null; cityName: string | null
  visitingHours: string | null; entryFee: string | null
  bestTimeToVisit: string | null; visitDuration: string | null; tags: string | null
  seoTitle: string | null
  category: { name: string; icon: string | null; slug: string } | null
  state: { name: string; slug: string }
  district: { name: string; slug: string } | null
}

export default function PlaceDetailClient({ place, stateSlug }: { place: Place; stateSlug: string }) {
  const waMsg = encodeURIComponent(
    `Hello Radhe Krishna Cabs & Taxi Service,\n\nI would like to enquire about a taxi for visiting:\n\nDestination: ${place.name}\nCity/Area: ${place.cityName ?? 'N/A'}\nDistrict: ${place.district?.name ?? 'N/A'}\nState: ${place.state.name}\n\nPlease share available taxi options and fares.\n\nThank you.`
  )
  const mapsLink = place.latitude && place.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`
    : `https://www.google.com/maps/search/${encodeURIComponent(`${place.name} ${place.cityName ?? ''} ${place.state.name}`)}`

  return (
    <div style={{ minHeight: '80vh', background: '#f8fafc' }}>
      {/* Hero */}
      <div style={{ background: '#0a1628', color: '#fff', padding: '40px 20px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#94a3b8', marginBottom: 18, flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={11} />
            <Link href="/explore-india" style={{ color: '#94a3b8', textDecoration: 'none' }}>Explore India</Link>
            <ChevronRight size={11} />
            <Link href={`/explore-india?state=${place.state.slug}`} style={{ color: '#94a3b8', textDecoration: 'none' }}>{place.state.name}</Link>
            <ChevronRight size={11} />
            <span style={{ color: '#e2e8f0' }}>{place.name}</span>
          </nav>
          <Link href="/explore-india" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94a3b8', textDecoration: 'none', marginBottom: 14 }}>
            <ArrowLeft size={13} /> Back to Explore India
          </Link>
          <h1 style={{ fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: 800, margin: '0 0 10px', lineHeight: 1.2 }}>
            {place.category?.icon} {place.name}
          </h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', fontSize: 13, color: '#94a3b8' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <MapPin size={13} />{place.cityName ? `${place.cityName}, ` : ''}{place.district ? `${place.district.name}, ` : ''}{place.state.name}
            </span>
            {place.category && (
              <span style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 50 }}>
                {place.category.icon} {place.category.name}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px' }}>
        {place.featuredImage && (
          <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 24, height: 340 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={place.featuredImage} alt={place.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, marginBottom: 20 }}>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0a1628', margin: '0 0 12px' }}>About {place.name}</h2>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.8, margin: 0 }}>{place.description || place.shortDescription || 'No description available.'}</p>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0a1628', margin: '0 0 16px' }}>Visit Information</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {([
                { icon: MapPin, label: 'Location', value: `${place.cityName ?? ''}${place.cityName && place.district ? ', ' : ''}${place.district?.name ?? ''}, ${place.state.name}` },
                { icon: Clock, label: 'Visiting Hours', value: place.visitingHours },
                { icon: IndianRupee, label: 'Entry Fee', value: place.entryFee },
                { icon: Calendar, label: 'Best Time', value: place.bestTimeToVisit },
                { icon: Navigation, label: 'Duration', value: place.visitDuration },
              ] as const).filter(r => r.value).map((row, i, arr) => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '11px 0', borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#64748b', fontSize: 13, flexShrink: 0 }}>
                    <row.icon size={13} /> {row.label}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#0a1628', textAlign: 'right', maxWidth: 200 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {place.latitude && place.longitude && (
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0a1628', margin: 0 }}>Location on Map</h2>
            </div>
            <SinglePlaceMap lat={place.latitude} lng={place.longitude} name={place.name} icon={place.category?.icon ?? '🏛️'} />
          </div>
        )}

        <div style={{ background: '#0a1628', borderRadius: 14, padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: '0 0 5px' }}>Plan Your Visit to {place.name}</h2>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 18px' }}>Book a taxi from anywhere in India with Radhe Krishna Cabs.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <a href={`https://wa.me/${WA}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#22c55e', color: '#fff', fontWeight: 700, fontSize: 13, padding: '12px 16px', borderRadius: 50, textDecoration: 'none' }}>
              <MessageCircle size={14} /> Enquire on WhatsApp
            </a>
            <a href={`tel:${PHONE.replace(/\s/g,'')}`}
              style={{ flex: 1, minWidth: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: '#fff', color: '#0a1628', fontWeight: 700, fontSize: 13, padding: '12px 16px', borderRadius: 50, textDecoration: 'none' }}>
              <Phone size={14} /> Call Now
            </a>
            <a href={mapsLink} target="_blank" rel="noopener noreferrer"
              style={{ flex: 1, minWidth: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'rgba(255,255,255,0.1)', color: '#fff', fontWeight: 600, fontSize: 13, padding: '12px 16px', borderRadius: 50, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)' }}>
              <Navigation size={14} /> Get Directions
            </a>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href={`/explore-india?state=${stateSlug}`} style={{ fontSize: 13, color: '#08A9EE', textDecoration: 'none', fontWeight: 500 }}>
            ← Back to {place.state.name} destinations
          </Link>
        </div>
      </div>
    </div>
  )
}
