'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

interface Props {
  lat: number
  lng: number
  name: string
  icon: string
}

export default function SinglePlaceMap({ lat, lng, name, icon }: Props) {
  const [mounted, setMounted] = useState(false)

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
  }, [])

  if (!mounted) return <div style={{ height: 260, background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, color: '#94a3b8' }}>Loading map…</div>

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const L = require('leaflet')
  const customIcon = L.divIcon({
    html: `<div style="background:#0a1628;color:#f59e0b;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid #f59e0b;box-shadow:0 2px 8px rgba(0,0,0,.35)">${icon}</div>`,
    iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -18], className: '',
  })

  return (
    <MapContainer center={[lat, lng]} zoom={13} style={{ height: 260, width: '100%' }} scrollWheelZoom={false}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
      />
      <Marker position={[lat, lng]} icon={customIcon}>
        <Popup><div style={{ fontWeight: 600, fontSize: 13 }}>{icon} {name}</div></Popup>
      </Marker>
    </MapContainer>
  )
}
