'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface Vehicle {
  id: number
  name: string
  slug: string
  description: string
  imageUrl?: string | null
  passengerCapacity: number
  luggageCapacity: number
  perKmRate: string | number
  minimumFare: string | number
  minimumBillableKm?: string | number | null
  roundTripRateMultiplier: string | number
  isActive: boolean
  displayOrder: number
}

interface Props {
  vehicle?: Vehicle
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function VehicleForm({ vehicle }: Props) {
  const router = useRouter()
  const isEdit = !!vehicle

  const [form, setForm] = useState({
    name: vehicle?.name ?? '',
    slug: vehicle?.slug ?? '',
    description: vehicle?.description ?? '',
    imageUrl: vehicle?.imageUrl ?? '',
    passengerCapacity: String(vehicle?.passengerCapacity ?? 4),
    luggageCapacity: String(vehicle?.luggageCapacity ?? 2),
    perKmRate: vehicle?.perKmRate != null ? String(Number(vehicle.perKmRate)) : '',
    minimumFare: vehicle?.minimumFare != null ? String(Number(vehicle.minimumFare)) : '',
    minimumBillableKm: vehicle?.minimumBillableKm != null ? String(Number(vehicle.minimumBillableKm)) : '',
    roundTripRateMultiplier: vehicle?.roundTripRateMultiplier != null ? String(Number(vehicle.roundTripRateMultiplier)) : '1.9',
    isActive: vehicle?.isActive ?? true,
    displayOrder: String(vehicle?.displayOrder ?? 0),
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [serverError, setServerError] = useState('')

  const update = (f: string, v: string | boolean) => {
    setForm((p) => ({ ...p, [f]: v }))
    if (errors[f]) setErrors((p) => ({ ...p, [f]: '' }))
    setServerError('')
  }

  const autoSlug = () => {
    if (!isEdit && !form.slug) update('slug', slugify(form.name))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.slug.trim()) e.slug = 'Slug is required'
    else if (!/^[a-z0-9-]+$/.test(form.slug)) e.slug = 'Lowercase letters, numbers and hyphens only'
    if (!form.description.trim()) e.description = 'Description is required'
    if (!form.passengerCapacity || isNaN(Number(form.passengerCapacity))) e.passengerCapacity = 'Required'
    if (form.luggageCapacity === '' || isNaN(Number(form.luggageCapacity))) e.luggageCapacity = 'Required'
    if (!form.perKmRate || isNaN(Number(form.perKmRate)) || Number(form.perKmRate) <= 0) e.perKmRate = 'Required — positive number'
    if (!form.minimumFare || isNaN(Number(form.minimumFare)) || Number(form.minimumFare) <= 0) e.minimumFare = 'Required — positive number'
    if (form.imageUrl && !/^https?:\/\//.test(form.imageUrl)) e.imageUrl = 'Must be a valid URL'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ve = validate()
    if (Object.keys(ve).length) { setErrors(ve); return }

    setLoading(true)
    setServerError('')
    try {
      const url = isEdit ? `/api/admin/vehicles/${vehicle!.id}` : '/api/admin/vehicles'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim(),
          imageUrl: form.imageUrl.trim() || null,
          passengerCapacity: parseInt(form.passengerCapacity),
          luggageCapacity: parseInt(form.luggageCapacity),
          perKmRate: Number(form.perKmRate),
          minimumFare: Number(form.minimumFare),
          minimumBillableKm: form.minimumBillableKm ? Number(form.minimumBillableKm) : null,
          roundTripRateMultiplier: Number(form.roundTripRateMultiplier) || 1.9,
          isActive: form.isActive,
          displayOrder: parseInt(form.displayOrder) || 0,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSaved(true)
        setTimeout(() => router.push('/admin/vehicles'), 800)
      } else {
        setServerError(data.error ?? 'Save failed')
      }
    } catch {
      setServerError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const inp = (f: string) =>
    `w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628] ${errors[f] ? 'border-red-400' : 'border-gray-200'}`

  const Err = ({ f }: { f: string }) =>
    errors[f] ? <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[f]}</p> : null

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      {serverError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{serverError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Name <span className="text-red-500">*</span></label>
          <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
            onBlur={autoSlug} placeholder="e.g. Innova Crysta" className={inp('name')} />
          <Err f="name" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug <span className="text-red-500">*</span></label>
          <input type="text" value={form.slug} onChange={(e) => update('slug', e.target.value.toLowerCase())}
            placeholder="e.g. innova-crysta" className={inp('slug')} />
          <Err f="slug" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
        <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
          rows={2} placeholder="Brief description of the vehicle"
          className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628] resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`} />
        <Err f="description" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
        <input type="url" value={form.imageUrl} onChange={(e) => update('imageUrl', e.target.value)}
          placeholder="https://..." className={inp('imageUrl')} />
        <Err f="imageUrl" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Passengers <span className="text-red-500">*</span></label>
          <input type="number" value={form.passengerCapacity} min={1} max={20}
            onChange={(e) => update('passengerCapacity', e.target.value)} className={inp('passengerCapacity')} />
          <Err f="passengerCapacity" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Luggage Bags <span className="text-red-500">*</span></label>
          <input type="number" value={form.luggageCapacity} min={0} max={20}
            onChange={(e) => update('luggageCapacity', e.target.value)} className={inp('luggageCapacity')} />
          <Err f="luggageCapacity" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
          <input type="number" value={form.displayOrder} min={0}
            onChange={(e) => update('displayOrder', e.target.value)} className={inp('displayOrder')} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Per km Rate (₹) <span className="text-red-500">*</span></label>
          <input type="number" value={form.perKmRate} min={0} step="0.5"
            onChange={(e) => update('perKmRate', e.target.value)}
            placeholder="e.g. 12" className={inp('perKmRate')} />
          <Err f="perKmRate" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Fare (₹) <span className="text-red-500">*</span></label>
          <input type="number" value={form.minimumFare} min={0}
            onChange={(e) => update('minimumFare', e.target.value)}
            placeholder="e.g. 500" className={inp('minimumFare')} />
          <Err f="minimumFare" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Min. Billable km</label>
          <input type="number" value={form.minimumBillableKm} min={0} step="0.5"
            onChange={(e) => update('minimumBillableKm', e.target.value)}
            placeholder="e.g. 50" className={inp('minimumBillableKm')} />
          <p className="text-xs text-gray-400 mt-1">Floor for fare calculation</p>
        </div>
      </div>

      <div className="max-w-xs">
        <label className="block text-sm font-medium text-gray-700 mb-1">Round-trip Rate Multiplier</label>
        <input type="number" value={form.roundTripRateMultiplier} min={1} max={5} step="0.1"
          onChange={(e) => update('roundTripRateMultiplier', e.target.value)}
          className={inp('roundTripRateMultiplier')} />
        <p className="text-xs text-gray-400 mt-1">One-way fare × multiplier = round-trip estimate. Default: 1.9</p>
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700">
        <input type="checkbox" checked={form.isActive} onChange={(e) => update('isActive', e.target.checked)}
          className="w-4 h-4 text-[#0a1628] rounded border-gray-300" />
        Active (shown on public pages)
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading || saved}
          className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {saved && <CheckCircle className="w-4 h-4 text-green-400" />}
          {saved ? 'Saved!' : loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Vehicle'}
        </button>
        <a href="/admin/vehicles" className="text-sm text-gray-500 hover:text-gray-900">Cancel</a>
      </div>
    </form>
  )
}
