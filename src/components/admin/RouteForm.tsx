'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle, Calculator, MapPin, RefreshCw } from 'lucide-react'

interface City    { id: number; name: string; slug: string }
interface Vehicle { id: number; name: string; perKmRate: number; minimumFare: number; minimumBillableKm: number; roundTripRateMultiplier: number }
interface Route   { id: number; slug: string; originCityId: number; destinationCityId: number; distanceKm?: string | number | null; estimatedHours?: string | number | null; description?: string | null; highlights?: string | null; seoTitle?: string | null; seoDescription?: string | null; seoKeywords?: string | null; isActive: boolean }

interface Props { route?: Route; cities: City[]; vehicles?: Vehicle[] }

// FARE FORMULA: km × perKmRate only — no minimum fare, no floor
function calcFare(km: number, v: Vehicle): number {
  return Math.ceil(km * v.perKmRate)
}

export default function RouteForm({ route, cities, vehicles = [] }: Props) {
  const router  = useRouter()
  const isEdit  = !!route

  const [form, setForm] = useState({
    originCityId:      String(route?.originCityId ?? ''),
    destinationCityId: String(route?.destinationCityId ?? ''),
    slug:              route?.slug ?? '',
    distanceKm:        route?.distanceKm   != null ? String(Number(route.distanceKm))   : '',
    estimatedHours:    route?.estimatedHours != null ? String(Number(route.estimatedHours)) : '',
    description:       route?.description  ?? '',
    highlights:        route?.highlights   ?? '',
    seoTitle:          route?.seoTitle     ?? '',
    seoDescription:    route?.seoDescription ?? '',
    seoKeywords:       route?.seoKeywords  ?? '',
    isActive:          route?.isActive ?? true,
  })

  // For type-or-select: track typed text separately from matched city id
  const [originText, setOriginText] = useState(() => cities.find(c => c.id === route?.originCityId)?.name ?? '')
  const [destText,   setDestText]   = useState(() => cities.find(c => c.id === route?.destinationCityId)?.name ?? '')

  const [errors,      setErrors]      = useState<Record<string, string>>({})
  const [loading,     setLoading]     = useState(false)
  const [saved,       setSaved]       = useState(false)
  const [serverError, setServerError] = useState('')
  const [fetchingKm,  setFetchingKm]  = useState(false)
  const [kmSource,    setKmSource]    = useState('')
  const [liveFares,   setLiveFares]   = useState<{ vehicleId: number; name: string; rate: number; oneWay: number; roundTrip: number }[]>([])

  const update = (f: string, v: string | boolean) => {
    setForm(p => ({ ...p, [f]: v }))
    if (errors[f]) setErrors(p => ({ ...p, [f]: '' }))
    setServerError('')
  }

  const originName = cities.find(c => String(c.id) === form.originCityId)?.name ?? originText
  const destName   = cities.find(c => String(c.id) === form.destinationCityId)?.name ?? destText

  // Auto-fetch distance from API
  const fetchDistance = useCallback(async (oName: string, dName: string) => {
    if (!oName || !dName || oName === dName) return
    setFetchingKm(true); setKmSource('')
    try {
      const res  = await fetch(`/api/admin/routes/distance?origin=${encodeURIComponent(oName)}&dest=${encodeURIComponent(dName)}`)
      const data = await res.json()
      if (res.ok && data.km) {
        setForm(p => ({ ...p, distanceKm: String(data.km), estimatedHours: String(data.hrs ?? '') }))
        setKmSource(data.source === 'google_maps' ? '📍 Google Maps' : '✅ Verified table')
      } else {
        setKmSource('⚠️ Not found — enter manually')
      }
    } catch { setKmSource('⚠️ Error — enter manually') }
    finally  { setFetchingKm(false) }
  }, [])

  // Fetch when both cities are known
  useEffect(() => {
    const o = cities.find(c => String(c.id) === form.originCityId)?.name ?? originText
    const d = cities.find(c => String(c.id) === form.destinationCityId)?.name ?? destText
    if (o && d && o !== d) fetchDistance(o, d)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.originCityId, form.destinationCityId])

  // Live fare recalculation
  useEffect(() => {
    const km = parseFloat(form.distanceKm)
    if (!km || km <= 0 || !vehicles.length) { setLiveFares([]); return }
    setLiveFares(vehicles.map(v => ({
      vehicleId: v.id,
      name:      v.name,
      rate:      v.perKmRate,
      oneWay:    calcFare(km, v),
      roundTrip: calcFare(km * 2, v),
    })))
  }, [form.distanceKm, vehicles])

  // Auto slug
  useEffect(() => {
    if (isEdit || form.slug) return
    const o = cities.find(c => String(c.id) === form.originCityId)
    const d = cities.find(c => String(c.id) === form.destinationCityId)
    if (o && d) setForm(p => ({ ...p, slug: `${o.slug}-to-${d.slug}-taxi` }))
  }, [form.originCityId, form.destinationCityId, cities, isEdit, form.slug])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.originCityId && !originText)      e.originCityId      = 'Enter origin city'
    if (!form.destinationCityId && !destText)   e.destinationCityId = 'Enter destination city'
    if (originName && destName && originName === destName) e.destinationCityId = 'Must be different cities'
    if (form.distanceKm && isNaN(Number(form.distanceKm))) e.distanceKm = 'Must be a number'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ve = validate()
    if (Object.keys(ve).length) { setErrors(ve); return }

    setLoading(true); setServerError('')
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
        // Save fares if we have km + vehicles
        if (form.distanceKm && liveFares.length > 0) {
          const routeId = isEdit ? route!.id : data.route?.id
          if (routeId && originName && destName) {
            await fetch('/api/admin/routes/update-fares', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                originCity: originName,
                destCity:   destName,
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
    } catch { setServerError('Network error') }
    finally  { setLoading(false) }
  }

  const inp = (f: string) =>
    `w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628] ${errors[f] ? 'border-red-400' : 'border-gray-200'}`

  const Err = ({ f }: { f: string }) =>
    errors[f] ? <p className="mt-1 text-xs text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[f]}</p> : null

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {serverError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{serverError}
        </div>
      )}

      {/* ── City Selection: type OR select ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-1 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#f59e0b]" /> Route Cities
        </h2>
        <p className="text-xs text-gray-400 mb-4">Type a city name or select from the dropdown list.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Origin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Origin City <span className="text-red-500">*</span></label>
            <input
              list="origin-list"
              value={originText}
              onChange={e => {
                const v = e.target.value
                setOriginText(v)
                const match = cities.find(c => c.name.toLowerCase() === v.toLowerCase())
                update('originCityId', match ? String(match.id) : '')
              }}
              placeholder="e.g. Ahmedabad"
              disabled={isEdit}
              className={inp('originCityId')}
            />
            <datalist id="origin-list">
              {cities.map(c => <option key={c.id} value={c.name} />)}
            </datalist>
            <Err f="originCityId" />
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Destination City <span className="text-red-500">*</span></label>
            <input
              list="dest-list"
              value={destText}
              onChange={e => {
                const v = e.target.value
                setDestText(v)
                const match = cities.find(c => c.name.toLowerCase() === v.toLowerCase())
                update('destinationCityId', match ? String(match.id) : '')
              }}
              placeholder="e.g. Surat"
              disabled={isEdit}
              className={inp('destinationCityId')}
            />
            <datalist id="dest-list">
              {cities.map(c => <option key={c.id} value={c.name} />)}
            </datalist>
            <Err f="destinationCityId" />
          </div>
        </div>

        {/* Show fetch button if both cities typed but maybe not in list */}
        {originText && destText && originText !== destText && (
          <button type="button"
            onClick={() => fetchDistance(originText, destText)}
            disabled={fetchingKm}
            className="mt-3 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100 disabled:opacity-50 flex items-center gap-1.5">
            {fetchingKm ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Get Distance for {originText} → {destText}
          </button>
        )}
      </div>

      {/* ── Distance & Auto Fare ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#f59e0b]" /> Distance &amp; Auto Fare
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700">Distance (km)</label>
              <span className="text-xs">
                {fetchingKm && <span className="text-blue-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />Fetching…</span>}
                {!fetchingKm && kmSource && <span className={kmSource.startsWith('⚠️') ? 'text-amber-600' : 'text-green-600'}>{kmSource}</span>}
              </span>
            </div>
            <div className="flex gap-2">
              <input type="number" value={form.distanceKm} min={1} step="1"
                onChange={e => { update('distanceKm', e.target.value); setKmSource('✏️ Manual') }}
                placeholder="Auto-fetched or type manually"
                className={inp('distanceKm')} />
              <button type="button" title="Re-fetch distance"
                onClick={() => fetchDistance(originName, destName)}
                disabled={fetchingKm || !originName || !destName}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <Err f="distanceKm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Est. Travel Hours</label>
            <input type="number" value={form.estimatedHours} min={0} step="0.5"
              onChange={e => update('estimatedHours', e.target.value)}
              placeholder="Auto-calculated" className={inp('estimatedHours')} />
          </div>
        </div>

        {/* Live fare table */}
        {liveFares.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">
              Fares for <strong>{originName} → {destName}</strong> ({form.distanceKm} km):
            </p>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Vehicle</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Rate</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Total Fare ({form.distanceKm} km × rate)</th>
                  </tr>
                </thead>
                <tbody>
                  {liveFares.map(f => {
                    const km = parseFloat(form.distanceKm)
                    return (
                      <tr key={f.vehicleId} className="border-t border-gray-100">
                        <td className="px-4 py-2.5 font-medium text-gray-800">{f.name}</td>
                        <td className="px-4 py-2.5 text-gray-500 text-xs">₹{f.rate}/km</td>
                        <td className="px-4 py-2.5 font-bold text-[#0a1628] text-base">
                          {km} × ₹{f.rate} = <span className="text-green-700">₹{f.oneWay}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-green-600 mt-2">✅ Fares auto-saved with route when you click Save.</p>
          </div>
        )}

        {!liveFares.length && originName && destName && !form.distanceKm && !fetchingKm && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            ⚠️ Distance not found automatically for this city pair. Enter km above — fares calculate instantly.
          </p>
        )}
      </div>

      {/* ── Slug ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug (auto-generated)</label>
        <input type="text" value={form.slug} onChange={e => update('slug', e.target.value.toLowerCase())}
          placeholder="auto-generated from city names" className={inp('slug')} />
        <p className="text-xs text-gray-400 mt-1">Leave blank to auto-generate.</p>
      </div>

      {/* ── Description ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Description (optional)</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Route Description</label>
          <textarea value={form.description} onChange={e => update('description', e.target.value)}
            rows={2} placeholder="Brief description"
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
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">🔍 SEO</h2>
          {originName && destName && (
            <button type="button"
              onClick={() => {
                update('seoTitle',       `${originName} to ${destName} Taxi | Radhe Krishna Cab`)
                update('seoDescription', `Book ${originName} to ${destName} taxi at best rates. AC cab, verified drivers, fixed price. Call +91 97230 97832.`)
                update('seoKeywords',    `${originName} to ${destName} taxi, ${destName} to ${originName} taxi, ${originName} ${destName} cab, one way taxi ${originName}`)
              }}
              className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-100">
              💡 Auto-fill SEO
            </button>
          )}
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">SEO Title</label>
            <span className={`text-xs ${form.seoTitle.length > 60 ? 'text-yellow-500' : 'text-gray-400'}`}>{form.seoTitle.length}/60</span>
          </div>
          <input type="text" value={form.seoTitle} onChange={e => update('seoTitle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628]" />
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">SEO Description</label>
            <span className={`text-xs ${form.seoDescription.length > 160 ? 'text-yellow-500' : 'text-gray-400'}`}>{form.seoDescription.length}/160</span>
          </div>
          <textarea value={form.seoDescription} onChange={e => update('seoDescription', e.target.value)}
            rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628] resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
          <input type="text" value={form.seoKeywords} onChange={e => update('seoKeywords', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628]" />
        </div>
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
          {saved   && <CheckCircle className="w-4 h-4 text-green-400" />}
          {saved ? 'Saved!' : loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Route + Save Fares'}
        </button>
        <a href="/admin/routes" className="text-sm text-gray-500 hover:text-gray-900">Cancel</a>
      </div>
    </form>
  )
}
