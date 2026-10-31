'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Phone, MessageCircle, Shield, User, IndianRupee, Headphones,
  MapPin, Calendar, Clock, Car, CheckCircle2, ChevronDown,
} from 'lucide-react'

interface Props {
  vehicles?: { name: string }[]
}

const WA    = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832'
const PHONE = process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? '+91 97230 97832'

const TRUST_BADGES = [
  { icon: Shield,      line1: 'Clean &',     line2: 'Well Maintained Cars' },
  { icon: User,        line1: 'Experienced', line2: '& Professional Drivers' },
  { icon: IndianRupee, line1: 'Transparent', line2: 'Pricing' },
  { icon: Headphones,  line1: '24/7',         line2: 'Customer Support' },
]

export const VEHICLE_OPTIONS = [
  'Swift Dzire (4+1 Seater)',
  'Hyundai Aura (4+1 Seater)',
  'Maruti Suzuki Ertiga (6+1 Seater)',
  'Kia Carens (6+1 Seater)',
  'Toyota Innova Cresta (6+1 Seater)',
  'Tata Winger (12 Seater)',
  'Tempo Traveller (14 Seater)',
  'Tempo Traveller (17 Seater)',
  'Urbania Traveller (17 Seater)',
]

function formatDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}-${m}-${y}`
}

function formatTime(isoTime?: string): string {
  if (!isoTime) return ''
  const [h, m] = isoTime.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

export default function HeroSection({ vehicles: _vehicles }: Props) {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    pickup: '',
    drop: '',
    date: '',
    time: '',
    vehicle: VEHICLE_OPTIONS[0],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const update = (f: string, v: string) => {
    setForm((p) => ({ ...p, [f]: v }))
    if (errors[f]) setErrors((p) => ({ ...p, [f]: '' }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!form.name.trim() || form.name.trim().length < 2) {
      newErrors.name = 'Please enter your name'
    }
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone.trim())) {
      newErrors.phone = 'Enter valid 10-digit number'
    }
    if (!form.pickup.trim()) {
      newErrors.pickup = 'Enter pickup location'
    }
    if (!form.drop.trim()) {
      newErrors.drop = 'Enter drop location'
    }
    if (!form.date) {
      newErrors.date = 'Select travel date'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)

    // Save enquiry in database
    try {
      const messageBody = [
        `Pickup: ${form.pickup}`,
        `Drop: ${form.drop}`,
        `Date: ${form.date}`,
        form.time ? `Pickup Time: ${formatTime(form.time)}` : 'Pickup Time: Anytime',
        `Vehicle: ${form.vehicle}`,
        'Source: Homepage Banner Booking Form',
      ].join('\n')

      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          subject: `Trip: ${form.pickup} to ${form.drop} (${form.vehicle})`,
          message: messageBody,
        }),
      })
    } catch {
      // Non-blocking
    }

    // Open WhatsApp with formatted booking message
    const waLines = [
      'Radhe Krishna Cab - New Booking Enquiry',
      '',
      `Name: ${form.name}`,
      `Phone: +91 ${form.phone}`,
      `Pickup: ${form.pickup}`,
      `Drop: ${form.drop}`,
      `Date: ${formatDate(form.date)}`,
      `Pickup Time: ${form.time ? formatTime(form.time) : 'Anytime'}`,
      `Vehicle: ${form.vehicle}`,
      '',
      'Sent from radhekrishanacab.com',
    ]

    const waUrl = `https://wa.me/${WA}?text=${encodeURIComponent(waLines.join('\n'))}`
    const a = document.createElement('a')
    a.href = waUrl
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    setLoading(false)
    setSubmitted(true)
  }

  const waMsg = encodeURIComponent(
    'Hello! I want to book a taxi from Radhe Krishna Cab. Please share available options and fares.'
  )

  const rawPhone = PHONE.replace(/[^0-9+]/g, '')
  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <style>{`
        .hero-section {
          position: relative;
          overflow: hidden;
          background: #060a1a;
        }
        .hero-inner {
          position: relative;
          z-index: 2;
          max-width: 1280px;
          margin: 0 auto;
          padding: 56px 24px 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }
        .hero-text {
          width: 53%;
          min-width: 280px;
          padding: 24px 0;
        }
        .hero-form-col {
          width: 47%;
          display: flex;
          justify-content: flex-end;
          padding: 16px 0;
        }
        .hero-btns { display: flex; flex-wrap: wrap; gap: 12px; }

        .booking-card {
          width: 100%;
          max-width: 470px;
          background: #ffffff;
          border-radius: 20px;
          padding: 22px 22px 20px;
          box-shadow: 0 24px 60px -10px rgba(0, 0, 0, 0.48), 0 0 0 1px rgba(255, 255, 255, 0.15);
        }

        .form-input-box {
          position: relative;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          transition: all 0.18s ease;
        }
        .form-input-box:hover {
          border-color: #cbd5e1;
        }
        .form-input-box:focus-within {
          background: #ffffff;
          border-color: #08A9EE;
          box-shadow: 0 0 0 3px rgba(8, 169, 238, 0.14);
        }
        .form-input-box.has-error {
          border-color: #ef4444;
          background: #fff5f5;
        }

        @media (max-width: 1023px) {
          .hero-inner {
            flex-direction: column;
            padding: 64px 24px 72px;
            gap: 36px;
            min-height: auto;
            width: 100%;
            max-width: 860px;
          }
          .hero-text {
            width: 100%;
            padding: 0;
            text-align: center;
          }
          .hero-overline {
            justify-content: center !important;
            margin-left: auto;
            margin-right: auto;
            margin-bottom: 18px;
          }
          .hero-desc {
            margin-left: auto !important;
            margin-right: auto !important;
            text-align: center !important;
            max-width: 720px !important;
            font-size: 15.5px !important;
          }
          .hero-badges {
            margin-left: auto !important;
            margin-right: auto !important;
            max-width: 100% !important;
            width: 100%;
          }
          .hero-btns {
            justify-content: center !important;
            margin-left: auto;
            margin-right: auto;
            width: 100%;
          }
          .hero-form-col {
            width: 100%;
            display: flex;
            justify-content: center;
            padding: 0;
          }
          .booking-card {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto;
            padding: 28px 24px 24px;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
          }
        }
        @media (max-width: 640px) {
          .hero-inner {
            padding: 48px 16px 60px;
            gap: 28px;
          }
          .hero-btns {
            flex-direction: column;
            justify-content: center;
            width: 100%;
          }
          .hero-btns a {
            justify-content: center;
            width: 100%;
          }
          .booking-card {
            padding: 20px 16px 18px;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto;
          }
        }
      `}</style>

      <section className="hero-section">

        {/* Background image */}
        <Image
          src="/images/vehicles/Cheerful Road Trip Farewell.png"
          alt="Radhe Krishna Cab"
          fill
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center center' }}
          priority
        />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background: 'linear-gradient(135deg, rgba(4,8,20,0.96) 0%, rgba(4,8,20,0.90) 50%, rgba(4,8,20,0.82) 100%)',
        }} />

        {/* Content */}
        <div className="hero-inner">

          {/* Left Text Column */}
          <div className="hero-text">

            {/* Overline */}
            <div className="hero-overline flex items-center justify-center lg:justify-start gap-2.5 mb-4">
              <div style={{ width: 28, height: 2, background: '#08A9EE', borderRadius: 2 }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#08A9EE', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                Your Trusted Travel Partner
              </span>
            </div>

            {/* Heading */}
            <h1 className="text-center lg:text-left mx-auto lg:mx-0" style={{ fontSize: 'clamp(1.85rem, 3.6vw, 3.35rem)', fontWeight: 900, color: '#ffffff', lineHeight: 1.15, margin: '0 0 16px' }}>
              Safe Journey is<br />
              Our <span style={{ color: '#08A9EE' }}>Priority.</span>
            </h1>

            {/* Description */}
            <p className="hero-desc text-center lg:text-left mx-auto lg:mx-0" style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.72)', lineHeight: 1.8, margin: '0 auto 24px', maxWidth: '100%' }}>
              Reliable, Comfortable &amp; Affordable Taxi Service Across India.
              Explore tourist places, pilgrimage sites, business destinations and more with us.
            </p>

            {/* Trust badges */}
            <div className="hero-badges grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3.5 mb-7 w-full max-w-full lg:max-w-[460px] mx-auto lg:mx-0">
              {TRUST_BADGES.map((b) => (
                <div key={b.line2} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <b.icon size={14} color="#08A9EE" />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>{b.line1}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.3 }}>{b.line2}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Action Buttons */}
            <div className="hero-btns flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <a
                href={`tel:${rawPhone}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#08A9EE', color: '#fff', fontWeight: 700, fontSize: 13.5,
                  padding: '12px 24px', borderRadius: 50, textDecoration: 'none',
                  whiteSpace: 'nowrap', boxShadow: '0 4px 18px rgba(8,169,238,0.40)',
                  transition: 'background 0.15s',
                }}
              >
                <Phone size={15} /> Call Now: {PHONE}
              </a>
              <a
                href={`https://wa.me/${WA}?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#16a34a', color: '#fff', fontWeight: 700, fontSize: 13.5,
                  padding: '12px 24px', borderRadius: 50, textDecoration: 'none',
                  whiteSpace: 'nowrap', boxShadow: '0 4px 18px rgba(22,163,74,0.38)',
                }}
              >
                <MessageCircle size={15} /> Get Quote on WhatsApp
              </a>
            </div>

          </div>

          {/* Right Column: Redesigned Booking Form Card */}
          <div className="hero-form-col">
            <div className="booking-card">
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '28px 12px' }}>
                  <div style={{
                    width: 60, height: 60,
                    borderRadius: '50%',
                    background: '#dcfce7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                    color: '#16a34a',
                    boxShadow: '0 4px 16px rgba(22,163,74,0.18)',
                  }}>
                    <CheckCircle2 size={34} />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#10264A', margin: '0 0 8px' }}>
                    Booking Request Sent!
                  </h3>
                  <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.6, margin: '0 0 20px' }}>
                    WhatsApp has opened with your trip details. Our team will confirm your booking shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setForm({
                        name: '', phone: '', pickup: '', drop: '',
                        date: '', time: '', vehicle: VEHICLE_OPTIONS[0],
                      })
                    }}
                    style={{
                      padding: '11px 26px',
                      background: '#10264A',
                      color: '#ffffff',
                      borderRadius: 10,
                      border: 'none',
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: 'pointer',
                    }}
                  >
                    Book Another Trip
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>

                  {/* Clean, Modern Header without clutter badges */}
                  <div style={{ marginBottom: 18, borderBottom: '1px solid #f1f5f9', paddingBottom: 14 }}>
                    <div style={{
                      height: 3, width: 36,
                      background: 'linear-gradient(90deg, #08A9EE, #10264A)',
                      borderRadius: 2, marginBottom: 8,
                    }} />
                    <h2 style={{ fontSize: 21, fontWeight: 800, color: '#10264A', margin: 0, letterSpacing: '-0.01em' }}>
                      Book Your Cab
                    </h2>
                    <p style={{ fontSize: 12.5, color: '#64748b', margin: '4px 0 0' }}>
                      Fast one-way &amp; outstation cab booking
                    </p>
                  </div>

                  {/* Name + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                        Your Name *
                      </label>
                      <div className={`form-input-box ${errors.name ? 'has-error' : ''}`}>
                        <User size={14} color="#08A9EE" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => update('name', e.target.value)}
                          placeholder="Full Name"
                          style={{
                            width: '100%', padding: '9px 10px 9px 32px',
                            background: 'transparent', border: 'none',
                            fontSize: 13, color: '#0f172a', outline: 'none', fontWeight: 500,
                          }}
                        />
                      </div>
                      {errors.name && <p style={{ fontSize: 10.5, color: '#ef4444', margin: '3px 0 0' }}>{errors.name}</p>}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                        Mobile Number *
                      </label>
                      <div className={`form-input-box ${errors.phone ? 'has-error' : ''}`}>
                        <Phone size={14} color="#08A9EE" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input
                          type="tel"
                          value={form.phone}
                          maxLength={10}
                          onChange={(e) => update('phone', e.target.value.replace(/\D/g, ''))}
                          placeholder="10-digit Mobile"
                          style={{
                            width: '100%', padding: '9px 10px 9px 32px',
                            background: 'transparent', border: 'none',
                            fontSize: 13, color: '#0f172a', outline: 'none', fontWeight: 500,
                          }}
                        />
                      </div>
                      {errors.phone && <p style={{ fontSize: 10.5, color: '#ef4444', margin: '3px 0 0' }}>{errors.phone}</p>}
                    </div>
                  </div>

                  {/* Pickup + Drop Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                        Pickup Location *
                      </label>
                      <div className={`form-input-box ${errors.pickup ? 'has-error' : ''}`}>
                        <MapPin size={14} color="#10b981" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input
                          type="text"
                          value={form.pickup}
                          onChange={(e) => update('pickup', e.target.value)}
                          placeholder="From City / Area"
                          style={{
                            width: '100%', padding: '9px 10px 9px 32px',
                            background: 'transparent', border: 'none',
                            fontSize: 13, color: '#0f172a', outline: 'none', fontWeight: 500,
                          }}
                        />
                      </div>
                      {errors.pickup && <p style={{ fontSize: 10.5, color: '#ef4444', margin: '3px 0 0' }}>{errors.pickup}</p>}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                        Drop Location *
                      </label>
                      <div className={`form-input-box ${errors.drop ? 'has-error' : ''}`}>
                        <MapPin size={14} color="#ef4444" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input
                          type="text"
                          value={form.drop}
                          onChange={(e) => update('drop', e.target.value)}
                          placeholder="To City / Area"
                          style={{
                            width: '100%', padding: '9px 10px 9px 32px',
                            background: 'transparent', border: 'none',
                            fontSize: 13, color: '#0f172a', outline: 'none', fontWeight: 500,
                          }}
                        />
                      </div>
                      {errors.drop && <p style={{ fontSize: 10.5, color: '#ef4444', margin: '3px 0 0' }}>{errors.drop}</p>}
                    </div>
                  </div>

                  {/* Travel Date + Pickup Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-2.5">
                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                        Travel Date *
                      </label>
                      <div className={`form-input-box ${errors.date ? 'has-error' : ''}`}>
                        <Calendar size={14} color="#08A9EE" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input
                          type="date"
                          min={today}
                          value={form.date}
                          onChange={(e) => update('date', e.target.value)}
                          style={{
                            width: '100%', padding: '9px 8px 9px 32px',
                            background: 'transparent', border: 'none',
                            fontSize: 12.5, color: '#0f172a', outline: 'none', fontWeight: 500,
                          }}
                        />
                      </div>
                      {errors.date && <p style={{ fontSize: 10.5, color: '#ef4444', margin: '3px 0 0' }}>{errors.date}</p>}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                        Pickup Time
                      </label>
                      <div className="form-input-box">
                        <Clock size={14} color="#08A9EE" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        <input
                          type="time"
                          value={form.time}
                          onChange={(e) => update('time', e.target.value)}
                          style={{
                            width: '100%', padding: '9px 8px 9px 32px',
                            background: 'transparent', border: 'none',
                            fontSize: 12.5, color: '#0f172a', outline: 'none', fontWeight: 500,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Selection with the 9 specific options */}
                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>
                      Select Vehicle
                    </label>
                    <div className="form-input-box" style={{ position: 'relative' }}>
                      <Car size={15} color="#08A9EE" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                      <select
                        value={form.vehicle}
                        onChange={(e) => update('vehicle', e.target.value)}
                        style={{
                          width: '100%', padding: '10px 32px 10px 34px',
                          background: 'transparent', border: 'none',
                          fontSize: 13, color: '#0f172a', outline: 'none',
                          fontWeight: 600, cursor: 'pointer', appearance: 'none',
                        }}
                      >
                        {VEHICLE_OPTIONS.map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                      <ChevronDown size={14} color="#64748b" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                      padding: '13px 20px',
                      background: loading ? '#94a3b8' : 'linear-gradient(135deg, #08A9EE 0%, #0284c7 100%)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 10,
                      fontWeight: 700,
                      fontSize: 14.5,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      boxShadow: '0 8px 24px -4px rgba(8, 169, 238, 0.45)',
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <MessageCircle size={18} />
                    <span>{loading ? 'Opening WhatsApp…' : 'Book Your Cab on WhatsApp'}</span>
                  </button>

                </form>
              )}
            </div>
          </div>

        </div>
      </section>
    </>
  )
}
