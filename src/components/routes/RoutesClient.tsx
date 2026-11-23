'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, MapPin, ArrowRight, Phone, MessageCircle, Route as RouteIcon, LoaderCircle } from 'lucide-react'
import { buildWAUrl, buildGeneralEnquiryMessage } from '@/lib/whatsapp'

interface City {
  id: number
  name: string
  slug: string
  routeCount: number
}

interface Props {
  cities: City[]
  popularCities: City[]
  total: number
  page: number
  pages: number
  initialSearch?: string
}

interface SearchSuggestion {
  type: 'city' | 'route'
  label: string
  detail: string
  href: string
  fare?: number | null
}

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832'
const WA_URL = buildWAUrl(
  buildGeneralEnquiryMessage({ sourcePage: 'Routes Page', pageUrl: 'https://radhekrishanacab.com/routes' }),
  WA,
)

export default function RoutesClient({ cities, popularCities, total, page, pages, initialSearch = '' }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState(initialSearch)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [suggestionsFor, setSuggestionsFor] = useState('')
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [activeSuggestion, setActiveSuggestion] = useState(-1)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  useEffect(() => {
    const query = search.trim()
    if (query.length < 2) return

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoadingSuggestions(true)
      try {
        const response = await fetch(`/api/public/routes/suggestions?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
          cache: 'no-store',
        })
        const data = await response.json()
        if (!controller.signal.aborted) {
          setSuggestions(data.suggestions ?? [])
          setSuggestionsFor(query)
          setActiveSuggestion(-1)
        }
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([])
          setSuggestionsFor(query)
        }
      } finally {
        if (!controller.signal.aborted) setLoadingSuggestions(false)
      }
    }, 220)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [search])

  const goToSuggestion = (items: SearchSuggestion[], selectedIndex = activeSuggestion) => {
    const selected = items[selectedIndex] ?? items[0]
    const query = search.trim()
    setSuggestionsOpen(false)
    if (selected) {
      router.push(selected.href)
    } else {
      router.push(query ? `/routes?search=${encodeURIComponent(query)}&page=1` : '/routes')
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const q = search.trim()
    if (!q) {
      router.push('/routes')
      return
    }

    if (suggestionsFor === q) {
      goToSuggestion(suggestions)
      return
    }

    try {
      const response = await fetch(`/api/public/routes/suggestions?q=${encodeURIComponent(q)}`, { cache: 'no-store' })
      const data = await response.json()
      goToSuggestion(data.suggestions ?? [])
    } catch {
      router.push(`/routes?search=${encodeURIComponent(q)}&page=1`)
    }
  }

  const handleSuggestionKeys = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setSuggestionsOpen(false)
      setActiveSuggestion(-1)
      return
    }

    if (!suggestionsOpen || suggestions.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveSuggestion((current) => (current + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveSuggestion((current) => current <= 0 ? suggestions.length - 1 : current - 1)
    } else if (e.key === 'Enter' && activeSuggestion >= 0) {
      e.preventDefault()
      goToSuggestion(suggestions)
    }
  }

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0f1e3d 0%, #1a3a6b 55%, #0d1f3c 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, right: 0, pointerEvents: 'none',
          width: 480, height: 480,
          background: 'radial-gradient(circle at 80% 20%, rgba(8,169,238,0.13), transparent 60%)',
        }} />
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '54px 16px 48px', textAlign: 'center', position: 'relative' }}>

          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', fontWeight: 800, color: '#ffffff', margin: '0 0 12px', lineHeight: 1.25 }}>
            Find Your <span style={{ color: '#08a9ee' }}>One-Way Taxi</span> Route
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', margin: '0 0 32px', lineHeight: 1.6 }}>
            Transparent fixed fares. Verified drivers. Well-maintained vehicles.<br />
            Book your intercity cab in minutes.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 140)}
            style={{ maxWidth: 560, margin: '0 auto', position: 'relative', display: 'flex', gap: 0, zIndex: 10 }}
          >
            <div style={{ position: 'relative', flex: '1 1 auto', minWidth: 0 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
              <input
                type="text"
                value={search}
                onChange={e => {
                  const value = e.target.value
                  setSearch(value)
                  setSuggestionsOpen(true)
                  if (value.trim().length < 2) {
                    setSuggestions([])
                    setSuggestionsFor('')
                    setLoadingSuggestions(false)
                    setActiveSuggestion(-1)
                  }
                }}
                onFocus={() => setSuggestionsOpen(true)}
                onKeyDown={handleSuggestionKeys}
                role="combobox"
                aria-autocomplete="list"
                aria-expanded={suggestionsOpen && search.trim().length >= 2}
                aria-controls="route-search-suggestions"
                aria-activedescendant={activeSuggestion >= 0 ? `route-suggestion-${activeSuggestion}` : undefined}
                autoComplete="off"
                placeholder="Search city or route"
                style={{ width: '100%', padding: '13px 14px 13px 40px', borderRadius: '10px 0 0 10px', border: 'none', fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#ffffff', color: '#0f172a' }}
              />
            </div>
            <button type="submit"
              className="route-search-btn"
              style={{ background: '#08a9ee', color: '#ffffff', fontWeight: 700, fontSize: 14, padding: '0 26px', borderRadius: '0 10px 10px 0', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <Search size={16} />
              <span className="route-search-btn-text">Search</span>
            </button>
            {suggestionsOpen && search.trim().length >= 2 && (
              <div
                id="route-search-suggestions"
                role="listbox"
                aria-label="City and route suggestions"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                  borderRadius: 12,
                  background: '#ffffff',
                  boxShadow: '0 16px 36px rgba(10,22,40,.2)',
                  textAlign: 'left',
                }}
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    id={`route-suggestion-${index}`}
                    key={`${suggestion.type}-${suggestion.href}`}
                    type="button"
                    role="option"
                    aria-selected={activeSuggestion === index}
                    onMouseDown={e => e.preventDefault()}
                    onMouseEnter={() => setActiveSuggestion(index)}
                    onClick={() => goToSuggestion(suggestions, index)}
                    style={{
                      display: 'flex',
                      width: '100%',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 16px',
                      border: 0,
                      borderBottom: index < suggestions.length - 1 ? '1px solid #f1f5f9' : 0,
                      background: activeSuggestion === index ? '#f0f7ff' : '#ffffff',
                      color: '#0f172a',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ display: 'grid', width: 34, height: 34, flexShrink: 0, placeItems: 'center', borderRadius: 10, background: suggestion.type === 'route' ? '#eaf6ff' : '#f8fafc', color: '#08a9ee' }}>
                      {suggestion.type === 'route' ? <RouteIcon size={17} /> : <MapPin size={17} />}
                    </span>
                    <span style={{ display: 'block', minWidth: 0, flex: 1 }}>
                      <span style={{ display: 'block', overflow: 'hidden', fontSize: 14, fontWeight: 700, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {suggestion.label}
                      </span>
                      <span style={{ display: 'block', marginTop: 2, color: '#64748b', fontSize: 12 }}>
                        {suggestion.detail}
                      </span>
                    </span>
                    <ArrowRight size={15} style={{ flexShrink: 0, color: '#94a3b8' }} />
                  </button>
                ))}
                {loadingSuggestions && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '14px 16px', color: '#64748b', fontSize: 13 }}>
                    <LoaderCircle size={16} className="animate-spin" /> Finding matching cities and routes…
                  </div>
                )}
                {!loadingSuggestions && suggestions.length === 0 && suggestionsFor === search.trim() && (
                  <div style={{ padding: '14px 16px', color: '#64748b', fontSize: 13 }}>
                    No close matches yet. Try a shorter city name or check the spelling.
                  </div>
                )}
              </div>
            )}
          </form>
          {search && (
            <button type="button" onClick={() => { setSearch(''); setSuggestions([]); setSuggestionsOpen(false); router.push('/routes') }}
              style={{ marginTop: 10, background: 'none', border: 'none', color: '#64748b', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>
              Clear search
            </button>
          )}

          {/* Stats */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px 48px', marginTop: 40 }}>
            {[
              { n: '115+', label: 'Cities Covered' },
              { n: '13,000+', label: 'Active Routes' },
              { n: '4', label: 'Vehicle Types' },
              { n: '24/7', label: 'Support' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PAGE BODY ─────────────────────────────────────────────────────── */}
      <div style={{ background: '#f8fafc' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>

          {/* ── POPULAR CITIES ─────────────────────────────────────────────── */}
          {!initialSearch && popularCities.length > 0 && (
            <section style={{ marginBottom: 44 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'inline-block', width: 4, height: 20, background: '#08a9ee', borderRadius: 2 }} />
                Popular Pickup Cities
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
                {popularCities.map(city => (
                  <Link key={city.id} href={`/routes/city/${city.slug}`}
                    style={{ display: 'block', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 20px', textDecoration: 'none', transition: 'box-shadow 0.15s, border-color 0.15s' }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLAnchorElement
                      el.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'
                      el.style.borderColor = '#cbd5e1'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLAnchorElement
                      el.style.boxShadow = 'none'
                      el.style.borderColor = '#e2e8f0'
                    }}
                  >
                    <div style={{ width: 36, height: 36, background: '#eff6ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                      <MapPin size={18} style={{ color: '#2563eb' }} />
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{city.name}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 12px' }}>
                      {city.routeCount > 0 ? `${city.routeCount} routes` : 'View routes'}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: '#2563eb' }}>
                      View Routes <ArrowRight size={12} />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── ALL CITIES ─────────────────────────────────────────────────── */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ display: 'inline-block', width: 4, height: 20, background: '#0a1628', borderRadius: 2 }} />
                {initialSearch ? `Results for "${initialSearch}"` : 'All Pickup Cities'}
                <span style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', background: '#f1f5f9', padding: '2px 10px', borderRadius: 20 }}>{total}</span>
              </h2>
              {initialSearch && (
                <Link href="/routes" style={{ fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>
                  ← View all cities
                </Link>
              )}
            </div>

            {cities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '64px 24px', background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                <MapPin size={40} style={{ color: '#e2e8f0', margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#475569', margin: '0 0 8px' }}>No cities found</h3>
                <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 20px' }}>
                  {initialSearch
                    ? `No city matches "${initialSearch}". Try a different spelling.`
                    : 'Cities are being configured. Please check back shortly.'}
                </p>
                {initialSearch && (
                  <Link href="/routes"
                    style={{ background: '#0a1628', color: '#ffffff', fontWeight: 600, fontSize: 13, padding: '10px 20px', borderRadius: 8, textDecoration: 'none', display: 'inline-block' }}>
                    Browse all cities
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                  {cities.map(city => (
                    <Link key={city.id} href={`/routes/city/${city.slug}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, textDecoration: 'none', transition: 'background 0.15s, border-color 0.15s' }}
                      onMouseEnter={e => {
                        const el = e.currentTarget as HTMLAnchorElement
                        el.style.background = '#0a1628'
                        el.style.borderColor = '#0a1628'
                        const p = el.querySelector('p') as HTMLElement
                        const small = el.querySelector('small') as HTMLElement
                        if (p) p.style.color = '#ffffff'
                        if (small) small.style.color = '#94a3b8'
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget as HTMLAnchorElement
                        el.style.background = '#ffffff'
                        el.style.borderColor = '#e2e8f0'
                        const p = el.querySelector('p') as HTMLElement
                        const small = el.querySelector('small') as HTMLElement
                        if (p) p.style.color = '#0f172a'
                        if (small) small.style.color = '#94a3b8'
                      }}
                    >
                      <MapPin size={14} style={{ color: '#08a9ee', flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 0.15s' }}>{city.name}</p>
                        <small style={{ fontSize: 11, color: '#94a3b8', transition: 'color 0.15s' }}>
                          {city.routeCount > 0 ? `${city.routeCount} routes` : 'View'}
                        </small>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginTop: 28, paddingTop: 24, borderTop: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
                      Showing <strong style={{ color: '#0f172a' }}>{(page - 1) * 12 + 1}–{Math.min(page * 12, total)}</strong> of <strong style={{ color: '#0f172a' }}>{total}</strong> cities
                    </p>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      {page > 1 && (
                        <Link href={`/routes?page=${page - 1}${initialSearch ? `&search=${encodeURIComponent(initialSearch)}` : ''}`}
                          style={{ fontSize: 13, color: '#475569', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 14px', textDecoration: 'none', background: '#ffffff', fontWeight: 500 }}>
                          ← Prev
                        </Link>
                      )}
                      {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                        const p = page <= 3 ? i + 1 : page - 2 + i
                        if (p < 1 || p > pages) return null
                        return (
                          <Link key={p} href={`/routes?page=${p}${initialSearch ? `&search=${encodeURIComponent(initialSearch)}` : ''}`}
                            style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', background: p === page ? '#0a1628' : '#ffffff', color: p === page ? '#ffffff' : '#64748b', border: p === page ? '1px solid #0a1628' : '1px solid #e2e8f0' }}>
                            {p}
                          </Link>
                        )
                      })}
                      {page < pages && (
                        <Link href={`/routes?page=${page + 1}${initialSearch ? `&search=${encodeURIComponent(initialSearch)}` : ''}`}
                          style={{ fontSize: 13, color: '#475569', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 14px', textDecoration: 'none', background: '#ffffff', fontWeight: 500 }}>
                          Next →
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>

          {/* ── CTA ────────────────────────────────────────────────────────── */}
          <div style={{ background: '#0a1628', borderRadius: 12, padding: '24px 28px', marginTop: 40, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', margin: '0 0 4px' }}>Can&apos;t find your city?</p>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Call or WhatsApp — we cover 500+ routes across Gujarat and India.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a href="tel:+919723097832"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#ffffff', color: '#0a1628', fontWeight: 700, fontSize: 13, padding: '10px 18px', borderRadius: 8, textDecoration: 'none' }}>
                <Phone size={14} /> +91 97230 97832
              </a>
              <a href={WA_URL} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#22c55e', color: '#ffffff', fontWeight: 700, fontSize: 13, padding: '10px 18px', borderRadius: 8, textDecoration: 'none' }}>
                <MessageCircle size={14} /> WhatsApp
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
