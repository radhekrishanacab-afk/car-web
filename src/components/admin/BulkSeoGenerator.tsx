'use client'

import { useState, useMemo } from 'react'
import {
  Zap, Search, CheckCircle2, AlertCircle, RefreshCw,
  Eye, EyeOff, Download, ChevronDown, ChevronUp,
} from 'lucide-react'

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

type GenerateMode = 'missing_only' | 'all'
type SaveState = 'idle' | 'loading' | 'done' | 'error'

interface BulkResult {
  routeId: number
  route: string
  status: 'generated' | 'skipped' | 'error'
  reason?: string
}

export default function BulkSeoGenerator({ routes }: { routes: RouteItem[] }) {
  const [mode, setMode] = useState<GenerateMode>('missing_only')
  const [overwriteManual, setOverwriteManual] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())
  const [saveState, setSaveState] = useState<SaveState>('idle')
  const [results, setResults] = useState<BulkResult[] | null>(null)
  const [summary, setSummary] = useState<{ total: number; generated: number; skipped: number } | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [previewId, setPreviewId] = useState<number | null>(null)
  const [previewData, setPreviewData] = useState<{ seoTitle: string; seoDescription: string; seoKeywords: string } | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return routes.filter(
      (r) =>
        r.originCity.name.toLowerCase().includes(q) ||
        r.destinationCity.name.toLowerCase().includes(q)
    )
  }, [routes, search])

  const missingRoutes = useMemo(
    () => routes.filter((r) => !r.seoTitle && !r.seoDescription),
    [routes]
  )

  // Select/deselect helpers
  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => setSelectedIds(new Set(filtered.map((r) => r.id)))
  const selectMissing = () => setSelectedIds(new Set(missingRoutes.map((r) => r.id)))
  const clearSelection = () => setSelectedIds(new Set())

  const targetIds = selectedIds.size > 0 ? Array.from(selectedIds) : routes.map((r) => r.id)

  // Preview single route SEO
  const handlePreview = async (routeId: number) => {
    if (previewId === routeId) {
      setPreviewId(null)
      setPreviewData(null)
      return
    }
    setPreviewId(routeId)
    setPreviewLoading(true)
    setPreviewData(null)
    try {
      const res = await fetch(`/api/admin/seo/routes?routeId=${routeId}`)
      if (res.ok) {
        const data = await res.json()
        setPreviewData(data.generated)
      }
    } catch {
      // silent
    } finally {
      setPreviewLoading(false)
    }
  }

  // Run bulk generation
  const handleGenerate = async () => {
    if (targetIds.length === 0) return
    setSaveState('loading')
    setResults(null)
    setSummary(null)
    setShowResults(false)
    try {
      const res = await fetch('/api/admin/seo/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          routeIds: targetIds,
          mode,
          overwriteManual,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSaveState('error')
        return
      }
      setSaveState('done')
      setResults(data.results)
      setSummary(data.summary)
      setShowResults(true)
    } catch {
      setSaveState('error')
    }
  }

  // Export results as CSV
  const exportResults = () => {
    if (!results) return
    const header = 'Route,Status,Reason'
    const rows = results.map((r) => `"${r.route}","${r.status}","${r.reason ?? ''}"`)
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'seo-generation-results.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const btnLabel = () => {
    if (saveState === 'loading') return 'Generating…'
    const count = selectedIds.size > 0 ? selectedIds.size : (mode === 'missing_only' ? missingRoutes.length : routes.length)
    if (mode === 'missing_only') return `Generate Missing SEO (${count} routes)`
    return `Generate SEO for ${count} route${count !== 1 ? 's' : ''}`
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header bar */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          {/* Mode toggle */}
          <div className="flex items-center gap-1 bg-gray-200 rounded-lg p-0.5">
            {([
              { value: 'missing_only', label: 'Missing Only' },
              { value: 'all', label: 'All Routes' },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setMode(opt.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  mode === opt.value
                    ? 'bg-white text-[#0a1628] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Overwrite toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-gray-600">
            <input
              type="checkbox"
              checked={overwriteManual}
              onChange={(e) => setOverwriteManual(e.target.checked)}
              className="w-3.5 h-3.5 rounded"
            />
            Overwrite manually set SEO
          </label>

          {/* Status chips */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              {routes.filter((r) => r.seoTitle || r.seoDescription).length} have SEO
            </span>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
              {missingRoutes.length} missing
            </span>
          </div>
        </div>
      </div>

      {/* Route selector */}
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter routes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0a1628]"
            />
          </div>
          <button onClick={selectAll} className="text-xs text-[#1a3a6b] hover:text-[#f59e0b] font-medium">
            Select all ({filtered.length})
          </button>
          <button onClick={selectMissing} className="text-xs text-amber-600 hover:text-amber-700 font-medium">
            Select missing ({missingRoutes.length})
          </button>
          {selectedIds.size > 0 && (
            <button onClick={clearSelection} className="text-xs text-gray-400 hover:text-gray-600 font-medium">
              Clear ({selectedIds.size})
            </button>
          )}
        </div>

        {/* Route list — scrollable */}
        <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-100 divide-y divide-gray-50">
          {filtered.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No routes match your search.</p>
          ) : (
            filtered.map((r) => {
              const hasSeo = !!(r.seoTitle || r.seoDescription)
              const isSelected = selectedIds.has(r.id)
              const isPreviewing = previewId === r.id

              return (
                <div key={r.id} className={`flex items-center gap-3 px-4 py-2.5 ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(r.id)}
                    className="w-3.5 h-3.5 rounded shrink-0"
                  />
                  <span className="text-sm text-[#0a1628] font-medium flex-1 min-w-0 truncate">
                    {r.originCity.name} → {r.destinationCity.name}
                  </span>
                  {hasSeo ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">SEO set</span>
                  ) : (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full shrink-0">Missing</span>
                  )}
                  {/* Preview button */}
                  <button
                    onClick={() => handlePreview(r.id)}
                    title="Preview generated SEO"
                    className="shrink-0 text-gray-400 hover:text-[#0a1628] transition-colors"
                  >
                    {isPreviewing ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )
            })
          )}
        </div>

        {/* Inline SEO preview */}
        {previewId !== null && (
          <div className="mt-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Generated SEO Preview
            </p>
            {previewLoading ? (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading preview…
              </div>
            ) : previewData ? (
              <div className="space-y-2">
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Title</span>
                  <p className="text-sm font-medium text-[#1a0dab] mt-0.5">{previewData.seoTitle}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Description</span>
                  <p className="text-sm text-gray-600 mt-0.5">{previewData.seoDescription}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Keywords</span>
                  <p className="text-xs text-gray-500 font-mono mt-0.5 leading-relaxed">{previewData.seoKeywords}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">Preview unavailable.</p>
            )}
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="px-6 py-4 flex flex-wrap items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={saveState === 'loading'}
          className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
        >
          {saveState === 'loading'
            ? <RefreshCw className="w-4 h-4 animate-spin" />
            : <Zap className="w-4 h-4" />
          }
          {btnLabel()}
        </button>

        {saveState === 'done' && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Done — {summary?.generated} generated, {summary?.skipped} skipped
          </span>
        )}
        {saveState === 'error' && (
          <span className="flex items-center gap-1.5 text-sm text-red-500 font-medium">
            <AlertCircle className="w-4 h-4" /> Generation failed. Try again.
          </span>
        )}

        {results && (
          <button
            onClick={() => setShowResults((p) => !p)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-2 rounded-lg ml-auto font-medium"
          >
            {showResults ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showResults ? 'Hide' : 'View'} Results
          </button>
        )}
        {results && (
          <button
            onClick={exportResults}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-2 rounded-lg font-medium"
          >
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        )}
      </div>

      {/* Results list */}
      {showResults && results && (
        <div className="border-t border-gray-100 px-6 pb-5">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide my-3">Generation Results</p>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {results.map((r) => (
              <div
                key={r.routeId}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                  r.status === 'generated'
                    ? 'bg-green-50 text-green-800'
                    : r.status === 'skipped'
                    ? 'bg-gray-50 text-gray-600'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {r.status === 'generated' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-green-500" />}
                {r.status === 'skipped' && <span className="w-3.5 h-3.5 shrink-0 text-gray-400">—</span>}
                {r.status === 'error' && <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-500" />}
                <span className="font-medium">{r.route}</span>
                {r.reason && <span className="text-gray-400 ml-auto shrink-0">{r.reason}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
