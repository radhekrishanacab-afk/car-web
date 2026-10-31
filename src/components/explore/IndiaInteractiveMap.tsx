'use client'

/**
 * 6-Step Interactive India Tourist Map
 *
 * Step 1: India map → all states clickable (GeoJSON from datameet, CC0)
 * Step 2: State selected → zoom to state, show districts (GeoJSON)
 * Step 3: District selected → show cities/towns from DB
 * Step 4: City selected → show tourist place markers
 * Step 5: Place selected → full detail card
 *
 * GeoJSON sources:
 *   States:    https://github.com/datameet/maps-of-india (CC0)
 *   Districts: https://github.com/datameet/maps-of-india/tree/master/Districts (CC0)
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet'
import Link from 'next/link'
import { Search, MapPin, ChevronRight, X, MessageCircle, Navigation } from 'lucide-react'
import type { Layer, LeafletMouseEvent, Map as LeafletMap } from 'leaflet'

/* ── Types ────────────────────────────────────────────────────────────────── */
interface MapPlace {
  id: number; name: string; slug: string
  latitude: number; longitude: number; cityName: string; featuredImage: string | null
  category: { name: string; icon: string | null } | null
  state: { name: string; slug: string }
  district: { name: string; slug: string } | null
}
interface StateItem { id: number; name: string; slug: string; code: string; placeCount: number; latitude: number | null; longitude: number | null }
interface Props {
  places: MapPlace[]
  states: StateItem[]
  selectedStateSlug: string
  onStateSelect: (slug: string) => void
}

/* ── GeoJSON URLs (CC0 public domain datasets) ────────────────────────────── */
const STATES_GEOJSON  = 'https://raw.githubusercontent.com/datameet/maps-of-india/master/States/States.geojson'

/* Slugify a feature name to match DB slugs */
function nameToSlug(name: string): string {
  return name.toLowerCase()
    .replace(/\s+&\s+/g, '-').replace(/\s+and\s+/g, '-')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
}

/* ── Map controller – handles zoom/fly animations ─────────────────────────── */
function MapController({ bounds, center, zoom }: {
  bounds?: [[number,number],[number,number]] | null
  center?: [number,number] | null
  zoom?: number
}) {
  const map = useMap()
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [30,30], maxZoom: 9, animate: true, duration: 0.8 })
    else if (center && zoom) map.flyTo(center, zoom, { animate: true, duration: 0.8 })
    else map.flyTo([20.5937, 78.9629], 5, { animate: true, duration: 0.8 })
  }, [bounds, center, zoom, map])
  return null
}

/* ── Individual step panels ───────────────────────────────────────────────── */
function StepBadge({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, background: done ? '#22c55e' : active ? '#f59e0b' : '#e2e8f0', color: done || active ? '#fff' : '#64748b' }}>
      {done ? '✓' : n}
    </div>
  )
}

/* ══ MAIN COMPONENT ══════════════════════════════════════════════════════════ */
export default function IndiaInteractiveMap({ places, states, selectedStateSlug, onStateSelect }: Props) {
  const [mounted, setMounted] = useState(false)
  const [statesGeo, setStatesGeo] = useState<GeoJSON.FeatureCollection | null>(null)
  const [districtsGeo, setDistrictsGeo] = useState<GeoJSON.FeatureCollection | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)

  /* Navigation state */
  const [step, setStep] = useState<1|2|3|4|5>(1)
  const [selState, setSelState] = useState<StateItem | null>(null)
  const [selDistrictSlug, setSelDistrictSlug] = useState('')
  const [selDistrictName, setSelDistrictName] = useState('')
  const [selCity, setSelCity] = useState('')
  const [selPlace, setSelPlace] = useState<MapPlace | null>(null)

  /* Search */
  const [stateSearch, setStateSearch] = useState('')
  const [districtSearch, setDistrictSearch] = useState('')
  const [citySearch, setCitySearch] = useState('')
  const [placeSearch, setPlaceSearch] = useState('')

  /* Map bounds / zoom */
  const [mapBounds, setMapBounds] = useState<[[number,number],[number,number]] | null>(null)
  const [mapCenter, setMapCenter] = useState<[number,number] | null>(null)
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined)
  const [hoveredState, setHoveredState] = useState('')
  const [hoveredDistrict, setHoveredDistrict] = useState('')
  const [tooltip, setTooltip] = useState<{x:number;y:number;text:string} | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)

  /* ── Init ──────────────────────────────────────────────────────────────── */
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet')
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
    setMounted(true)

    // Load India states GeoJSON
    fetch(STATES_GEOJSON)
      .then(r => r.json())
      .then(setStatesGeo)
      .catch(() => {}) // silent – map still usable via list
  }, [])

  /* ── Derived data ──────────────────────────────────────────────────────── */
  // All unique districts from DB places for selected state
  const districtsList = selState
    ? Array.from(
        new Map(
          places
            .filter(p => p.state.slug === selState.slug && p.district)
            .map(p => [p.district!.slug, p.district!])
        ).values()
      ).sort((a,b) => a.name.localeCompare(b.name))
    : []

  // Cities for selected district
  const citiesList = selDistrictSlug
    ? Array.from(new Set(
        places
          .filter(p => p.district?.slug === selDistrictSlug && p.cityName)
          .map(p => p.cityName as string)
      )).sort()
    : []

  // Tourist places for selected city (or district if no city selected)
  const visiblePlaces = places.filter(p => {
    if (!selState) return true
    if (p.state.slug !== selState.slug) return false
    if (selDistrictSlug && p.district?.slug !== selDistrictSlug) return false
    if (selCity && p.cityName !== selCity) return false
    return true
  })

  /* ── State selection handler ───────────────────────────────────────────── */
  const handleStateSelect = useCallback((stateSlug: string, bounds?: [[number,number],[number,number]]) => {
    const found = states.find(s => s.slug === stateSlug)
    if (!found) return
    setSelState(found)
    setSelDistrictSlug('')
    setSelDistrictName('')
    setSelCity('')
    setSelPlace(null)
    setStep(2)
    onStateSelect(stateSlug)
    if (bounds) setMapBounds(bounds)
    else if (found.latitude && found.longitude) { setMapCenter([found.latitude, found.longitude]); setMapZoom(7); setMapBounds(null) }

    // Load district GeoJSON for this state
    setGeoLoading(true)
    const code = found.code.toLowerCase()
    const url = `https://raw.githubusercontent.com/datameet/maps-of-india/master/Districts/${code.toUpperCase()}_districts.geojson`
    fetch(url)
      .then(r => r.json())
      .then(d => { setDistrictsGeo(d); setGeoLoading(false) })
      .catch(() => { setDistrictsGeo(null); setGeoLoading(false) })
  }, [states, onStateSelect])

  /* ── District selection ────────────────────────────────────────────────── */
  const handleDistrictSelect = useCallback((slug: string, name: string, bounds?: [[number,number],[number,number]]) => {
    setSelDistrictSlug(slug)
    setSelDistrictName(name)
    setSelCity('')
    setSelPlace(null)
    setStep(3)
    if (bounds) setMapBounds(bounds)
  }, [])

  /* ── City selection ────────────────────────────────────────────────────── */
  const handleCitySelect = useCallback((city: string) => {
    setSelCity(city)
    setSelPlace(null)
    setStep(4)
    // Zoom to city centroid if we have places with coords
    const cityPlaces = places.filter(p => p.cityName === city && p.latitude && p.longitude)
    if (cityPlaces.length > 0) {
      const lat = cityPlaces.reduce((s,p) => s + p.latitude, 0) / cityPlaces.length
      const lng = cityPlaces.reduce((s,p) => s + p.longitude, 0) / cityPlaces.length
      setMapCenter([lat, lng])
      setMapZoom(12)
      setMapBounds(null)
    }
  }, [places])

  /* ── Back navigation ───────────────────────────────────────────────────── */
  const goToIndia = () => { setStep(1); setSelState(null); setSelDistrictSlug(''); setSelDistrictName(''); setSelCity(''); setSelPlace(null); setMapBounds(null); setMapCenter(null); setMapZoom(undefined); onStateSelect('') }
  const goToState = () => { setStep(2); setSelDistrictSlug(''); setSelDistrictName(''); setSelCity(''); setSelPlace(null); if (selState?.latitude && selState?.longitude) { setMapCenter([selState.latitude, selState.longitude]); setMapZoom(7); setMapBounds(null) } }
  const goToDistrict = () => { setStep(3); setSelCity(''); setSelPlace(null) }

  /* ── GeoJSON style helpers ─────────────────────────────────────────────── */
  const stateStyle = useCallback((feature?: GeoJSON.Feature) => {
    if (!feature) return {}
    const slug = nameToSlug((feature.properties as Record<string,string>).ST_NM ?? (feature.properties as Record<string,string>).NAME_1 ?? '')
    const count = places.filter(p => p.state.slug === slug).length
    const isSelected = slug === selState?.slug
    const isHovered  = slug === hoveredState
    return {
      fillColor: isSelected ? '#f59e0b' : isHovered ? '#3b82f6' : count > 0 ? '#0a1628' : '#94a3b8',
      fillOpacity: isSelected ? 0.85 : isHovered ? 0.7 : count > 0 ? 0.45 : 0.15,
      color: isSelected ? '#d97706' : '#ffffff',
      weight: isSelected ? 2.5 : isHovered ? 2 : 0.7,
    }
  }, [selState, hoveredState, places])

  const districtStyle = useCallback((feature?: GeoJSON.Feature) => {
    if (!feature) return {}
    const props = feature.properties as Record<string,string>
    const name = props.DISTRICT ?? props.NAME_2 ?? props.dtname ?? ''
    const slug = nameToSlug(name)
    const isSelected = slug === selDistrictSlug
    const isHovered  = slug === hoveredDistrict
    const hasPlaces  = places.some(p => p.district?.slug === slug)
    return {
      fillColor: isSelected ? '#f59e0b' : isHovered ? '#3b82f6' : hasPlaces ? '#10264a' : '#94a3b8',
      fillOpacity: isSelected ? 0.85 : isHovered ? 0.7 : hasPlaces ? 0.5 : 0.15,
      color: isSelected ? '#d97706' : '#ffffff',
      weight: isSelected ? 2.5 : 1,
    }
  }, [selDistrictSlug, hoveredDistrict, places])

  const onEachState = useCallback((feature: GeoJSON.Feature, layer: Layer) => {
    const props = feature.properties as Record<string,string>
    const name = props.ST_NM ?? props.NAME_1 ?? ''
    const slug = nameToSlug(name)
    const count = places.filter(p => p.state.slug === slug).length
    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        setHoveredState(slug)
        setTooltip({ x: e.originalEvent.clientX, y: e.originalEvent.clientY, text: `${name}${count > 0 ? ` · ${count} place${count>1?'s':''}` : ''}` })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(layer as any).setStyle({ fillOpacity: 0.7, weight: 2, color: '#1d4ed8' })
      },
      mouseout: () => {
        setHoveredState('')
        setTooltip(null)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(layer as any).setStyle(stateStyle(feature))
      },
      mousemove: (e: LeafletMouseEvent) => setTooltip(p => p ? { ...p, x: e.originalEvent.clientX, y: e.originalEvent.clientY } : null),
      click: () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const b = (layer as any).getBounds?.()
        const bounds: [[number,number],[number,number]] | undefined = b ? [[b.getSouth(),b.getWest()],[b.getNorth(),b.getEast()]] : undefined
        handleStateSelect(slug, bounds)
      },
    })
  }, [places, stateStyle, handleStateSelect])

  const onEachDistrict = useCallback((feature: GeoJSON.Feature, layer: Layer) => {
    const props = feature.properties as Record<string,string>
    const name = props.DISTRICT ?? props.NAME_2 ?? props.dtname ?? ''
    const slug = nameToSlug(name)
    layer.on({
      mouseover: (e: LeafletMouseEvent) => {
        setHoveredDistrict(slug)
        setTooltip({ x: e.originalEvent.clientX, y: e.originalEvent.clientY, text: name })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(layer as any).setStyle({ fillOpacity: 0.7, weight: 2, color: '#1d4ed8' })
      },
      mouseout: () => {
        setHoveredDistrict('')
        setTooltip(null)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(layer as any).setStyle(districtStyle(feature))
      },
      mousemove: (e: LeafletMouseEvent) => setTooltip(p => p ? { ...p, x: e.originalEvent.clientX, y: e.originalEvent.clientY } : null),
      click: () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const b = (layer as any).getBounds?.()
        const bounds: [[number,number],[number,number]] | undefined = b ? [[b.getSouth(),b.getWest()],[b.getNorth(),b.getEast()]] : undefined
        handleDistrictSelect(slug, name, bounds)
      },
    })
  }, [districtStyle, handleDistrictSelect])

  if (!mounted) return <div style={{ height: 560, background: '#f0f4f8', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading map…</div>

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet')

  const makeMarkerIcon = (emoji: string, active = false) => L.divIcon({
    html: `<div style="background:${active?'#f59e0b':'#0a1628'};color:${active?'#0a1628':'#f59e0b'};width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid ${active?'#d97706':'#f59e0b'};box-shadow:0 2px 8px rgba(0,0,0,.3)">${emoji}</div>`,
    iconSize: [30,30], iconAnchor: [15,15], popupAnchor: [0,-18], className: '',
  })

  const filteredStates = stateSearch
    ? states.filter(s => s.name.toLowerCase().includes(stateSearch.toLowerCase()))
    : states

  const filteredDistricts = districtSearch
    ? districtsList.filter(d => d.name.toLowerCase().includes(districtSearch.toLowerCase()))
    : districtsList

  const filteredCities = citySearch
    ? citiesList.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()))
    : citiesList

  const filteredPlaces = placeSearch
    ? visiblePlaces.filter(p => p.name.toLowerCase().includes(placeSearch.toLowerCase()))
    : visiblePlaces

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div style={{ position: 'relative' }}>
      {/* Tooltip */}
      {tooltip && (
        <div style={{ position: 'fixed', left: tooltip.x + 12, top: tooltip.y - 36, zIndex: 9999, background: 'rgba(10,22,40,0.9)', color: '#fff', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 6, pointerEvents: 'none', boxShadow: '0 2px 8px rgba(0,0,0,.3)' }}>
          {tooltip.text}
        </div>
      )}

      {/* Step indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {(['India', selState?.name ?? 'State', selDistrictName || 'District', selCity || 'City', selPlace?.name ?? 'Place'] as const).map((label, i) => {
          const n = i + 1
          const active = step === n
          const done = step > n
          return (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                disabled={n > step}
                onClick={() => { if (n === 1) goToIndia(); else if (n === 2 && step > 2) goToState(); else if (n === 3 && step > 3) goToDistrict() }}
                style={{ display: 'flex', alignItems: 'center', gap: 6, background: active ? '#0a1628' : done ? '#f0fdf4' : '#f8fafc', border: `1px solid ${active ? '#0a1628' : done ? '#bbf7d0' : '#e2e8f0'}`, borderRadius: 20, padding: '4px 10px', cursor: n <= step ? 'pointer' : 'default', fontSize: 12, fontWeight: 600, color: active ? '#fff' : done ? '#16a34a' : '#94a3b8' }}>
                <StepBadge n={n} active={active} done={done} />
                {label}
              </button>
              {i < 4 && <ChevronRight size={13} style={{ color: '#cbd5e1', flexShrink: 0 }} />}
            </div>
          )
        })}
      </div>

      {/* Main two-panel layout */}
      <div style={{ display: 'flex', gap: 0, border: '1px solid #e2e8f0', borderRadius: 14, overflow: 'hidden', background: '#fff', minHeight: 560 }}>

        {/* ── LEFT panel — lists ────────────────────────────────────────── */}
        <div style={{ width: 260, flexShrink: 0, borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Panel header */}
          <div style={{ background: '#0a1628', color: '#fff', padding: '12px 14px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {step === 1 ? 'Step 1' : step === 2 ? 'Step 2' : step === 3 ? 'Step 3' : step === 4 ? 'Step 4' : 'Step 5'}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>
              {step === 1 ? 'Select a State' : step === 2 ? `Districts in ${selState?.name}` : step === 3 ? `Cities in ${selDistrictName}` : step === 4 ? `Places in ${selCity || selDistrictName}` : selPlace?.name}
            </div>
            {step === 2 && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{selState?.placeCount ?? 0} destinations · {districtsList.length} districts</div>}
            {step === 4 && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{visiblePlaces.length} tourist place{visiblePlaces.length !== 1 ? 's' : ''}</div>}
          </div>

          {/* Back button (for step 2+) */}
          {step > 1 && (
            <button onClick={step === 2 ? goToIndia : step === 3 ? goToState : step === 4 ? goToDistrict : () => setStep(s => Math.max(1,s-1) as 1|2|3|4|5)}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: '#f8fafc', border: 'none', borderBottom: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 12, color: '#64748b', fontWeight: 500 }}>
              ← Back to India {step > 2 ? `> ${selState?.name ?? ''}` : ''} {step > 3 ? `> ${selDistrictName}` : ''}
            </button>
          )}

          {/* Search box */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ position: 'relative' }}>
              <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder={step === 1 ? 'Search state…' : step === 2 ? 'Search district…' : step === 3 ? 'Search city…' : 'Search place…'}
                value={step === 1 ? stateSearch : step === 2 ? districtSearch : step === 3 ? citySearch : placeSearch}
                onChange={e => {
                  const v = e.target.value
                  if (step === 1) setStateSearch(v)
                  else if (step === 2) setDistrictSearch(v)
                  else if (step === 3) setCitySearch(v)
                  else setPlaceSearch(v)
                }}
                style={{ width: '100%', padding: '6px 6px 6px 24px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>

            {/* Step 1: States */}
            {step === 1 && filteredStates.map(s => (
              <button key={s.slug} onClick={() => handleStateSelect(s.slug)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'transparent', border: 'none', borderBottom: '1px solid #f8fafc', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.placeCount > 0 ? '#f59e0b' : '#e2e8f0', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0a1628', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                  {s.placeCount > 0 && <div style={{ fontSize: 10, color: '#94a3b8' }}>{s.placeCount} place{s.placeCount>1?'s':''}</div>}
                </div>
                <ChevronRight size={12} style={{ color: '#cbd5e1', flexShrink: 0 }} />
              </button>
            ))}

            {/* Step 2: Districts */}
            {step === 2 && (
              filteredDistricts.length > 0
                ? filteredDistricts.map(d => {
                    const count = places.filter(p => p.district?.slug === d.slug).length
                    return (
                      <button key={d.slug} onClick={() => handleDistrictSelect(d.slug, d.name)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: selDistrictSlug === d.slug ? '#fffbeb' : 'transparent', border: 'none', borderBottom: '1px solid #f8fafc', cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={e => { if (selDistrictSlug !== d.slug) e.currentTarget.style.background = '#f8fafc' }}
                        onMouseLeave={e => { if (selDistrictSlug !== d.slug) e.currentTarget.style.background = 'transparent' }}
                      >
                        <MapPin size={12} style={{ color: '#f59e0b', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#0a1628', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                          {count > 0 && <div style={{ fontSize: 10, color: '#94a3b8' }}>{count} place{count>1?'s':''}</div>}
                        </div>
                        <ChevronRight size={12} style={{ color: '#cbd5e1', flexShrink: 0 }} />
                      </button>
                    )
                  })
                : <div style={{ padding: '20px 14px', fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
                    No districts found in DB yet.<br />
                    <span style={{ fontSize: 11 }}>Add destinations via Admin.</span>
                  </div>
            )}

            {/* Step 3: Cities */}
            {step === 3 && (
              filteredCities.length > 0
                ? filteredCities.map(city => {
                    const count = places.filter(p => p.cityName === city && p.district?.slug === selDistrictSlug).length
                    return (
                      <button key={city} onClick={() => handleCitySelect(city)}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: selCity === city ? '#fffbeb' : 'transparent', border: 'none', borderBottom: '1px solid #f8fafc', cursor: 'pointer', textAlign: 'left' }}
                        onMouseEnter={e => { if (selCity !== city) e.currentTarget.style.background = '#f8fafc' }}
                        onMouseLeave={e => { if (selCity !== city) e.currentTarget.style.background = 'transparent' }}
                      >
                        <MapPin size={12} style={{ color: '#3b82f6', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#0a1628' }}>{city}</div>
                          <div style={{ fontSize: 10, color: '#94a3b8' }}>{count} place{count>1?'s':''}</div>
                        </div>
                        <ChevronRight size={12} style={{ color: '#cbd5e1', flexShrink: 0 }} />
                      </button>
                    )
                  })
                : <div style={{ padding: '20px 14px', fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>No cities found for this district.</div>
            )}

            {/* Step 4+: Places */}
            {(step === 4 || step === 5) && (
              filteredPlaces.length > 0
                ? filteredPlaces.map(p => (
                    <button key={p.id} onClick={() => { setSelPlace(p); setStep(5); if (p.latitude && p.longitude) { setMapCenter([p.latitude, p.longitude]); setMapZoom(14); setMapBounds(null) } }}
                      style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 8, padding: '9px 14px', background: selPlace?.id === p.id ? '#fffbeb' : 'transparent', border: 'none', borderBottom: '1px solid #f8fafc', cursor: 'pointer', textAlign: 'left' }}
                      onMouseEnter={e => { if (selPlace?.id !== p.id) e.currentTarget.style.background = '#f8fafc' }}
                      onMouseLeave={e => { if (selPlace?.id !== p.id) e.currentTarget.style.background = 'transparent' }}
                    >
                      {p.featuredImage
                        ? <div style={{ width: 40, height: 34, borderRadius: 5, overflow: 'hidden', flexShrink: 0 }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.featuredImage} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        : <div style={{ width: 40, height: 34, borderRadius: 5, background: '#f1f5f9', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{p.category?.icon ?? '🏛️'}</div>
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#0a1628', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>{p.category?.name ?? 'Attraction'}</div>
                      </div>
                    </button>
                  ))
                : <div style={{ padding: '20px 14px', fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>No published places found here yet.</div>
            )}

          </div>
        </div>

        {/* ── RIGHT panel — Map ─────────────────────────────────────────── */}
        <div style={{ flex: 1, position: 'relative', minWidth: 0 }}>
          {geoLoading && (
            <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 1000, background: 'rgba(255,255,255,0.9)', fontSize: 11, color: '#64748b', padding: '4px 12px', borderRadius: 50, boxShadow: '0 2px 8px rgba(0,0,0,.1)' }}>
              Loading district boundaries…
            </div>
          )}

          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: '100%', minHeight: 560, width: '100%' }}
            scrollWheelZoom={true}
            zoomControl={true}
            ref={mapRef}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            />

            <MapController
              bounds={mapBounds}
              center={mapCenter}
              zoom={mapZoom}
            />

            {/* India state boundaries */}
            {statesGeo && step === 1 && (
              <GeoJSON
                key="india-states"
                data={statesGeo}
                style={stateStyle}
                onEachFeature={onEachState}
              />
            )}

            {/* Selected state highlight */}
            {statesGeo && step >= 2 && selState && (
              <GeoJSON
                key={`state-hl-${selState.slug}`}
                data={statesGeo.features.filter(f => {
                    const n = (f.properties as Record<string,string>).ST_NM ?? (f.properties as Record<string,string>).NAME_1 ?? ''
                    return nameToSlug(n) === selState.slug
                  }) as unknown as GeoJSON.FeatureCollection}
                style={() => ({ fillColor: '#fef3c7', fillOpacity: 0.3, color: '#f59e0b', weight: 2 })}
              />
            )}

            {/* District boundaries */}
            {districtsGeo && step >= 2 && (
              <GeoJSON
                key={`districts-${selState?.slug}-${selDistrictSlug}`}
                data={districtsGeo}
                style={districtStyle}
                onEachFeature={onEachDistrict}
              />
            )}

            {/* Tourist place markers */}
            {step >= 4 && visiblePlaces.filter(p => p.latitude && p.longitude).map(p => (
              <Marker
                key={p.id}
                position={[p.latitude, p.longitude]}
                icon={makeMarkerIcon(p.category?.icon ?? '🏛️', selPlace?.id === p.id)}
                eventHandlers={{ click: () => { setSelPlace(p); setStep(5) } }}
              >
                <Popup maxWidth={220}>
                  <div style={{ padding: 4 }}>
                    {p.featuredImage && (
                      <div style={{ height: 80, borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.featuredImage} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ fontWeight: 700, fontSize: 13, color: '#0a1628', marginBottom: 3 }}>{p.category?.icon} {p.name}</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>📍 {p.cityName ? `${p.cityName}, ` : ''}{p.state.name}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link href={`/explore-india/${p.state.slug}/${p.district?.slug ?? '_'}/${p.slug}`}
                        style={{ flex: 1, fontSize: 11, fontWeight: 600, background: '#0a1628', color: '#fff', padding: '5px 8px', borderRadius: 5, textDecoration: 'none', textAlign: 'center' }}>
                        View Details
                      </Link>
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${p.latitude},${p.longitude}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ flex: 1, fontSize: 11, fontWeight: 600, background: '#eff6ff', color: '#2563eb', padding: '5px 8px', borderRadius: 5, textDecoration: 'none', textAlign: 'center' }}>
                        Directions
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* All place markers at India level */}
            {step === 1 && places.filter(p => p.latitude && p.longitude).map(p => (
              <Marker key={p.id} position={[p.latitude, p.longitude]} icon={makeMarkerIcon(p.category?.icon ?? '🏛️')}>
                <Popup>
                  <div style={{ fontWeight: 600, fontSize: 12, color: '#0a1628' }}>{p.category?.icon} {p.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>📍 {p.state.name}</div>
                </Popup>
              </Marker>
            ))}

          </MapContainer>

          {/* Step 5: selected place card overlay */}
          {step === 5 && selPlace && (
            <div style={{ position: 'absolute', bottom: 16, left: 12, right: 12, background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 8px 28px rgba(0,0,0,.15)', padding: '14px 16px', zIndex: 900 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0a1628', marginBottom: 3 }}>{selPlace.category?.icon} {selPlace.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>📍 {selPlace.cityName ? `${selPlace.cityName}, ` : ''}{selPlace.state.name}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link href={`/explore-india/${selPlace.state.slug}/${selPlace.district?.slug ?? '_'}/${selPlace.slug}`}
                      style={{ fontSize: 12, fontWeight: 700, background: '#0a1628', color: '#fff', padding: '6px 14px', borderRadius: 8, textDecoration: 'none' }}>
                      View Details
                    </Link>
                    <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832'}?text=${encodeURIComponent(`Hello! I want to visit ${selPlace.name} in ${selPlace.state.name}. Please share taxi options.`)}`}
                      target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, background: '#22c55e', color: '#fff', padding: '6px 14px', borderRadius: 8, textDecoration: 'none' }}>
                      <MessageCircle size={12} /> Book Taxi
                    </a>
                    {selPlace.latitude && selPlace.longitude && (
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${selPlace.latitude},${selPlace.longitude}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 600, background: '#eff6ff', color: '#2563eb', padding: '6px 14px', borderRadius: 8, textDecoration: 'none' }}>
                        <Navigation size={12} /> Directions
                      </a>
                    )}
                  </div>
                </div>
                <button onClick={() => { setSelPlace(null); setStep(4) }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', flexShrink: 0 }}>
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attribution */}
      <p style={{ fontSize: 10, color: '#94a3b8', marginTop: 6 }}>
        Map © <a href="https://openstreetmap.org" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8' }}>OpenStreetMap</a> contributors ·
        State &amp; district boundaries © <a href="https://github.com/datameet/maps-of-india" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8' }}>DataMeet</a> (CC0)
      </p>
    </div>
  )
}
