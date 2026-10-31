'use client'

import { useState } from 'react'
import { Search, ChevronDown, ChevronUp, Save, CheckCircle2, Lightbulb, AlertCircle } from 'lucide-react'

interface RouteItem {
  id: number
  slug: string
  distanceKm: number | null
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string | null
  originCity: { name: string }
  destinationCity: { name: string }
}

interface SaveState {
  [key: number]: 'idle' | 'saving' | 'saved' | 'error'
}

export default function RouteSeoManager({ routes }: { routes: RouteItem[] }) {
  const [data, setData] = useState<RouteItem[]>(routes)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [saveState, setSaveState] = useState<SaveState>({})
  const [search, setSearch] = useState('')

  const filtered = data.filter(r =>
    r.originCity.name.toLowerCase().includes(search.toLowerCase()) ||
    r.destinationCity.name.toLowerCase().includes(search.toLowerCase())
  )

  const update = (id: number, field: keyof RouteItem, value: string) => {
    setData(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }

  const suggest = (r: RouteItem) => {
    const o = r.originCity.name
    const d = r.destinationCity.name
    return `${o} to ${d} taxi, ${d} to ${o} taxi, ${o} to ${d} cab, ${d} to ${o} cab, one way taxi ${o} ${d}, ${o} ${d} cab fare, cab service ${o}, outstation taxi ${o}, taxi from ${o} to ${d}, ${o} to ${d} car rental Gujarat`
  }

  const suggestTitle = (r: RouteItem) => {
    const o = r.originCity.name
    const d = r.destinationCity.name
    return `${o} to ${d} Taxi — Affordable One Way Cab | Radhe Krishna Cab`
  }

  const suggestDesc = (r: RouteItem) => {
    const o = r.originCity.name
    const d = r.destinationCity.name
    const km = r.distanceKm ? `~${r.distanceKm} km. ` : ''
    return `Book one-way taxi from ${o} to ${d}. ${km}AC vehicles, verified drivers, fixed price. Call +91 97230 97832.`
  }

  const save = async (r: RouteItem) => {
    setSaveState(p => ({ ...p, [r.id]: 'saving' }))
    try {
      const res = await fetch(`/api/admin/routes/${r.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seoTitle: r.seoTitle || null,
          seoDescription: r.seoDescription || null,
          seoKeywords: r.seoKeywords || null,
        }),
      })
      if (!res.ok) throw new Error()
      setSaveState(p => ({ ...p, [r.id]: 'saved' }))
      setTimeout(() => setSaveState(p => ({ ...p, [r.id]: 'idle' })), 3000)
    } catch {
      setSaveState(p => ({ ...p, [r.id]: 'error' }))
    }
  }

  const charCount = (s: string | null) => s?.length ?? 0
  const titleColor = (n: number) => n === 0 ? 'text-gray-400' : n < 30 ? 'text-red-500' : n > 65 ? 'text-yellow-500' : 'text-green-600'
  const descColor = (n: number) => n === 0 ? 'text-gray-400' : n < 80 ? 'text-red-500' : n > 165 ? 'text-yellow-500' : 'text-green-600'

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search routes by city name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1628]"
        />
      </div>

      <p className="text-xs text-gray-400">{filtered.length} routes</p>

      {filtered.map((r) => {
        const st = saveState[r.id] ?? 'idle'
        const isOpen = expanded === r.id
        const hasCustomSeo = !!(r.seoTitle || r.seoDescription || r.seoKeywords)

        return (
          <div key={r.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <button
              onClick={() => setExpanded(isOpen ? null : r.id)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-shrink-0 flex items-center gap-1 text-sm font-semibold text-gray-900">
                  <span>{r.originCity.name}</span>
                  <span className="text-[#f59e0b] font-bold mx-1">→</span>
                  <span>{r.destinationCity.name}</span>
                </div>
                {hasCustomSeo && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                    SEO set
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                {st === 'saved' && (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
                {st === 'error' && (
                  <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> Error
                  </span>
                )}
                {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>

            {/* Form */}
            {isOpen && (
              <div className="px-5 pb-5 pt-4 border-t border-gray-100 space-y-4">

                {/* Keyword suggestion box */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs font-semibold text-amber-700">
                      Suggested keywords for this route (includes both directions):
                    </p>
                  </div>
                  <p className="text-xs text-amber-700 font-mono leading-relaxed mb-2">
                    {suggest(r)}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      update(r.id, 'seoKeywords', suggest(r))
                      if (!r.seoTitle) update(r.id, 'seoTitle', suggestTitle(r))
                      if (!r.seoDescription) update(r.id, 'seoDescription', suggestDesc(r))
                    }}
                    className="text-xs bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded font-medium"
                  >
                    Auto-fill All SEO Fields
                  </button>
                </div>

                {/* SEO Title */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">SEO Title</label>
                    <span className={`text-xs font-medium ${titleColor(charCount(r.seoTitle))}`}>
                      {charCount(r.seoTitle)}/65
                    </span>
                  </div>
                  <input
                    type="text"
                    value={r.seoTitle ?? ''}
                    onChange={e => update(r.id, 'seoTitle', e.target.value)}
                    placeholder={suggestTitle(r)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1628]"
                  />
                </div>

                {/* SEO Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">SEO Description</label>
                    <span className={`text-xs font-medium ${descColor(charCount(r.seoDescription))}`}>
                      {charCount(r.seoDescription)}/165
                    </span>
                  </div>
                  <textarea
                    value={r.seoDescription ?? ''}
                    onChange={e => update(r.id, 'seoDescription', e.target.value)}
                    rows={2}
                    placeholder={suggestDesc(r)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1628] resize-none"
                  />
                </div>

                {/* Keywords */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                    Keywords <span className="text-gray-400 font-normal normal-case">(comma-separated)</span>
                  </label>
                  <textarea
                    value={r.seoKeywords ?? ''}
                    onChange={e => update(r.id, 'seoKeywords', e.target.value)}
                    rows={3}
                    placeholder={suggest(r)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1628] resize-none font-mono"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    ✅ Include <strong>both directions</strong> (A→B and B→A) &nbsp;
                    ✅ Include &quot;taxi&quot;, &quot;cab&quot;, &quot;one way&quot;, city names &nbsp;
                    ✅ Add fare-related terms
                  </p>
                </div>

                {/* Google Preview */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Google Preview</p>
                  <div className="text-[#1a0dab] text-base font-medium truncate">
                    {r.seoTitle || suggestTitle(r)}
                  </div>
                  <div className="text-[#006621] text-xs">
                    radhekrishanacab.com/routes/{r.slug}
                  </div>
                  <div className="text-gray-600 text-sm mt-0.5 line-clamp-2">
                    {r.seoDescription || suggestDesc(r)}
                  </div>
                </div>

                {/* Save */}
                <div className="flex justify-end">
                  <button
                    onClick={() => save(r)}
                    disabled={st === 'saving'}
                    className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
                  >
                    <Save className="w-4 h-4" />
                    {st === 'saving' ? 'Saving…' : 'Save SEO'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
