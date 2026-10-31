'use client'

import { useState } from 'react'
import { EnquirySchema, buildWhatsAppMessage, type EnquiryFormData } from '@/lib/validation/enquiry'
import {
  MessageCircle, User, Phone, MapPin, Calendar, Clock, Car,
  ChevronDown, AlertCircle,
} from 'lucide-react'

const defaultVehicles = [
  'Sedan (Dzire / Etios)',
  'Ertiga (6 Seater)',
  'Kia Carens (6 Seater)',
  'Innova Crysta (7 Seater)',
  'Any Available Vehicle',
]

type FieldErrors = Partial<Record<keyof EnquiryFormData, string>>

interface Props {
  whatsappNumber?: string
  vehicles?: { name: string }[]
}

export default function EnquiryForm({ whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832', vehicles }: Props) {
  const vehicleList = vehicles?.map((v) => v.name) ?? defaultVehicles

  const empty: EnquiryFormData = {
    name: '', mobile: '', pickup: '', destination: '',
    date: '', time: '', vehicle: '', message: '',
  }
  const [form, setForm] = useState<EnquiryFormData>(empty)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitted, setSubmitted] = useState(false)

  const update = (f: keyof EnquiryFormData, v: string) => {
    setForm((p) => ({ ...p, [f]: v }))
    if (errors[f]) setErrors((p) => ({ ...p, [f]: undefined }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = EnquirySchema.safeParse(form)
    if (!result.success) {
      const fe: FieldErrors = {}
      result.error.issues.forEach((err) => {
        const key = err.path[0] as keyof EnquiryFormData
        if (key) fe[key] = err.message
      })
      setErrors(fe)
      return
    }
    const msg = buildWhatsAppMessage(result.data)
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`
    const opened = window.open(url, '_blank', 'noopener,noreferrer')
    if (!opened) {
      alert('Could not open WhatsApp. Please contact us at +91 97230 97832.')
      return
    }
    setSubmitted(true)
  }

  const inp = (f: keyof EnquiryFormData) =>
    `w-full px-4 py-2.5 rounded-lg border bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] transition-colors ${errors[f] ? 'border-red-400' : 'border-gray-300'}`

  const Err = ({ f }: { f: keyof EnquiryFormData }) =>
    errors[f] ? (
      <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        {errors[f]}
      </p>
    ) : null

  if (submitted) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">WhatsApp Opened!</h3>
        <p className="text-gray-600 mb-2 text-sm">
          Your enquiry message is ready in WhatsApp.
        </p>
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
          <strong>Please press Send</strong> in WhatsApp to submit your enquiry.
          No booking is confirmed until our team contacts you.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm(empty) }}
          className="px-5 py-2 bg-[#0a1628] text-white rounded-lg text-sm font-medium hover:bg-[#1a3a6b] transition-colors"
        >
          New Enquiry
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User className="inline w-3.5 h-3.5 mr-1" />Full Name <span className="text-red-500">*</span>
          </label>
          <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
            placeholder="Your full name" className={inp('name')} />
          <Err f="name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Phone className="inline w-3.5 h-3.5 mr-1" />Mobile <span className="text-red-500">*</span>
          </label>
          <input type="tel" value={form.mobile} onChange={(e) => update('mobile', e.target.value)}
            placeholder="10-digit mobile" maxLength={10} className={inp('mobile')} />
          <Err f="mobile" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <MapPin className="inline w-3.5 h-3.5 mr-1" />Pickup Address <span className="text-red-500">*</span>
        </label>
        <input type="text" value={form.pickup} onChange={(e) => update('pickup', e.target.value)}
          placeholder="City or full pickup address" className={inp('pickup')} />
        <Err f="pickup" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <MapPin className="inline w-3.5 h-3.5 mr-1" />Drop Address <span className="text-red-500">*</span>
        </label>
        <input type="text" value={form.destination} onChange={(e) => update('destination', e.target.value)}
          placeholder="Destination city or address" className={inp('destination')} />
        <Err f="destination" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline w-3.5 h-3.5 mr-1" />Travel Date <span className="text-red-500">*</span>
          </label>
          <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)}
            min={new Date().toISOString().split('T')[0]} className={inp('date')} />
          <Err f="date" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Clock className="inline w-3.5 h-3.5 mr-1" />Pickup Time <span className="text-red-500">*</span>
          </label>
          <input type="time" value={form.time} onChange={(e) => update('time', e.target.value)}
            className={inp('time')} />
          <Err f="time" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          <Car className="inline w-3.5 h-3.5 mr-1" />Vehicle Preference <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select value={form.vehicle} onChange={(e) => update('vehicle', e.target.value)}
            className={`${inp('vehicle')} appearance-none pr-8`}>
            <option value="">Select vehicle</option>
            {vehicleList.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-3 w-4 h-4 text-gray-400" />
        </div>
        <Err f="vehicle" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Notes (optional)
        </label>
        <textarea value={form.message} onChange={(e) => update('message', e.target.value)}
          placeholder="Any special requirements" rows={2}
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] resize-none" />
      </div>

      <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-2.5">
        Clicking below opens WhatsApp with your message. Press <strong>Send</strong> there to submit.
        This is enquiry-only — no booking is made until our team confirms.
      </p>

      <button type="submit"
        className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-all hover:scale-[1.01] shadow-md">
        <MessageCircle className="w-5 h-5" />
        Send Enquiry via WhatsApp
      </button>
    </form>
  )
}
