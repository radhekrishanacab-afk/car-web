'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, MapPin, MessageCircle, ArrowRight, X, ChevronRight } from 'lucide-react'

interface PlaceCard {
  id: number; name: string; slug: string
  shortDescription: string | null; featuredImage: string | null; cityName: string | null
  latitude: number | null; longitude: number | null
  category: { name: string; icon: string | null; slug: string } | null
  state: { name: string; slug: string }
  district: { name: string; slug: string } | null
}
interface StateItem { id: number; name: string; slug: string; code: string; region: string; placeCount: number; latitude: number | null; longitude: number | null }
interface CategoryItem { id: number; name: string; slug: string; icon: string; placeCount: number }

interface Props {
  places: PlaceCard[]; total: number; page: number; pages: number
  states: StateItem[]; categories: CategoryItem[]
  mapPlaces: unknown[]
  initialState: string; initialCategory: string; initialSearch: string
}

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832'

function buildHref(place: PlaceCard) {
  return `/explore-india/${place.state.slug}/${place.district?.slug ?? '_'}/${place.slug}`
}

export default function ExploreIndiaClient({ places, total, page, pages, states, categories, initialState, initialCategory, initialSearch }: Props) {
  const router = useRouter()
  const [search, setSearch]     = useState(initialSearch)
  const [selState, setSelState] = useState(initialState)
  const [selCat,   setSelCat]   = useState(initialCategory)

  const go = (overrides: Record<string, string>) => {
    const params = new URLSearchParams()
    const merged = { state: selState, category: selCat, search, page: '1', ...overrides }
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v) })
    router.push(`/explore-india${params.toString() ? '?' + params.toString() : ''}`)
  }

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); go({ search }) }
  const clearAll = () => { setSearch(''); setSelState(''); setSelCat(''); router.push('/explore-india') }

  const hasFilters = !!(selState || selCat || search)
  const selStateName = states.find(s => s.slug === selState)?.name

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(135deg,#0a1628 0%,#0f2044 55%,#1a3a6b 100%)', color: '#fff', padding: '52px 20px 40px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <nav style={{ fontSize: 12, color: '#94a3b8', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={12} />
            {selStateName ? (
              <>
                <Link href="/explore-india" style={{ color: '#94a3b8', textDecoration: 'none' }}>Tourist Places</Link>
                <ChevronRight size={12} />
                <span style={{ color: '#e2e8f0' }}>{selStateName}</span>
              </>
            ) : (
              <span style={{ color: '#e2e8f0' }}>Tourist Places</span>
            )}
          </nav>

          <h1 style={{ fontSize: 'clamp(1.75rem,4vw,2.75rem)', fontWeight: 800, margin: '0 0 10px', lineHeight: 1.2 }}>
            Explore Tourist <span style={{ color: '#f59e0b' }}>Places</span>
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', margin: '0 0 24px', lineHeight: 1.7 }}>
            Discover amazing destinations across India. Book a taxi with Radhe Krishna Cab for your trip.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: 'flex', maxWidth: 520, gap: 0 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search destinations, cities…"
                style={{ width: '100%', padding: '12px 12px 12px 34px', borderRadius: '9px 0 0 9px', border: 'none', fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#0f172a' }} />
            </div>
            <button type="submit" style={{ background: '#f59e0b', color: '#0a1628', fontWeight: 700, fontSize: 13, padding: '0 20px', borderRadius: '0 9px 9px 0', border: 'none', cursor: 'pointer' }}>Search</button>
          </form>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 16px' }}>

        {/* Filter bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <p style={{ fontSize: 13, color: '#64748b', margin: 0, flex: 1, minWidth: 100 }}>
            <strong style={{ color: '#0f172a' }}>{total}</strong> destination{total !== 1 ? 's' : ''}
            {selStateName && <> in <strong style={{ color: '#0a1628' }}>{selStateName}</strong></>}
          </p>

          <select value={selState} onChange={e => { setSelState(e.target.value); go({ state: e.target.value }) }}
            style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#fff', color: '#0f172a', outline: 'none', cursor: 'pointer' }}>
            <option value="">All States</option>
            {states.map(s => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>

          <select value={selCat} onChange={e => { setSelCat(e.target.value); go({ category: e.target.value }) }}
            style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, background: '#fff', color: '#0f172a', outline: 'none', cursor: 'pointer' }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.slug} value={c.slug}>{c.icon} {c.name}</option>)}
          </select>

          {hasFilters && (
            <button onClick={clearAll} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {[{ slug: '', name: 'All', icon: '🗺️' }, ...categories.filter(c => c.placeCount > 0)].map(cat => (
            <button key={cat.slug} onClick={() => { setSelCat(cat.slug); go({ category: cat.slug }) }}
              style={{ padding: '5px 14px', borderRadius: 50, fontSize: 12, fontWeight: 500, border: '1px solid', borderColor: selCat === cat.slug ? '#0a1628' : '#e2e8f0', background: selCat === cat.slug ? '#0a1628' : '#fff', color: selCat === cat.slug ? '#fff' : '#374151', cursor: 'pointer' }}>
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        {places.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 20px', background: '#fff', borderRadius: 16, border: '1px dashed #e2e8f0' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#475569', margin: '0 0 8px' }}>No destinations found</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 16px' }}>
              {hasFilters ? 'Try adjusting your filters.' : 'Destinations will appear here once published.'}
            </p>
            {hasFilters && <button onClick={clearAll} style={{ background: '#0a1628', color: '#fff', fontWeight: 600, fontSize: 13, padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>Clear Filters</button>}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 20 }}>
              {places.map(place => (
                <div key={place.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(10,22,40,.05)', display: 'flex', flexDirection: 'column' }}>
                  {/* Image */}
                  <div style={{ position: 'relative', height: 185, background: '#e8edf5', flexShrink: 0 }}>
                    {place.featuredImage
                      ? <Image src={place.featuredImage} alt={place.name} fill sizes="300px" style={{ objectFit: 'cover' }} />
                      : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 52 }}>{place.category?.icon ?? '🏛️'}</div>
                    }
                    {place.category && (
                      <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(10,22,40,.75)', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 50 }}>
                        {place.category.icon} {place.category.name}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0a1628', margin: '0 0 5px', lineHeight: 1.3 }}>{place.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                      <MapPin size={11} />{place.cityName ? `${place.cityName}, ` : ''}{place.state.name}
                    </div>
                    {place.shortDescription && (
                      <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 12px', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                        {place.shortDescription}
                      </p>
                    )}

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 'auto' }}>
                      <Link href={buildHref(place)}
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, background: '#f1f5f9', color: '#0a1628', fontSize: 12, fontWeight: 600, padding: '8px 10px', borderRadius: 8, textDecoration: 'none', border: '1px solid #e2e8f0' }}>
                        <ArrowRight size={12} /> View Details
                      </Link>
                      <a href={`https://wa.me/${WA}?text=${encodeURIComponent(`Hello! I want to visit ${place.name}${place.cityName ? ` in ${place.cityName}` : ''}, ${place.state.name}. Please share taxi options and fares.`)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, background: '#22c55e', color: '#ffffff', fontSize: 12, fontWeight: 700, padding: '8px 10px', borderRadius: 8, textDecoration: 'none', boxShadow: '0 2px 8px rgba(34,197,94,0.25)' }}>
                        <MessageCircle size={12} /> Book Taxi
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: 12 }}>
                <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Showing <strong>{(page-1)*12+1}–{Math.min(page*12,total)}</strong> of <strong>{total}</strong></p>
                <div style={{ display: 'flex', gap: 6 }}>
                  {page > 1 && <Link href={`/explore-india?${new URLSearchParams({ ...(selState && { state: selState }), ...(selCat && { category: selCat }), ...(search && { search }), page: String(page-1) })}`} style={{ padding: '7px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#374151', textDecoration: 'none', background: '#fff' }}>← Prev</Link>}
                  {Array.from({ length: Math.min(pages, 5) }, (_, i) => { const p2 = page <= 3 ? i+1 : page-2+i; if (p2 < 1 || p2 > pages) return null; return <Link key={p2} href={`/explore-india?${new URLSearchParams({ ...(selState && { state: selState }), ...(selCat && { category: selCat }), ...(search && { search }), page: String(p2) })}`} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', background: p2 === page ? '#0a1628' : '#fff', color: p2 === page ? '#fff' : '#64748b', border: `1px solid ${p2 === page ? '#0a1628' : '#e2e8f0'}` }}>{p2}</Link> })}
                  {page < pages && <Link href={`/explore-india?${new URLSearchParams({ ...(selState && { state: selState }), ...(selCat && { category: selCat }), ...(search && { search }), page: String(page+1) })}`} style={{ padding: '7px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#374151', textDecoration: 'none', background: '#fff' }}>Next →</Link>}
                </div>
              </div>
            )}
          </>
        )}

        {/* Bottom CTA */}
        <div style={{ background: '#0a1628', borderRadius: 16, padding: '28px 24px', marginTop: 40, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', margin: '0 0 5px' }}>Plan Your Trip with Radhe Krishna Cab</h3>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Get taxi quotes for any tourist destination. Available 24/7.</p>
          </div>
          <a href={`https://wa.me/${WA}?text=${encodeURIComponent('Hello Radhe Krishna Cabs! I want to plan a tourist trip. Please share taxi options and fares.')}`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#22c55e', color: '#fff', fontWeight: 700, fontSize: 13, padding: '12px 22px', borderRadius: 50, textDecoration: 'none' }}>
            <MessageCircle size={15} /> WhatsApp for Taxi Quotes
          </a>
        </div>
      </div>
    </div>
  )
}
