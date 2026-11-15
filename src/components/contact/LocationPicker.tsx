'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import type { LatLng } from 'leaflet'
import { CheckCircle2, X } from 'lucide-react'

/* Fix leaflet default marker icon (missing in webpack/Next.js) */
function fixLeafletIcon() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet')
  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

/* Reverse geocode using OpenStreetMap Nominatim */
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`,
      { headers: { 'User-Agent': 'RadheKrishnaCab/1.0' } }
    )
    const data = await res.json()
    const a = data.address ?? {}
    const parts = [
      a.road || a.neighbourhood || a.suburb || a.village,
      a.city || a.town || a.county,
      a.state,
    ].filter(Boolean)
    return parts.length ? parts.join(', ') : data.display_name?.split(',').slice(0, 3).join(',').trim() ?? `${lat.toFixed(5)}, ${lon.toFixed(5)}`
  } catch {
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`
  }
}

/* ── Click handler inside map ── */
function ClickHandler({ onPick }: { onPick: (ll: LatLng) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng) })
  return null
}

interface Props {
  label: string
  onConfirm: (address: string, mapsLink: string) => void
  onClose: () => void
}

export default function LocationPicker({ label, onConfirm, onClose }: Props) {
  const [mounted, setMounted]       = useState(false)
  const [pin, setPin]               = useState<LatLng | null>(null)
  const [address, setAddress]       = useState<string>('')
  const [geocoding, setGeocoding]   = useState(false)
  const center: [number, number] = [22.3072, 73.1812]

  useEffect(() => {
    fixLeafletIcon()
    setMounted(true)
  }, [])

  const handlePick = async (ll: LatLng) => {
    setPin(ll)
    setGeocoding(true)
    const addr = await reverseGeocode(ll.lat, ll.lng)
    setAddress(addr)
    setGeocoding(false)
  }

  const handleConfirm = () => {
    if (!pin) return
    const mapsLink = `https://maps.google.com/?q=${pin.lat.toFixed(6)},${pin.lng.toFixed(6)}`
    onConfirm(address || `${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`, mapsLink)
  }

  if (!mounted) return null

  return (
    /* Backdrop */
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(10,22,40,0.72)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Modal */}
      <div style={{
        background: '#ffffff', borderRadius: '1.25rem',
        width: '100%', maxWidth: '520px',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #f1f5f9',
          background: 'linear-gradient(135deg, #0f1e3d, #1a3a6b)',
        }}>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#08A9EE', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Select Location
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
              {label}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)', border: 'none',
              borderRadius: '50%', width: '2rem', height: '2rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#ffffff',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Map instructions */}
        <div style={{ padding: '0.75rem 1.25rem', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' }}>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
            Tap anywhere on the map to drop a pin
          </p>
        </div>

        {/* Map */}
        <div style={{ height: '300px', position: 'relative' }}>
          <MapContainer
            key={`${center[0]}-${center[1]}`}
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
            />
            <ClickHandler onPick={handlePick} />
            {pin && <Marker position={pin} />}
          </MapContainer>
        </div>

        {/* Selected address + confirm */}
        <div style={{ padding: '1rem 1.25rem' }}>
          {pin ? (
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: '0.75rem', padding: '0.75rem 1rem',
              marginBottom: '0.875rem',
            }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#16a34a', marginBottom: '2px' }}>
                Selected Location
              </div>
              <div style={{ fontSize: '0.875rem', color: '#166534', fontWeight: 500 }}>
                {geocoding ? 'Getting address…' : address}
              </div>
            </div>
          ) : (
            <div style={{
              background: '#fafafa', border: '1px solid #e5e7eb',
              borderRadius: '0.75rem', padding: '0.75rem 1rem',
              marginBottom: '0.875rem',
              fontSize: '0.8125rem', color: '#9CA3AF', textAlign: 'center',
            }}>
              No location selected yet — tap the map or use GPS
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1, padding: '0.75rem',
                background: '#f3f4f6', color: '#374151',
                border: 'none', borderRadius: '0.75rem',
                fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!pin || geocoding}
              style={{
                flex: 2, padding: '0.75rem',
                background: !pin || geocoding
                  ? '#9CA3AF'
                  : 'linear-gradient(135deg, #0f1e3d, #1a3a6b)',
                color: '#ffffff',
                border: 'none', borderRadius: '0.75rem',
                fontWeight: 700, fontSize: '0.9rem',
                cursor: !pin || geocoding ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}
            >
              <CheckCircle2 size={16} />
              Confirm Location
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
