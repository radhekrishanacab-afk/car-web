'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, ArrowRight, ExternalLink } from 'lucide-react'

interface Destination {
  id: number
  name: string
  description: string
  imageUrl: string
  slug: string
}

const defaultDestinations: Destination[] = [
  {
    id: 1,
    name: 'Statue of Unity',
    slug: 'statue-of-unity',
    description: "World's tallest statue — a symbol of unity and a majestic landmark in Gujarat.",
    imageUrl: '/images/destinations/statue-of-unity.jpg',
  },
  {
    id: 2,
    name: 'Saputara',
    slug: 'saputara',
    description: 'A peaceful hill station with scenic views, cool climate and natural beauty.',
    imageUrl: '/images/destinations/saputara.jpg',
  },
  {
    id: 3,
    name: 'Dwarka',
    slug: 'dwarka',
    description: 'A sacred city with rich history, known for the Dwarkadhish temple.',
    imageUrl: '/images/destinations/dwarka.jpg',
  },
  {
    id: 4,
    name: 'Rann of Kutch',
    slug: 'rann-of-kutch',
    description: 'Experience the magical white desert — a unique landscape filled with culture.',
    imageUrl: '/images/destinations/rann-of-kutch.jpg',
  },
]

export default function DestinationsSection({ destinations }: { destinations?: Destination[] }) {
  const list = destinations?.length ? destinations : defaultDestinations

  return (
    <section style={{ padding: '5.5rem 0 6rem', background: '#ffffff' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header row — left aligned heading + right aligned link */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '3rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span className="section-overline">EXPLORE INDIA</span>
            <h2 style={{ color: '#10264A', marginTop: '0.375rem', marginBottom: '0.75rem' }}>
              Popular Tourist Destinations
            </h2>
            <p style={{ color: '#6B7280', fontSize: '1rem', lineHeight: 1.75, maxWidth: '34rem' }}>
              Discover India&apos;s most beloved destinations with our comfortable
              and reliable taxi service.
            </p>
          </div>
          <Link
            href="/explore-india"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#08A9EE',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              paddingBottom: '0.25rem',
            }}
          >
            Explore All Destinations
            <ArrowRight size={15} />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {list.map((dest) => (
            <div
              key={dest.id}
              className="group"
              style={{
                background: '#fff',
                borderRadius: '1.25rem',
                border: '1.5px solid #e5e7eb',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.22s, border-color 0.22s, transform 0.22s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)'
                el.style.borderColor = 'rgba(8,169,238,0.35)'
                el.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement
                el.style.boxShadow = 'none'
                el.style.borderColor = '#e5e7eb'
                el.style.transform = 'translateY(0)'
              }}
            >
              {/* Image */}
              <div style={{ position: 'relative', height: '200px', overflow: 'hidden', flexShrink: 0 }}>
                <Image
                  src={dest.imageUrl}
                  alt={dest.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(10,22,40,0.82) 0%, rgba(10,22,40,0.15) 55%, transparent 100%)',
                }} />

                {/* Location pin */}
                <div style={{
                  position: 'absolute',
                  bottom: '0.875rem',
                  left: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                }}>
                  <div style={{
                    width: '1.5rem',
                    height: '1.5rem',
                    borderRadius: '50%',
                    background: '#08A9EE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <MapPin size={10} color="#fff" strokeWidth={2.5} />
                  </div>
                  <span style={{
                    color: '#ffffff',
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    letterSpacing: '0.01em',
                    textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                  }}>
                    {dest.name}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div style={{
                padding: '1.25rem 1.375rem 1.375rem',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                gap: '0.875rem',
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    color: '#10264A',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    marginBottom: '0.4rem',
                    lineHeight: 1.35,
                  }}>
                    {dest.name}
                  </h3>
                  <p style={{
                    fontSize: '0.8125rem',
                    color: '#9CA3AF',
                    lineHeight: 1.7,
                    margin: 0,
                  }}
                    className="line-clamp-2"
                  >
                    {dest.description}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link
                    href={`/explore-india?state=gujarat`}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      padding: '0.5625rem 0',
                      borderRadius: '0.625rem',
                      border: '1.5px solid #e5e7eb',
                      color: '#374151',
                      textDecoration: 'none',
                      transition: 'border-color 0.18s, color 0.18s',
                    }}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLAnchorElement
                      el.style.borderColor = '#10264A'
                      el.style.color = '#10264A'
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLAnchorElement
                      el.style.borderColor = '#e5e7eb'
                      el.style.color = '#374151'
                    }}
                  >
                    <ExternalLink size={12} />
                    Explore
                  </Link>
                  <a
                    href={`https://wa.me/919723097832?text=${encodeURIComponent(`🚖 I'd like to book a cab to ${dest.name}. Please share fare details.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.3rem',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      padding: '0.5625rem 0',
                      borderRadius: '0.625rem',
                      background: '#08A9EE',
                      color: '#fff',
                      textDecoration: 'none',
                      transition: 'background 0.18s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = '#0798d4'}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = '#08A9EE'}
                  >
                    <ArrowRight size={12} />
                    Book Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
