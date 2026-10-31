'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react'

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832'

const quickLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/vehicles', label: 'Our Cars' },
  { href: '/services', label: 'Services' },
  { href: '/routes', label: 'Routes' },
  { href: '/contact', label: 'Contact Us' },
]

const offices = [
  {
    city: 'Surat',
    address: '137, Muktidham Society, Punagam, Surat – 395010',
    mapHref: 'https://maps.google.com/?q=Muktidham+Society,Punagam,Surat,Gujarat',
  },
  {
    city: 'Ahmedabad',
    address: '107, Karunasagar Estate, Bapunagar, Ahmedabad – 382345',
    mapHref: 'https://maps.google.com/?q=Bapunagar,Ahmedabad,Gujarat',
  },
]

export default function Footer() {
  return (
    <footer className="bg-[#0a1628] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/radhe-krishana-logo.png"
              alt="Radhe Krishna Cabs & Taxi Service"
              width={200}
              height={54}
              className="h-16 w-auto object-contain mb-6"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
            <p style={{ fontSize: '0.875rem', color: '#9CA3AF', lineHeight: 1.65, marginBottom: '1.25rem' }}>
              Reliable taxi and outstation cab service connecting cities across India with
              comfort, safety, and professionalism.
            </p>
            {/* Social */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              {/* Facebook */}
              <a
                href="https://www.facebook.com/people/Radhe-Krishana-Cab-Taxi-Service/61589139216659/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                style={{
                  width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.18s, border-color 0.18s',
                }}
              >
                <svg style={{ width: '1rem', height: '1rem', color: '#9CA3AF' }} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              {/* Instagram */}
              <a
                href="https://www.instagram.com/radhe_krishana_cab_taxi"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                style={{
                  width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.18s, border-color 0.18s',
                }}
              >
                <svg style={{ width: '1rem', height: '1rem', color: '#9CA3AF' }} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              {/* WhatsApp */}
              <a
                href={`https://wa.me/${WA}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                style={{
                  width: '2.5rem', height: '2.5rem', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.18s, border-color 0.18s',
                }}
              >
                <MessageCircle style={{ width: '1rem', height: '1rem', color: '#9CA3AF' }} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.75rem' }}>
              <div style={{ width: '1.5rem', height: '2px', background: '#08A9EE', borderRadius: '2px', flexShrink: 0 }} />
              <h3 style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
                Quick Links
              </h3>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
              {quickLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    style={{ fontSize: '0.9375rem', color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#08A9EE'}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = '#9CA3AF'}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Our Locations */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.75rem' }}>
              <div style={{ width: '1.5rem', height: '2px', background: '#08A9EE', borderRadius: '2px', flexShrink: 0 }} />
              <h3 style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
                Our Locations
              </h3>
            </div>
            <div className="space-y-7">
              {offices.map((o) => (
                <div key={o.city}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <MapPin className="w-4 h-4 text-[#08A9EE] flex-shrink-0" />
                    <span className="text-white font-semibold text-sm">{o.city}</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed pl-5 mb-1.5">
                    {o.address}
                  </p>
                  <a
                    href={o.mapHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pl-5 text-xs font-semibold text-[#08A9EE] hover:underline"
                  >
                    Get Directions →
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.75rem' }}>
              <div style={{ width: '1.5rem', height: '2px', background: '#08A9EE', borderRadius: '2px', flexShrink: 0 }} />
              <h3 style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0 }}>
                Contact Us
              </h3>
            </div>
            <div className="space-y-6">
              <div>
                <div className="text-xs text-gray-500 mb-1">Surat</div>
                <a
                  href="tel:+919723097832"
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-[#08A9EE] transition-colors font-medium"
                >
                  <Phone className="w-4 h-4 text-[#08A9EE] flex-shrink-0" />
                  +91 97230 97832
                </a>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Ahmedabad</div>
                <a
                  href="tel:+919723097832"
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-[#08A9EE] transition-colors font-medium"
                >
                  <Phone className="w-4 h-4 text-[#08A9EE] flex-shrink-0" />
                  +91 97230 97832
                </a>
              </div>
              <a
                href={`https://wa.me/${WA}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-green-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                WhatsApp Us
              </a>
              <a
                href="mailto:Budheshkalsariya1@gmail.com"
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#08A9EE] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#08A9EE] flex-shrink-0" />
                Budheshkalsariya1@gmail.com
              </a>

              {/* Available 24/7 badge */}
              <div className="mt-2 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                Available 24/7
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-sm text-gray-500">
            © 2026 Radhe Krishna Cabs &amp; Taxi Service. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
