'use client'

import { Phone, MessageCircle, Mail, MapPin, Clock, ArrowUpRight } from 'lucide-react'

const contactItems = [
  {
    icon: Phone,
    label: 'Phone / Call',
    value: '+91 97230 97832',
    sub: 'Available 24 × 7',
    href: 'tel:+919723097832',
    gradient: 'linear-gradient(135deg, #0f1e3d 0%, #1a3a6b 100%)',
    iconColor: '#08A9EE',
    glowColor: 'rgba(8,169,238,0.18)',
    badge: '24/7',
  },
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+91 97230 97832',
    sub: 'Tap to chat instantly',
    href: 'https://wa.me/919723097832',
    gradient: 'linear-gradient(135deg, #15803d 0%, #22c55e 100%)',
    iconColor: '#ffffff',
    glowColor: 'rgba(34,197,94,0.18)',
    badge: 'Chat',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'info@radhekrishanacab.com',
    sub: 'We reply within 24 hrs',
    href: 'mailto:info@radhekrishanacab.com',
    gradient: 'linear-gradient(135deg, #0369a1 0%, #08A9EE 100%)',
    iconColor: '#ffffff',
    glowColor: 'rgba(8,169,238,0.18)',
    badge: null,
  },
  {
    icon: MapPin,
    label: 'Service Area',
    value: 'Gujarat & All India',
    sub: '250+ cities covered',
    href: null,
    gradient: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)',
    iconColor: '#ffffff',
    glowColor: 'rgba(217,119,6,0.15)',
    badge: '250+',
  },
  {
    icon: Clock,
    label: 'Business Hours',
    value: 'Open 24 Hours × 7 Days',
    sub: 'Round the clock service (24/7/365)',
    href: null,
    gradient: 'linear-gradient(135deg, #0369a1 0%, #08A9EE 100%)',
    iconColor: '#ffffff',
    glowColor: 'rgba(8,169,238,0.2)',
    badge: '24/7 Open',
  },
]

export default function ContactCards() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {contactItems.map((item) => {
        const Icon = item.icon

        const inner = (
          <>
            {/* Icon box */}
            <div style={{
              width: '3rem', height: '3rem', flexShrink: 0,
              borderRadius: '0.875rem',
              background: item.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 4px 14px ${item.glowColor}`,
            }}>
              <Icon size={19} color={item.iconColor} strokeWidth={2} />
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: '0.6875rem', fontWeight: 600,
                color: '#9CA3AF', letterSpacing: '0.08em',
                textTransform: 'uppercase', marginBottom: '2px',
              }}>
                {item.label}
              </div>
              <div style={{
                fontSize: '0.9375rem', fontWeight: 700,
                color: '#10264A', lineHeight: 1.3,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {item.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginTop: '2px' }}>
                {item.sub}
              </div>
            </div>

            {/* Badge / Arrow */}
            {item.href ? (
              <div style={{
                flexShrink: 0,
                width: '2rem', height: '2rem',
                borderRadius: '50%',
                background: '#EAF6FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <ArrowUpRight size={14} color="#08A9EE" strokeWidth={2.5} />
              </div>
            ) : item.badge ? (
              <div style={{
                flexShrink: 0,
                background: 'linear-gradient(135deg, #EAF6FF, #dbeeff)',
                color: '#0369a1',
                fontSize: '0.6875rem', fontWeight: 700,
                padding: '0.25rem 0.625rem',
                borderRadius: '999px',
                letterSpacing: '0.04em',
              }}>
                {item.badge}
              </div>
            ) : null}
          </>
        )

        const base: React.CSSProperties = {
          display: 'flex', alignItems: 'center', gap: '0.875rem',
          background: '#ffffff',
          border: '1.5px solid #f1f5f9',
          borderRadius: '1rem',
          padding: '0.9rem 1rem',
          textDecoration: 'none',
          transition: 'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.15s ease',
        }

        return item.href ? (
          <a
            key={item.label}
            href={item.href}
            target={item.href.startsWith('http') ? '_blank' : undefined}
            rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            style={base}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = 'rgba(8,169,238,0.35)'
              el.style.boxShadow = `0 6px 24px ${item.glowColor}`
              el.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.borderColor = '#f1f5f9'
              el.style.boxShadow = 'none'
              el.style.transform = 'translateY(0)'
            }}
          >
            {inner}
          </a>
        ) : (
          <div key={item.label} style={base}>{inner}</div>
        )
      })}
    </div>
  )
}
