'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import Link from 'next/link'

interface MapPlace {
  id: number
  name: string
  slug: string
  latitude: number
  longitude: number
  cityName: string
  featuredImage: string | null
  category: { name: string; icon: string | null } | null
  state: { name: string; slug: string }
  district: { name: string; slug: string } | null
}

interface Props {
  places: MapPlace[]
}

function buildHref(place: MapPlace) {
  return `/explore-india/${place.state.slug}/${place.district?.slug ?? '_'}/${place.slug}`
}

export default function ExploreMap({ places }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Fix Leaflet default marker icon
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const L = require('leaflet')
    delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
    setMounted(true)
  }, [])

  if (!mounted) return (
    <div style={{ height: 480, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, fontSize: 14, color: '#94a3b8' }}>
      Loading map…
    </div>
  )

  // India center coordinates
  const INDIA_CENTER: [number, number] = [20.5937, 78.9629]
  const INDIA_ZOOM = 5

  const validPlaces = places.filter(p => p.latitude && p.longitude && p.latitude !== 0 && p.longitude !== 0)

  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <MapContainer
        center={INDIA_CENTER}
        zoom={INDIA_ZOOM}
        style={{ height: 480, width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        />
        {validPlaces.map(place => (
          <Marker key={place.id} position={[place.latitude, place.longitude]}>
            <Popup>
              <div style={{ minWidth: 180 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#0a1628', marginBottom: 4 }}>
                  {place.category?.icon} {place.name}
                </div>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>
                  {place.cityName ? `${place.cityName}, ` : ''}{place.state.name}
                </div>
                {place.category && (
                  <div style={{ fontSize: 11, background: '#f1f5f9', color: '#374151', padding: '2px 8px', borderRadius: 50, display: 'inline-block', marginBottom: 8 }}>
                    {place.category.name}
                  </div>
                )}
                <div>
                  <Link href={buildHref(place)}
                    style={{ fontSize: 12, fontWeight: 600, color: '#08A9EE', textDecoration: 'none' }}>
                    View Details →
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div style={{ padding: '8px 12px', background: '#f8fafc', fontSize: 11, color: '#94a3b8', borderTop: '1px solid #e2e8f0' }}>
        Map data © <a href="https://openstreetmap.org" target="_blank" rel="noopener noreferrer" style={{ color: '#64748b' }}>OpenStreetMap</a> contributors · {validPlaces.length} destination{validPlaces.length !== 1 ? 's' : ''} shown
      </div>
    </div>
  )
}
