'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/',             label: 'Home' },
  { href: '/about',        label: 'About Us' },
  { href: '/routes',       label: 'Routes' },
  { href: '/vehicles',     label: 'Our Cars' },
  { href: '/blog',         label: 'Blog' },
  { href: '/contact',      label: 'Contact Us' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isLinkActive = (href: string) => {
    if (!pathname) return false
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <header
      style={{
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 88, gap: 16 }}>

          {/* Enlarge Logo */}
          <Link
            href="/"
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              padding: '4px 0',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/radhe-krishana-logo.png"
              alt="Radhe Krishna Cab"
              style={{
                height: 68,
                width: 'auto',
                maxWidth: 240,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </Link>

          {/* Desktop Navigation Menu — single line, 6 items (Services removed), larger bold font */}
          <nav
            className="hidden lg:flex items-center flex-nowrap"
            style={{
              gap: 'clamp(14px, 2vw, 36px)',
              margin: '0 auto',
              whiteSpace: 'nowrap',
            }}
            aria-label="Main navigation"
          >
            {navLinks.map((link) => {
              const active = isLinkActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-bold uppercase tracking-wide transition-all duration-150 whitespace-nowrap"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    fontSize: '15px',
                    color: active ? '#08A9EE' : '#111827',
                    textDecoration: 'none',
                    padding: '8px 4px',
                    borderBottom: active ? '3px solid #08A9EE' : '3px solid transparent',
                    transition: 'color 0.15s ease, border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = '#08A9EE'
                      e.currentTarget.style.borderBottom = '3px solid #08A9EE'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = '#111827'
                      e.currentTarget.style.borderBottom = '3px solid transparent'
                    }
                  }}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop Right Action — Clean Book Your Cab CTA button (Phone number and phone icon removed) */}
          <div
            className="hidden lg:flex items-center flex-shrink-0"
            style={{ whiteSpace: 'nowrap' }}
          >
            <Link
              href="/contact#enquiry"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#08A9EE',
                color: '#ffffff',
                padding: '12px 24px',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 14.5,
                textDecoration: 'none',
                boxShadow: '0 2px 10px rgba(8,169,238,0.28)',
                whiteSpace: 'nowrap',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#0798d4'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#08A9EE'
              }}
            >
              Book Your Cab
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden" style={{ marginLeft: 'auto' }}>
            <button
              style={{
                padding: 10,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {open && (
        <div
          style={{
            background: '#ffffff',
            borderTop: '1px solid #e5e7eb',
            boxShadow: '0 12px 28px rgba(0,0,0,0.1)',
          }}
        >
          <nav
            style={{
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
            }}
          >
            {navLinks.map((link) => {
              const active = isLinkActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-bold uppercase tracking-wide"
                  style={{
                    padding: '12px 14px',
                    borderRadius: 8,
                    fontSize: 15,
                    color: active ? '#08A9EE' : '#111827',
                    background: active ? '#EAF6FF' : 'transparent',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onClick={() => setOpen(false)}
                >
                  <span>{link.label}</span>
                  {active && (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#08A9EE',
                      }}
                    />
                  )}
                </Link>
              )
            })}

            {/* Mobile CTA */}
            <div
              style={{
                paddingTop: 16,
                borderTop: '1px solid #e5e7eb',
                marginTop: 10,
              }}
            >
              <Link
                href="/contact#enquiry"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#08A9EE',
                  color: '#ffffff',
                  padding: '13px',
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: 'none',
                  boxShadow: '0 2px 10px rgba(8,169,238,0.28)',
                }}
                onClick={() => setOpen(false)}
              >
                Book Your Cab
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
