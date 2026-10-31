'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface City {
  id: number
  name: string
  slug: string
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
}

export default function RouteForm({ route, cities }: Props) {
  const router = useRouter()
  const isEdit = !!route

  const [form, setForm] = useState({
    originCityId: String(route?.originCityId ?? ''),
    destinationCityId: String(route?.destinationCityId ?? ''),
    slug: route?.slug ?? '',
    distanceKm: route?.distanceKm != null ? String(Number(route.distanceKm)) : '',
    estimatedHours: route?.estimatedHours != null ? String(Number(route.estimatedHours)) : '',
    description: route?.description ?? '',
    highlights: route?.highlights ?? '',
    seoTitle: route?.seoTitle ?? '',
    seoDescription: route?.seoDescription ?? '',
    seoKeywords: route?.seoKeywords ?? '',
    isActive: route?.isActive ?? true,
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

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.originCityId) e.originCityId = 'Select origin city'
    if (!form.destinationCityId) e.destinationCityId = 'Select destination city'
    if (form.originCityId && form.destinationCityId && form.originCityId === form.destinationCityId) {
      e.destinationCityId = 'Origin and destination must be different'
    }
    if (form.slug && !/^[a-z0-9-]+$/.test(form.slug)) e.slug = 'Slug must be lowercase letters, numbers and hyphens'
    if (form.distanceKm && isNaN(Number(form.distanceKm))) e.distanceKm = 'Must be a number'
    if (form.estimatedHours && isNaN(Number(form.estimatedHours))) e.estimatedHours = 'Must be a number'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ve = validate()
    if (Object.keys(ve).length) { setErrors(ve); return }

    setLoading(true)
    setServerError('')
    try {
      const url = isEdit ? `/api/admin/routes/${route!.id}` : '/api/admin/routes'
      const method = isEdit ? 'PATCH' : 'POST'
      const payload: Record<string, unknown> = {
        isActive: form.isActive,
        description: form.description.trim() || null,
        highlights: form.highlights.trim() || null,
        distanceKm: form.distanceKm ? Number(form.distanceKm) : null,
        estimatedHours: form.estimatedHours ? Number(form.estimatedHours) : null,
        seoTitle: form.seoTitle.trim() || null,
        seoDescription: form.seoDescription.trim() || null,
        seoKeywords: form.seoKeywords.trim() || null,
      }
      if (!isEdit) {
        payload.originCityId = parseInt(form.originCityId)
        payload.destinationCityId = parseInt(form.destinationCityId)
        if (form.slug) payload.slug = form.slug
      } else {
        if (form.slug) payload.slug = form.slug
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
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

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      {serverError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{serverError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Origin City <span className="text-red-500">*</span></label>
          <select value={form.originCityId} onChange={(e) => update('originCityId', e.target.value)}
            disabled={isEdit} className={inp('originCityId')}>
            <option value="">Select origin…</option>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {isEdit && <p className="text-xs text-gray-400 mt-1">Origin city cannot be changed after creation.</p>}
          <Err f="originCityId" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Destination City <span className="text-red-500">*</span></label>
          <select value={form.destinationCityId} onChange={(e) => update('destinationCityId', e.target.value)}
            disabled={isEdit} className={inp('destinationCityId')}>
            <option value="">Select destination…</option>
            {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {isEdit && <p className="text-xs text-gray-400 mt-1">Destination city cannot be changed after creation.</p>}
          <Err f="destinationCityId" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug (auto-generated if blank)</label>
        <input type="text" value={form.slug} onChange={(e) => update('slug', e.target.value.toLowerCase())}
          placeholder="e.g. ahmedabad-to-surat" className={inp('slug')} />
        <p className="text-xs text-gray-400 mt-1">Used in URL. Leave blank to auto-generate from city names.</p>
        <Err f="slug" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
          <input type="number" value={form.distanceKm} min={0} step="0.1"
            onChange={(e) => update('distanceKm', e.target.value)}
            placeholder="e.g. 265" className={inp('distanceKm')} />
          <p className="text-xs text-gray-400 mt-1">Used for fare calculation when no price override set</p>
          <Err f="distanceKm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
          <input type="number" value={form.estimatedHours} min={0} step="0.5"
            onChange={(e) => update('estimatedHours', e.target.value)}
            placeholder="e.g. 3.5" className={inp('estimatedHours')} />
          <Err f="estimatedHours" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
        <textarea value={form.description} onChange={(e) => update('description', e.target.value)}
          rows={2} placeholder="Route description"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628] resize-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Highlights (optional)</label>
        <textarea value={form.highlights} onChange={(e) => update('highlights', e.target.value)}
          rows={2} placeholder="Key highlights of this route"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628] resize-none" />
      </div>

      {/* SEO Section */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
          <span className="text-[#0a1628]">🔍</span> SEO Settings
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Custom SEO for this route page. Leave blank to use auto-generated values.
        </p>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">SEO Title</label>
              <span className={`text-xs ${form.seoTitle.length > 60 ? 'text-yellow-500' : 'text-gray-400'}`}>
                {form.seoTitle.length}/60
              </span>
            </div>
            <input type="text" value={form.seoTitle} onChange={(e) => update('seoTitle', e.target.value)}
              placeholder="e.g. Ahmedabad to Surat Taxi — Best Cab Service | Radhe Krishna Cab"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628]" />
            <p className="text-xs text-gray-400 mt-1">Shown in Google search results (30–60 chars ideal)</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">SEO Description</label>
              <span className={`text-xs ${form.seoDescription.length > 160 ? 'text-yellow-500' : 'text-gray-400'}`}>
                {form.seoDescription.length}/160
              </span>
            </div>
            <textarea value={form.seoDescription} onChange={(e) => update('seoDescription', e.target.value)}
              rows={3} placeholder="e.g. Book affordable one-way taxi from Ahmedabad to Surat. AC vehicles, verified drivers, fixed price. Starting ₹1200. Call now."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628] resize-none" />
            <p className="text-xs text-gray-400 mt-1">Shown below title in Google (80–160 chars ideal)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Keywords</label>
            <input type="text" value={form.seoKeywords} onChange={(e) => update('seoKeywords', e.target.value)}
              placeholder="e.g. Ahmedabad to Surat taxi, Surat to Ahmedabad cab, one way taxi Ahmedabad Surat"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628]" />
            <p className="text-xs text-gray-400 mt-1">
              Comma-separated. Include: <strong>both directions</strong> (A→B and B→A), city names, &quot;taxi&quot;, &quot;cab&quot;, &quot;one way&quot;
            </p>
          </div>

          {/* Keyword suggestion */}
          {form.originCityId && form.destinationCityId && (() => {
            const origin = cities.find(c => String(c.id) === form.originCityId)?.name ?? ''
            const dest = cities.find(c => String(c.id) === form.destinationCityId)?.name ?? ''
            if (!origin || !dest) return null
            const suggested = `${origin} to ${dest} taxi, ${dest} to ${origin} taxi, ${origin} to ${dest} cab, ${dest} to ${origin} cab, one way taxi ${origin} ${dest}, cab service ${origin}, outstation cab ${origin}, ${origin} ${dest} taxi fare`
            return (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-700 mb-1">💡 Suggested Keywords:</p>
                <p className="text-xs text-blue-600 font-mono leading-relaxed">{suggested}</p>
                <button type="button" onClick={() => update('seoKeywords', suggested)}
                  className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded font-medium hover:bg-blue-700">
                  Use These Keywords
                </button>
              </div>
            )
          })()}
        </div>
      </div>

      <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700">
        <input type="checkbox" checked={form.isActive} onChange={(e) => update('isActive', e.target.checked)}
          className="w-4 h-4 text-[#0a1628] rounded border-gray-300" />
        Active (visible in route listings)
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading || saved}
          className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {saved && <CheckCircle className="w-4 h-4 text-green-400" />}
          {saved ? 'Saved!' : loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Route'}
        </button>
        <a href="/admin/routes" className="text-sm text-gray-500 hover:text-gray-900">Cancel</a>
      </div>
    </form>
  )
}
