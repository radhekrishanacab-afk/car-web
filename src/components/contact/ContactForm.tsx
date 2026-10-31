'use client'

import { useState } from 'react'
import { z } from 'zod'
import {
  MessageCircle, User, Phone, Mail,
  AlignLeft, CheckCircle2, AlertCircle,
  MapPin, Calendar, LocateFixed, Loader2, Clock, Car, ChevronDown,
} from 'lucide-react'

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

/* ── Validation schema ── */
const ContactSchema = z.object({
  name:    z.string().min(2, 'Please enter your full name').max(100),
  phone:   z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  email:   z.string().email('Enter a valid email').optional().or(z.literal('')),
  pickup:  z.string().min(2, 'Enter pickup location').max(200),
  drop:    z.string().min(2, 'Enter drop location').max(200),
  date:    z.string().min(1, 'Select travel date'),
  time:    z.string().optional().or(z.literal('')),
  vehicle: z.string().optional().or(z.literal('')),
  message: z.string().max(1000).optional().or(z.literal('')),
})

type FormData = z.infer<typeof ContactSchema>
type FieldErrors = Partial<Record<keyof FormData, string>>

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832'

const empty: FormData = {
  name: '', phone: '', email: '',
  pickup: '', drop: '', date: '', time: '',
  vehicle: VEHICLE_OPTIONS[0], message: '',
}

/* ── Format date DD-MM-YYYY ── */
function formatDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}-${m}-${y}`
}

/* ── Format time 12-hour ── */
function formatTime(isoTime?: string): string {
  if (!isoTime) return ''
  const [h, m] = isoTime.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

/* ── Reverse geocode using OpenStreetMap Nominatim ── */
async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`,
      { headers: { 'User-Agent': 'RadheKrishnaCab/1.0' } }
    )
    const data = await res.json()
    const a = data.address ?? {}
    const parts = [
      a.neighbourhood || a.suburb || a.village || a.road,
      a.city || a.town || a.county,
      a.state,
    ].filter(Boolean)
    return parts.join(', ') || data.display_name?.split(',').slice(0, 3).join(',') || `${lat.toFixed(4)}, ${lon.toFixed(4)}`
  } catch {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`
  }
}

/* ── WhatsApp message — clean, readable ── */
function buildWAMessage(d: FormData): string {
  const lines = [
    'Radhe Krishna Cab - New Booking Enquiry',
    '',
    `Name: ${d.name}`,
    `Phone: +91 ${d.phone}`,
  ]
  if (d.email) lines.push(`Email: ${d.email}`)
  lines.push(
    '',
    `Pickup: ${d.pickup}`,
    `Drop: ${d.drop}`,
    `Date: ${formatDate(d.date)}`,
    `Pickup Time: ${d.time ? formatTime(d.time) : 'Anytime'}`,
    `Vehicle: ${d.vehicle || VEHICLE_OPTIONS[0]}`,
  )
  if (d.message) lines.push('', `Notes: ${d.message}`)
  lines.push('', 'Sent from radhekrishanacab.com')
  return lines.join('\n')
}

export default function ContactForm() {
  const [form, setForm]           = useState<FormData>(empty)
  const [errors, setErrors]       = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [locating, setLocating]   = useState<'pickup' | 'drop' | null>(null)

  const update = (f: keyof FormData, v: string) => {
    setForm(p => ({ ...p, [f]: v }))
    if (errors[f]) setErrors(p => ({ ...p, [f]: undefined }))
  }

  /* ── Get current location → reverse geocode → fill field ── */
  const useMyLocation = (field: 'pickup' | 'drop') => {
    if (!navigator.geolocation) {
      alert('Location not supported in your browser.')
      return
    }
    setLocating(field)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const address = await reverseGeocode(latitude, longitude)
        const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`
        update(field, `${address} (${mapsLink})`)
        setLocating(null)
      },
      (err) => {
        setLocating(null)
        if (err.code === 1) {
          alert('Location permission denied. Please type your location manually.')
        } else {
          alert('Could not get your location. Please type it manually.')
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = ContactSchema.safeParse(form)
    if (!result.success) {
      const fe: FieldErrors = {}
      result.error.issues.forEach(err => {
        const k = err.path[0] as keyof FormData
        if (k && !fe[k]) fe[k] = err.message
      })
      setErrors(fe)
      return
    }

    setLoading(true)
    try {
      const formattedMessage = [
        `Pickup: ${result.data.pickup}`,
        `Drop: ${result.data.drop}`,
        `Date: ${result.data.date}`,
        result.data.time ? `Pickup Time: ${formatTime(result.data.time)}` : 'Pickup Time: Anytime',
        `Vehicle: ${result.data.vehicle || VEHICLE_OPTIONS[0]}`,
        result.data.message ? `Notes: ${result.data.message}` : null,
      ].filter(Boolean).join('\n')

      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: result.data.name,
          phone: result.data.phone,
          email: result.data.email || undefined,
          subject: `Trip: ${result.data.pickup} -> ${result.data.drop} (${result.data.vehicle})`,
          message: formattedMessage,
        }),
      })
    } catch { /* non-blocking */ }

    const url = `https://wa.me/${WA}?text=${encodeURIComponent(buildWAMessage(result.data))}`
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setLoading(false)
    setSubmitted(true)
  }

  const today = new Date().toISOString().split('T')[0]

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
        <div style={{
          width: '5rem', height: '5rem',
          background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
          boxShadow: '0 4px 20px rgba(34,197,94,0.2)',
        }}>
          <CheckCircle2 size={36} color="#16a34a" />
        </div>
        <h3 style={{ color: '#10264A', fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          WhatsApp Opened!
        </h3>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Your trip details are pre-filled. Just press{' '}
          <strong style={{ color: '#16a34a' }}>Send</strong> in WhatsApp to confirm your booking.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm(empty) }}
          style={{
            padding: '0.75rem 2rem', background: '#10264A',
            color: '#fff', borderRadius: '0.75rem', border: 'none',
            fontWeight: 700, fontSize: '0.9375rem', cursor: 'pointer',
          }}
        >
          Book Another Trip
        </button>
      </div>
    )
  }

  /* ── Modern Form UI ── */
  return (
    <>
      <style>{`
        .contact-input-box {
          position: relative;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          transition: all 0.18s ease;
        }
        .contact-input-box:hover {
          border-color: #cbd5e1;
        }
        .contact-input-box:focus-within {
          background: #ffffff;
          border-color: #08A9EE;
          box-shadow: 0 0 0 3px rgba(8, 169, 238, 0.14);
        }
        .contact-input-box.has-error {
          border-color: #ef4444;
          background: #fff5f5;
        }
      `}</style>

      <form onSubmit={handleSubmit} noValidate>

        {/* Name + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
              Your Name *
            </label>
            <div className={`contact-input-box ${errors.name ? 'has-error' : ''}`}>
              <User size={15} color="#08A9EE" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Full Name"
                style={{
                  width: '100%', padding: '10px 12px 10px 36px',
                  background: 'transparent', border: 'none',
                  fontSize: '0.875rem', color: '#0f172a', outline: 'none', fontWeight: 500,
                }}
              />
            </div>
            {errors.name && (
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertCircle size={11} />{errors.name}
              </p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
              Mobile Number *
            </label>
            <div className={`contact-input-box ${errors.phone ? 'has-error' : ''}`}>
              <Phone size={15} color="#08A9EE" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="tel"
                value={form.phone}
                maxLength={10}
                onChange={e => update('phone', e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit number"
                style={{
                  width: '100%', padding: '10px 12px 10px 36px',
                  background: 'transparent', border: 'none',
                  fontSize: '0.875rem', color: '#0f172a', outline: 'none', fontWeight: 500,
                }}
              />
            </div>
            {errors.phone && (
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertCircle size={11} />{errors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Pickup + Drop Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
              Pickup Location *
            </label>
            <div className={`contact-input-box ${errors.pickup ? 'has-error' : ''}`}>
              <MapPin size={15} color="#10b981" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={form.pickup}
                onChange={e => update('pickup', e.target.value)}
                placeholder="City or area name"
                style={{
                  width: '100%', padding: '10px 96px 10px 36px',
                  background: 'transparent', border: 'none',
                  fontSize: '0.875rem', color: '#0f172a', outline: 'none', fontWeight: 500,
                }}
              />
              <button
                type="button"
                onClick={() => useMyLocation('pickup')}
                disabled={locating === 'pickup'}
                title="Use current location"
                style={{
                  position: 'absolute', right: '0.375rem', top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.3rem 0.55rem',
                  background: locating === 'pickup' ? '#e5e7eb' : '#EAF6FF',
                  color: '#0369a1',
                  border: '1px solid rgba(8,169,238,0.3)',
                  borderRadius: '0.5rem',
                  fontSize: '0.6875rem', fontWeight: 700,
                  cursor: locating === 'pickup' ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {locating === 'pickup'
                  ? <><Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> Locating…</>
                  : <><LocateFixed size={11} /> My Location</>
                }
              </button>
            </div>
            {errors.pickup && (
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertCircle size={11} />{errors.pickup}
              </p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
              Drop Location *
            </label>
            <div className={`contact-input-box ${errors.drop ? 'has-error' : ''}`}>
              <MapPin size={15} color="#ef4444" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                value={form.drop}
                onChange={e => update('drop', e.target.value)}
                placeholder="Destination city or area"
                style={{
                  width: '100%', padding: '10px 96px 10px 36px',
                  background: 'transparent', border: 'none',
                  fontSize: '0.875rem', color: '#0f172a', outline: 'none', fontWeight: 500,
                }}
              />
              <button
                type="button"
                onClick={() => useMyLocation('drop')}
                disabled={locating === 'drop'}
                title="Use current location"
                style={{
                  position: 'absolute', right: '0.375rem', top: '50%',
                  transform: 'translateY(-50%)',
                  display: 'flex', alignItems: 'center', gap: '0.25rem',
                  padding: '0.3rem 0.55rem',
                  background: locating === 'drop' ? '#e5e7eb' : '#EAF6FF',
                  color: '#0369a1',
                  border: '1px solid rgba(8,169,238,0.3)',
                  borderRadius: '0.5rem',
                  fontSize: '0.6875rem', fontWeight: 700,
                  cursor: locating === 'drop' ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {locating === 'drop'
                  ? <><Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> Locating…</>
                  : <><LocateFixed size={11} /> My Location</>
                }
              </button>
            </div>
            {errors.drop && (
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertCircle size={11} />{errors.drop}
              </p>
            )}
          </div>
        </div>

        {/* Travel Date + Travel Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
              Travel Date *
            </label>
            <div className={`contact-input-box ${errors.date ? 'has-error' : ''}`}>
              <Calendar size={15} color="#08A9EE" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="date"
                min={today}
                value={form.date}
                onChange={e => update('date', e.target.value)}
                style={{
                  width: '100%', padding: '10px 10px 10px 36px',
                  background: 'transparent', border: 'none',
                  fontSize: '0.875rem', color: '#0f172a', outline: 'none', fontWeight: 500,
                }}
              />
            </div>
            {errors.date && (
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertCircle size={11} />{errors.date}
              </p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
              Pickup Time
            </label>
            <div className="contact-input-box">
              <Clock size={15} color="#08A9EE" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="time"
                value={form.time}
                onChange={e => update('time', e.target.value)}
                style={{
                  width: '100%', padding: '10px 10px 10px 36px',
                  background: 'transparent', border: 'none',
                  fontSize: '0.875rem', color: '#0f172a', outline: 'none', fontWeight: 500,
                }}
              />
            </div>
          </div>
        </div>

        {/* Vehicle Selection + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
              Select Vehicle
            </label>
            <div className="contact-input-box" style={{ position: 'relative' }}>
              <Car size={15} color="#08A9EE" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <select
                value={form.vehicle}
                onChange={e => update('vehicle', e.target.value)}
                style={{
                  width: '100%', padding: '11px 34px 11px 36px',
                  background: 'transparent', border: 'none',
                  fontSize: '0.875rem', color: '#0f172a', outline: 'none',
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

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
              Email Address (Optional)
            </label>
            <div className={`contact-input-box ${errors.email ? 'has-error' : ''}`}>
              <Mail size={15} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="email"
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="your.email@example.com"
                style={{
                  width: '100%', padding: '10px 12px 10px 36px',
                  background: 'transparent', border: 'none',
                  fontSize: '0.875rem', color: '#0f172a', outline: 'none', fontWeight: 500,
                }}
              />
            </div>
            {errors.email && (
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <AlertCircle size={11} />{errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Message / Special Requests */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
            Message / Special Requests
          </label>
          <div className="contact-input-box">
            <textarea
              value={form.message}
              onChange={e => update('message', e.target.value)}
              placeholder="Number of passengers, luggage, any special pickup notes…"
              rows={3}
              style={{
                width: '100%', padding: '10px 12px',
                background: 'transparent', border: 'none',
                fontSize: '0.875rem', color: '#0f172a', outline: 'none', resize: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
            padding: '13px 20px',
            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #08A9EE 0%, #0284c7 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 8px 24px -4px rgba(8, 169, 238, 0.45)',
            transition: 'all 0.18s ease',
          }}
        >
          <MessageCircle size={18} />
          {loading ? 'Opening WhatsApp…' : 'Book Your Cab on WhatsApp'}
        </button>

      </form>
    </>
  )
}
