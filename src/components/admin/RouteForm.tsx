'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle, Calculator, MapPin, RefreshCw } from 'lucide-react'

interface City {
  id: number
  name: string
  slug: string
}

interface Vehicle {
  id: number
  name: string
  perKmRate: number
  minimumFare: number
  minimumBillableKm: number
  roundTripRateMultiplier: number
}

interface Route {
  id: number
  slug: string
  originCityId: number
  destinationCityId: number
  distanceKm?: string | number | null
  estimatedHours?: string | number | null
  description?: string | null
  highlights?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoKeywords?: string | null
  isActive: boolean
}

interface Props {
  route?: Route
  cities: City[]
  vehicles?: Vehicle[]
}

function calcFare(km: number, v: Vehicle): number {
  const billable = Math.max(km, v.minimumBillableKm)
  return Math.ceil(Math.max(billable * v.perKmRate, v.minimumFare) / 100) * 100
}

export default function RouteForm({ route, cities, vehicles = [] }: Props) {
  const router = useRouter()
  const isEdit = !!route

  const [form, setForm] = useState({
    originCityId:      String(route?.originCityId ?? ''),
    destinationCityId: String(route?.destinationCityId ?? ''),
    slug:              route?.slug ?? '',
    distanceKm:        route?.distanceKm != null ? String(Number(route.distanceKm)) : '',
    estimatedHours:    route?.estimatedHours != null ? String(Number(route.estimatedHours)) : '',
    description:       route?.description ?? '',
    highlights:        route?.highlights ?? '',
    seoTitle:          route?.seoTitle ?? '',
    seoDescription:    route?.seoDescription ?? '',
    seoKeywords:       route?.seoKeywords ?? '',
    isActive:          route?.isActive ?? true,
  })

  const [errors,      setErrors]      = useState<Record<string, string>>({})
  const [loading,     setLoading]     = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [serverError, setServerError] = useState('')
  const [fetchingKm,  setFetchingKm]  = useState(false)
  const [kmSource,    setKmSource]    = useState<string>('')
  const [liveFares,   setLiveFares]   = useState<{ vehicleId: number; name: string; oneWay: number; roundTrip: number }[]>([])

  const update = (f: string, v: string | boolean) => {
    setForm(p => ({ ...p, [f]: v }))
    if (errors[f]) setErrors(p => ({ ...p, [f]: '' }))
    setServerError('')
  }

  // Auto-fetch km when both cities selected
  const fetchDistance = useCallback(async (originId: string, destId: string) => {
    if (!originId || !destId || originId === destId) return
    const origin = cities.find(c => String(c.id) === originId)?.name
    const dest   = cities.find(c => String(c.id) === destId)?.name
    if (!origin || !dest) return

    setFetchingKm(true)
    setKmSource('')
    try {
      const res  = await fetch(`/api/admin/routes/distance?origin=${encodeURIComponent(origin)}&dest=${encodeURIComponent(dest)}`)
      const data = await res.json()
      if (res.ok && data.km) {
        setForm(p => ({ ...p, distanceKm: String(data.km), estimatedHours: String(data.hrs ?? '') }))
        setKmSource(data.source === 'google_maps' ? '📍 Google Maps (live)' : '✅ Verified table')
      }
    } catch { /* ignore */ }
    finally { setFetchingKm(false) }
  }, [cities])

  // When cities change, fetch distance
  useEffect(() => {
    if (form.originCityId && form.destinationCityId && form.originCityId !== form.destinationCityId) {
      fetchDistance(form.originCityId, form.destinationCityId)
    }
  }, [form.originCityId, form.destinationCityId, fetchDistance])

  // Live fare preview
  useEffect(() => {
    const km = parseFloat(form.distanceKm)
    if (!km || !vehicles.length) { setLiveFares([]); return }
    setLiveFares(vehicles.map(v => ({
      vehicleId: v.id,
      name:      v.name,
      oneWay:    calcFare(km, v),
      roundTrip: Math.ceil(calcFare(km, v) * v.roundTripRateMultiplier / 100) * 100,
    })))
  }, [form.distanceKm, vehicles])

  // Auto-generate slug
  useEffect(() => {
    if (isEdit || form.slug) return
    const o = cities.find(c => String(c.id) === form.originCityId)
    const d = cities.find(c => String(c.id) === form.destinationCityId)
    if (o && d) {
      setForm(p => ({ ...p, slug: `${o.slug}-to-${d.slug}-taxi` }))
    }
  }, [form.originCityId, form.destinationCityId, cities, isEdit, form.slug])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.originCityId)      e.originCityId      = 'Select origin city'
    if (!form.destinationCityId) e.destinationCityId = 'Select destination city'
    if (form.originCityId && form.destinationCityId && form.originCityId === form.destinationCityId)
      e.destinationCityId = 'Origin and destination must be different'
    if (form.distanceKm && isNaN(Number(form.distanceKm))) e.distanceKm = 'Must be a number'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ve = validate()
    if (Object.keys(ve).length) { setErrors(ve); return }

    setLoading(true)
    setServerError('')
    try {
      const url    = isEdit ? `/api/admin/routes/${route!.id}` : '/api/admin/routes'
      const method = isEdit ? 'PATCH' : 'POST'
      const payload: Record<string, unknown> = {
        isActive:       form.isActive,
        description:    form.description.trim()    || null,
        highlights:     form.highlights.trim()     || null,
        distanceKm:     form.distanceKm     ? Number(form.distanceKm)     : null,
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : null,
        seoTitle:       form.seoTitle.trim()       || null,
        seoDescription: form.seoDescription.trim() || null,
        seoKeywords:    form.seoKeywords.trim()    || null,
      }
      if (!isEdit) {
        payload.originCityId      = parseInt(form.originCityId)
        payload.destinationCityId = parseInt(form.destinationCityId)
        if (form.slug) payload.slug = form.slug
      } else {
        if (form.slug) payload.slug = form.slug
      }

      const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (res.ok) {
        // If we have km, also save prices
        if (form.distanceKm && vehicles.length > 0) {
          const routeId = isEdit ? route!.id : data.route?.id
          if (routeId) {
            await fetch('/api/admin/routes/update-fares', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                originCity: cities.find(c => String(c.id) === form.originCityId)?.name,
                destCity:   cities.find(c => String(c.id) === form.destinationCityId)?.name,
                distanceKm: Number(form.distanceKm),
                prices: liveFares.map(f => ({ vehicleId: f.vehicleId, oneWayFare: f.oneWay, roundTrip: f.roundTrip })),
              }),
            })
          }
        }
        setSaved(true)
        setTimeout(() => router.push('/admin/routes'), 800)
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

  const originName = cities.find(c => String(c.id) === form.originCityId)?.name ?? ''
  const destName   = cities.find(c => String(c.id) === form.destinationCityId)?.name ?? ''

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {serverError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{serverError}
        </div>
      )}

      {/* ── City Selection ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-[#f59e0b]" /> Route Cities</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Origin City <span className="text-red-500">*</span></label>
            <select value={form.originCityId} onChange={e => update('originCityId', e.target.value)}
              disabled={isEdit} className={inp('originCityId')}>
              <option value="">Select origin…</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Err f="originCityId" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination City <span className="text-red-500">*</span></label>
            <select value={form.destinationCityId} onChange={e => update('destinationCityId', e.target.value)}
              disabled={isEdit} className={inp('destinationCityId')}>
              <option value="">Select destination…</option>
              {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <Err f="destinationCityId" />
          </div>
        </div>
      </div>

      {/* ── Auto Distance + Fare Calculator ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#f59e0b]" /> Distance &amp; Auto Fare
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Distance (km)</label>
              {fetchingKm && <span className="text-xs text-blue-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Fetching…</span>}
              {kmSource && !fetchingKm && <span className="text-xs text-green-600">{kmSource}</span>}
            </div>
            <div className="flex gap-2">
              <input type="number" value={form.distanceKm} min={1} step="1"
                onChange={e => { update('distanceKm', e.target.value); setKmSource('✏️ Manual') }}
                placeholder="Auto-fetched or enter manually" className={inp('distanceKm')} />
              {form.originCityId && form.destinationCityId && (
                <button type="button" onClick={() => fetchDistance(form.originCityId, form.destinationCityId)}
                  disabled={fetchingKm}
                  className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                  title="Re-fetch distance">
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
            <Err f="distanceKm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Est. Hours</label>
            <input type="number" value={form.estimatedHours} min={0} step="0.5"
              onChange={e => update('estimatedHours', e.target.value)}
              placeholder="Auto-calculated" className={inp('estimatedHours')} />
          </div>
        </div>

        {/* Live fare preview */}
        {liveFares.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">
              Auto-calculated fares for <strong>{originName} → {destName}</strong> ({form.distanceKm} km):
            </p>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Vehicle</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Rate</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Formula</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">One-Way</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Round Trip</th>
                  </tr>
                </thead>
                <tbody>
                  {liveFares.map(f => (
                    <tr key={f.vehicleId} className="border-t border-gray-100">
                      <td className="px-4 py-2.5 font-medium text-gray-800">{f.name}</td>
                      <td className="px-4 py-2.5 text-gray-500 text-xs">
                        ₹{vehicles.find(v => v.id === f.vehicleId)?.perKmRate}/km
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">
                        max({form.distanceKm},{vehicles.find(v => v.id === f.vehicleId)?.minimumBillableKm}) × ₹{vehicles.find(v => v.id === f.vehicleId)?.perKmRate}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-[#0a1628]">₹{f.oneWay.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2.5 text-gray-600">₹{f.roundTrip.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-green-600 mt-2">✅ These fares will be saved automatically when you click Save Route.</p>
          </div>
        )}

        {!liveFares.length && form.originCityId && form.destinationCityId && !form.distanceKm && !fetchingKm && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            ⚠️ Distance not found automatically. Please enter km manually above — fares will calculate instantly.
          </div>
        )}
      </div>

      {/* ── Slug ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug</label>
        <input type="text" value={form.slug} onChange={e => update('slug', e.target.value.toLowerCase())}
          placeholder="auto-generated" className={inp('slug')} />
        <p className="text-xs text-gray-400 mt-1">Auto-generated from city names. Leave blank to keep auto.</p>
        <Err f="slug" />
      </div>

      {/* ── Description ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Description (optional)</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Route Description</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)}
            rows={2} placeholder="Brief description of this route"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628] resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Highlights</label>
          <textarea value={form.highlights} onChange={e => update('highlights', e.target.value)}
            rows={2} placeholder="Key highlights"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628] resize-none" />
        </div>
      </div>

      {/* ── SEO ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">🔍 SEO Settings</h2>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">SEO Title</label>
            <span className={`text-xs ${form.seoTitle.length > 60 ? 'text-yellow-500' : 'text-gray-400'}`}>{form.seoTitle.length}/60</span>
          </div>
          <input type="text" value={form.seoTitle} onChange={e => update('seoTitle', e.target.value)}
            placeholder={originName && destName ? `${originName} to ${destName} Taxi | Radhe Krishna Cab` : 'SEO title'}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628]" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">SEO Description</label>
            <span className={`text-xs ${form.seoDescription.length > 160 ? 'text-yellow-500' : 'text-gray-400'}`}>{form.seoDescription.length}/160</span>
          </div>
          <textarea value={form.seoDescription} onChange={e => update('seoDescription', e.target.value)}
            rows={3} placeholder={originName && destName ? `Book ${originName} to ${destName} taxi at best rates. AC cab, verified drivers, fixed fares.` : 'SEO description'}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628] resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
          <input type="text" value={form.seoKeywords} onChange={e => update('seoKeywords', e.target.value)}
            placeholder={originName && destName ? `${originName} to ${destName} taxi, ${destName} to ${originName} cab` : 'keywords'}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628]" />
        </div>
        {originName && destName && (
          <button type="button"
            onClick={() => {
              update('seoTitle', `${originName} to ${destName} Taxi | One Way Cab | Radhe Krishna Cab`)
              update('seoDescription', `Book ${originName} to ${destName} taxi at best rates. AC cab, verified drivers, fixed price. Call +91 97230 97832.`)
              update('seoKeywords', `${originName} to ${destName} taxi, ${destName} to ${originName} taxi, ${originName} ${destName} cab, one way taxi ${originName}`)
            }}
            className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium">
            💡 Auto-fill SEO from city names
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700">
          <input type="checkbox" checked={form.isActive} onChange={e => update('isActive', e.target.checked)}
            className="w-4 h-4 text-[#0a1628] rounded border-gray-300" />
          Active (visible in route listings)
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading || saved}
          className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {saved && <CheckCircle className="w-4 h-4 text-green-400" />}
          {saved ? 'Saved!' : loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Route + Save Fares'}
        </button>
        <a href="/admin/routes" className="text-sm text-gray-500 hover:text-gray-900">Cancel</a>
      </div>
    </form>
  )
}
