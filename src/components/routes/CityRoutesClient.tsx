'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface RouteRow {
  id: number
  slug: string
  originName: string
  originSlug: string
  destinationName: string
  destinationSlug: string
  lowestFare: number | null
}

export default function CityRoutesClient({ routes }: { routes: RouteRow[] }) {
  return (
    <div style={{ background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      {routes.map((route, idx) => (
        <Link
          key={route.id}
          href={`/routes/${route.slug}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderBottom: idx < routes.length - 1 ? '1px solid #f1f5f9' : 'none',
            textDecoration: 'none',
            background: '#ffffff',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = '#f8fafc'}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = '#ffffff'}
        >
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <span style={{ fontSize: 12, color: '#cbd5e1', fontWeight: 600, width: 24, flexShrink: 0, textAlign: 'right' }}>
              {idx + 1}
            </span>
            <span style={{ fontSize: 14, fontWeight: 500, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {route.originName}
              <span style={{ color: '#f59e0b', fontWeight: 700, margin: '0 6px' }}>→</span>
              {route.destinationName}
            </span>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, marginLeft: 12 }}>
            {route.lowestFare != null && (
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                ₹{route.lowestFare.toLocaleString('en-IN')}
              </span>
            )}
            <ChevronRight size={15} style={{ color: '#cbd5e1' }} />
          </div>
        </Link>
      ))}
    </div>
  )
}
