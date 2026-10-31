'use client'

import { useState, useRef } from 'react'
import {
  Upload, FileText, CheckCircle, AlertCircle, AlertTriangle,
  Copy, Download, RefreshCw, Eye, ChevronDown, ChevronUp, Info,
} from 'lucide-react'

interface Vehicle { id: number; name: string }
interface City { id: number; name: string }

interface ParsedRow {
  rowIndex: number
  originCity: string
  destinationCity: string
  distanceKm: number | null
  estimatedHours: number | null
  vehicles: Array<{ vehicleName: string; oneWayFare: number; roundTrip?: number | null }>
  parseErrors: string[]
}

interface ImportResult {
  rowIndex: number
  originCity: string
  destinationCity: string
  status: 'valid' | 'duplicate' | 'conflict' | 'error'
  message: string
  conflictFields?: string[]
  routeId?: number
}

interface ImportSummary {
  total: number
  imported: number
  duplicates: number
  conflicts: number
  errors: number
}

type Step = 1 | 2 | 3 | 4

const SAMPLE_CSV = `Origin City,Destination City,Distance KM,Estimated Hours,Sedan Fare,SUV Fare,Ertiga Fare
Ahmedabad,Surat,265,3.5,2200,2800,2500
Ahmedabad,Vadodara,110,1.5,1200,1600,1400
Surat,Rajkot,320,4.5,2600,3400,3000`

export default function BulkImportClient({ vehicles, cities }: { vehicles: Vehicle[]; cities: City[] }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState<Step>(1)
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [previewResults, setPreviewResults] = useState<ImportResult[] | null>(null)
  const [finalResults, setFinalResults] = useState<ImportResult[] | null>(null)
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  // ── CSV Parser ─────────────────────────────────────────────────────────────
  function parseCSV(text: string): ParsedRow[] {
    const lines = text.trim().split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length < 2) return []

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    const vehicleNameMap = new Map(vehicles.map((v) => [v.name.toLowerCase(), v.name]))
    const cityNames = new Set(cities.map((c) => c.name.toLowerCase()))

    const rows: ParsedRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim())
      const get = (col: string) => cols[headers.indexOf(col)] ?? ''

      const originCity = get('origin city') || get('from city') || get('origin') || get('from')
      const destinationCity = get('destination city') || get('to city') || get('destination') || get('to')
      const distRaw = get('distance km') || get('distance') || get('km')
      const hoursRaw = get('estimated hours') || get('hours') || get('time')

      const parseErrors: string[] = []

      if (!originCity) parseErrors.push('Missing origin city')
      if (!destinationCity) parseErrors.push('Missing destination city')
      if (originCity && !cityNames.has(originCity.toLowerCase())) {
        parseErrors.push(`Origin city "${originCity}" not in database — add it first`)
      }
      if (destinationCity && !cityNames.has(destinationCity.toLowerCase())) {
        parseErrors.push(`Destination city "${destinationCity}" not in database — add it first`)
      }

      const distanceKm = distRaw ? parseFloat(distRaw) : null
      if (distRaw && isNaN(distanceKm!)) parseErrors.push(`Invalid distance: "${distRaw}"`)

      const estimatedHours = hoursRaw ? parseFloat(hoursRaw) : null

      // Detect vehicle price columns — any header ending in ' fare' or matching vehicle names
      const vehiclePrices: ParsedRow['vehicles'] = []
      for (let hi = 0; hi < headers.length; hi++) {
        const hdr = headers[hi]
        const fareMatch = hdr.match(/^(.+)\s+fare$/)
        if (fareMatch) {
          const vname = fareMatch[1].trim()
          const canonicalName = vehicleNameMap.get(vname.toLowerCase())
          const rawFare = cols[hi]
          if (rawFare) {
            const fare = parseFloat(rawFare)
            if (!isNaN(fare) && fare > 0) {
              vehiclePrices.push({ vehicleName: canonicalName ?? vname, oneWayFare: fare })
            } else if (rawFare) {
              parseErrors.push(`Invalid fare for "${vname}": "${rawFare}"`)
            }
          }
        }
      }

      rows.push({
        rowIndex: i - 1,
        originCity,
        destinationCity,
        distanceKm: distanceKm && !isNaN(distanceKm) ? distanceKm : null,
        estimatedHours: estimatedHours && !isNaN(estimatedHours) ? estimatedHours : null,
        vehicles: vehiclePrices,
        parseErrors,
      })
    }

    return rows
  }

  // ── Step 1: Upload ──────────────────────────────────────────────────────────
  function handleFile(file: File) {
    setError('')
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (!text) { setError('Could not read file'); return }
      const rows = parseCSV(text)
      if (rows.length === 0) { setError('No valid data rows found. Check your CSV format.'); return }
      setParsedRows(rows)
      setStep(2)
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  // ── Step 2 → 3: Dry-run preview ────────────────────────────────────────────
  async function runPreview() {
    const validRows = parsedRows.filter((r) => r.parseErrors.length === 0)
    if (validRows.length === 0) { setError('No valid rows to preview'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/routes/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: validRows.map((r) => ({
            originCity: r.originCity,
            destinationCity: r.destinationCity,
            distanceKm: r.distanceKm,
            estimatedHours: r.estimatedHours,
            vehicles: r.vehicles,
          })),
          dryRun: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Preview failed'); return }
      setPreviewResults(data.results)
      setSummary(data.summary)
      setStep(3)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 3 → 4: Real import ─────────────────────────────────────────────────
  async function runImport() {
    const validRows = parsedRows.filter((r) => r.parseErrors.length === 0)
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/routes/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: validRows.map((r) => ({
            originCity: r.originCity,
            destinationCity: r.destinationCity,
            distanceKm: r.distanceKm,
            estimatedHours: r.estimatedHours,
            vehicles: r.vehicles,
          })),
          dryRun: false,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Import failed'); return }
      setFinalResults(data.results)
      setSummary(data.summary)
      setStep(4)
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  // ── Download sample CSV ─────────────────────────────────────────────────────
  function downloadSample() {
    const vehicleHeaders = vehicles.map((v) => `${v.name} Fare`).join(',')
    const header = `Origin City,Destination City,Distance KM,Estimated Hours,${vehicleHeaders}`
    const rows = [`Ahmedabad,Surat,265,3.5,${vehicles.map(() => '').join(',')}`, `Surat,Vadodara,154,2,${vehicles.map(() => '').join(',')}`]
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'routes-import-template.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  function statusIcon(status: ImportResult['status']) {
    if (status === 'valid') return <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
    if (status === 'duplicate') return <Info className="w-4 h-4 text-blue-500 shrink-0" />
    if (status === 'conflict') return <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
    return <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
  }

  function statusBg(status: ImportResult['status']) {
    if (status === 'valid') return 'bg-green-50 border-green-200'
    if (status === 'duplicate') return 'bg-blue-50 border-blue-200'
    if (status === 'conflict') return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const parseErrorCount = parsedRows.filter((r) => r.parseErrors.length > 0).length
  const validCount = parsedRows.length - parseErrorCount

  return (
    <div className="space-y-6">
      {/* Steps indicator */}
      <div className="flex items-center gap-0">
        {(['1', '2', '3', '4'] as const).map((s, idx) => {
          const stepNum = (idx + 1) as Step
          const labels = ['Upload', 'Review', 'Preview', 'Result']
          const active = step === stepNum
          const done = step > stepNum
          return (
            <div key={s} className="flex items-center">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${active ? 'bg-[#0a1628] text-white' : done ? 'text-green-700 bg-green-50' : 'text-gray-400'}`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${active ? 'bg-[#f59e0b] text-[#0a1628]' : done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {done ? '✓' : s}
                </span>
                {labels[idx]}
              </div>
              {idx < 3 && <div className="w-6 h-px bg-gray-300 mx-1" />}
            </div>
          )
        })}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
        </div>
      )}

      {/* ── STEP 1: Upload ───────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h3 className="font-semibold text-blue-900 text-sm mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" /> CSV Format Guide
            </h3>
            <p className="text-xs text-blue-800 mb-3">
              Your CSV must include: <strong>Origin City</strong>, <strong>Destination City</strong>, optionally <strong>Distance KM</strong>, <strong>Estimated Hours</strong>, and vehicle fare columns named <strong>&quot;[Vehicle Name] Fare&quot;</strong>.
            </p>
            <p className="text-xs text-blue-700 mb-3">
              City names must exactly match cities already in your database. Add any missing cities first via <strong>Cities → Add City</strong>.
            </p>
            <div className="text-xs font-mono bg-white border border-blue-200 rounded-lg p-3 text-gray-700 overflow-x-auto">
              {SAMPLE_CSV}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={downloadSample}
                className="flex items-center gap-1.5 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700"
              >
                <Download className="w-3.5 h-3.5" /> Download Template (your vehicles)
              </button>
              <button
                onClick={() => navigator.clipboard?.writeText(SAMPLE_CSV)}
                className="flex items-center gap-1.5 text-xs border border-blue-300 text-blue-700 px-3 py-1.5 rounded-lg font-medium hover:bg-blue-100"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Sample
              </button>
            </div>
          </div>

          {/* Vehicles in DB */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Your Vehicle Categories (use these exact names as column headers)</p>
            <div className="flex flex-wrap gap-2">
              {vehicles.map((v) => (
                <span key={v.id} className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg font-medium">
                  {v.name} Fare
                </span>
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-300 hover:border-[#0a1628] rounded-2xl p-12 text-center cursor-pointer transition-colors group"
          >
            <Upload className="w-10 h-10 text-gray-300 group-hover:text-[#0a1628] mx-auto mb-3 transition-colors" />
            <p className="font-semibold text-gray-700 text-sm mb-1">Drop your CSV file here or click to browse</p>
            <p className="text-xs text-gray-400">Supported: .csv · Max 500 routes per import</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            />
          </div>
        </div>
      )}

      {/* ── STEP 2: Review parsed rows ──────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Parsed {parsedRows.length} rows</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                <span className="text-green-600 font-medium">{validCount} valid</span>
                {parseErrorCount > 0 && <span className="text-red-500 font-medium ml-2">{parseErrorCount} with errors</span>}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setStep(1); setParsedRows([]) }} className="text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50">
                ← Re-upload
              </button>
              <button
                onClick={runPreview}
                disabled={loading || validCount === 0}
                className="flex items-center gap-2 text-sm bg-[#0a1628] text-white px-4 py-2 rounded-lg hover:bg-[#1a3a6b] disabled:opacity-50 font-medium"
              >
                <Eye className="w-4 h-4" />
                {loading ? 'Checking…' : `Preview ${validCount} Valid Rows`}
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {parsedRows.map((row) => {
              const hasError = row.parseErrors.length > 0
              const isOpen = expandedRow === row.rowIndex
              return (
                <div key={row.rowIndex} className={`border rounded-xl overflow-hidden ${hasError ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
                  <button
                    onClick={() => setExpandedRow(isOpen ? null : row.rowIndex)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {hasError
                        ? <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        : <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      }
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {row.originCity || '?'} → {row.destinationCity || '?'}
                      </span>
                      {row.distanceKm && (
                        <span className="text-xs text-gray-400 shrink-0">{row.distanceKm} km</span>
                      )}
                      {row.vehicles.length > 0 && (
                        <span className="text-xs text-gray-400 shrink-0 hidden sm:inline">
                          {row.vehicles.length} price{row.vehicles.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-2">
                      {hasError && (
                        <ul className="space-y-1">
                          {row.parseErrors.map((e) => (
                            <li key={e} className="text-xs text-red-600 flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" /> {e}
                            </li>
                          ))}
                        </ul>
                      )}
                      {row.vehicles.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600 mb-1">Vehicle Fares:</p>
                          <div className="flex flex-wrap gap-2">
                            {row.vehicles.map((v) => (
                              <span key={v.vehicleName} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded font-medium">
                                {v.vehicleName}: ₹{v.oneWayFare.toLocaleString('en-IN')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── STEP 3: Preview results (dry-run) ──────────────────────────────── */}
      {step === 3 && previewResults && summary && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'New Routes', count: summary.imported, color: 'bg-green-50 border-green-200 text-green-700' },
              { label: 'Duplicates', count: summary.duplicates, color: 'bg-blue-50 border-blue-200 text-blue-700' },
              { label: 'Conflicts', count: summary.conflicts, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
              { label: 'Errors', count: summary.errors, color: 'bg-red-50 border-red-200 text-red-700' },
            ].map((s) => (
              <div key={s.label} className={`border rounded-xl p-4 text-center ${s.color}`}>
                <div className="text-2xl font-bold">{s.count}</div>
                <div className="text-xs font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {summary.conflicts > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-yellow-800 mb-1 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> {summary.conflicts} conflict{summary.conflicts !== 1 ? 's' : ''} detected
              </p>
              <p className="text-xs text-yellow-700">
                These routes already exist with different distance or price values. They will be <strong>skipped</strong> during import. You can review and edit them individually from the Routes page.
              </p>
            </div>
          )}

          {/* Result rows */}
          <div className="space-y-2 max-h-[50vh] overflow-y-auto">
            {previewResults.map((r) => (
              <div key={r.rowIndex} className={`border rounded-xl p-3 ${statusBg(r.status)}`}>
                <div className="flex items-start gap-2">
                  {statusIcon(r.status)}
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-gray-900">{r.originCity} → {r.destinationCity}</span>
                    <p className="text-xs text-gray-600 mt-0.5">{r.message}</p>
                    {r.conflictFields && r.conflictFields.length > 0 && (
                      <ul className="mt-1 space-y-0.5">
                        {r.conflictFields.map((cf) => (
                          <li key={cf} className="text-xs text-yellow-700 font-mono">{cf}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-200">
            <button onClick={() => setStep(2)} className="text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 font-medium">
              ← Back to Review
            </button>
            {summary.imported > 0 ? (
              <button
                onClick={runImport}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50"
              >
                {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
                {loading ? 'Importing…' : `Confirm Import — ${summary.imported} new route${summary.imported !== 1 ? 's' : ''}`}
              </button>
            ) : (
              <p className="text-sm text-gray-500">No new routes to import. All rows are duplicates or have errors.</p>
            )}
          </div>
        </div>
      )}

      {/* ── STEP 4: Final result ────────────────────────────────────────────── */}
      {step === 4 && finalResults && summary && (
        <div className="space-y-5">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
            <h2 className="font-bold text-green-900 text-lg mb-1">Import Complete</h2>
            <p className="text-sm text-green-700">
              {summary.imported} route{summary.imported !== 1 ? 's' : ''} imported successfully.
              {summary.duplicates > 0 && ` ${summary.duplicates} duplicate${summary.duplicates !== 1 ? 's' : ''} skipped.`}
              {summary.errors > 0 && ` ${summary.errors} error${summary.errors !== 1 ? 's' : ''}.`}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Imported', count: summary.imported, color: 'bg-green-50 border-green-200 text-green-700' },
              { label: 'Duplicates Skipped', count: summary.duplicates, color: 'bg-blue-50 border-blue-200 text-blue-700' },
              { label: 'Conflicts Skipped', count: summary.conflicts, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
              { label: 'Failed', count: summary.errors, color: 'bg-red-50 border-red-200 text-red-700' },
            ].map((s) => (
              <div key={s.label} className={`border rounded-xl p-4 text-center ${s.color}`}>
                <div className="text-2xl font-bold">{s.count}</div>
                <div className="text-xs font-medium mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {summary.errors > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-red-700">Failed rows:</p>
              {finalResults.filter((r) => r.status === 'error').map((r) => (
                <div key={r.rowIndex} className="border border-red-200 bg-red-50 rounded-xl p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-sm font-medium">{r.originCity} → {r.destinationCity}</span>
                    <p className="text-xs text-red-600 mt-0.5">{r.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-200">
            <a href="/admin/routes" className="text-sm bg-[#0a1628] hover:bg-[#1a3a6b] text-white px-5 py-2.5 rounded-lg font-semibold">
              View All Routes
            </a>
            <a href="/admin/pricing" className="text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg font-medium">
              Set Pricing
            </a>
            <a href="/admin/seo" className="text-sm border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg font-medium">
              Generate SEO
            </a>
            <button
              onClick={() => { setStep(1); setParsedRows([]); setPreviewResults(null); setFinalResults(null); setSummary(null) }}
              className="text-sm border border-gray-200 text-gray-600 px-4 py-2.5 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" /> Import Another File
            </button>
          </div>
        </div>
      )}

      {/* Help text */}
      {step === 1 && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-600">
          <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Data Safety
          </p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Existing routes with matching city pairs are detected as duplicates — never overwritten silently.</li>
            <li>If an existing route has a different distance or price, it is flagged as a conflict for your review.</li>
            <li>Booking relationships are never modified by this importer.</li>
            <li>A dry-run preview is always shown before any data is saved.</li>
            <li>Do not use data scraped from other websites. Only import data you are authorized to use.</li>
          </ul>
        </div>
      )}
    </div>
  )
}
