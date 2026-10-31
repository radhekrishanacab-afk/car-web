'use client'

import { useState } from 'react'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface SettingsData {
  id: number | null
  businessName: string
  phone: string
  whatsappNumber: string
  email: string
  address: string
  logoUrl: string | null
  metaDescription: string | null
}

interface Props {
  settings: SettingsData
}

export default function SettingsForm({ settings }: Props) {
  const [form, setForm] = useState({
    businessName: settings.businessName,
    phone: settings.phone,
    whatsappNumber: settings.whatsappNumber,
    email: settings.email ?? '',
    address: settings.address ?? '',
    logoUrl: settings.logoUrl ?? '',
    metaDescription: settings.metaDescription ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [serverError, setServerError] = useState('')

  const update = (f: string, v: string) => {
    setForm((p) => ({ ...p, [f]: v }))
    setSaved(false)
    setServerError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setServerError('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setSaved(true)
      } else {
        setServerError(data.error ?? 'Save failed')
      }
    } catch {
      setServerError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const inp = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628]'

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      {serverError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{serverError}
        </div>
      )}
      {saved && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />Settings saved successfully.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
        <input type="text" value={form.businessName} onChange={(e) => update('businessName', e.target.value)} className={inp} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input type="text" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 97230 97832" className={inp} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
          <input type="text" value={form.whatsappNumber} onChange={(e) => update('whatsappNumber', e.target.value)} placeholder="919723097832" className={inp} />
          <p className="text-xs text-gray-400 mt-1">International format without + or spaces</p>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className={inp} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address / Service Area</label>
        <textarea value={form.address} onChange={(e) => update('address', e.target.value)} rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628] resize-none" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (optional)</label>
        <input type="url" value={form.logoUrl} onChange={(e) => update('logoUrl', e.target.value)} placeholder="https://..." className={inp} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description (optional)</label>
        <textarea value={form.metaDescription} onChange={(e) => update('metaDescription', e.target.value)} rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628] resize-none" />
      </div>

      <div className="pt-2">
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Note: WhatsApp number and phone changes here update the database record.
          Update <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_WHATSAPP_NUMBER</code> in your environment variables and redeploy for immediate effect across all public pages.
        </p>
      </div>
    </form>
  )
}
