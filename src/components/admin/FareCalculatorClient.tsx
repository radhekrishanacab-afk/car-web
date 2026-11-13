'use client'

import { useState } from 'react'
import { Calculator, RefreshCw, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface Vehicle {
  id: number
  name: string
  perKmRate: number
  minimumFare: number
  minimumBillableKm: number
  roundTripRateMultiplier: number
}

interface Props {
  cities: string[]
  vehicles: Vehicle[]
}

interface FareResult {
  vehicleId: number
  vehicleName: string
  perKmRate: number
  minimumFare: number
  oneWayFare: number | null
  roundTrip: number | null
  formula: string
}

function calcFare(distKm: number, v: Vehicle): number {
  const billable = Math.max(distKm, v.minimumBillableKm)
  return Math.ceil(Math.max(billable * v.perKmRate, v.minimumFare) / 100) * 100
}

export default function FareCalculatorClient({ cities, vehicles }: Props) {
  const [origin, setOrigin]     = useState('')
  const [dest,   setDest]       = useState('')
  const [manualKm, setManualKm] = useState('')
  const [loading, setLoading]   = useState(false)
  const [result,  setResult]    = useState<{ distanceKm: number | null; routeId: number | null; fares: FareResult[] } | null>(null)
  const [error,   setError]     = useState('')
  const [saving,  setSaving]    = useState(false)
  const [saved,   setSaved]     = useState(false)

  // Live preview from manual km
  const previewKm = parseFloat(manualKm) || result?.distanceKm || 0
  const liveFares = previewKm > 0
    ? vehicles.map(v => ({ ...v, oneWayFare: calcFare(previewKm, v), roundTrip: Math.ceil(calcFare(previewKm, v) * v.roundTripRateMultiplier / 100) * 100 }))
    : null

  const handleSearch = async () => {
    if (!origin || !dest) { setError('Please select both cities'); return }
    if (origin === dest) { setError('Origin and destination cannot be the same'); return }
    setLoading(true); setError(''); setResult(null); setSaved(false)
    try {
      const res = await fetch(`/api/admin/routes/fare-preview?originCity=${encodeURIComponent(origin)}&destCity=${encodeURIComponent(dest)}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error'); return }
      setResult(data)
      if (data.distanceKm) setManualKm(String(data.distanceKm))
    } catch { setError('Network error') }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    const km = parseFloat(manualKm)
    if (!km || !result) return
    setSaving(true); setSaved(false)
    try {
      // Update route distance if exists
      if (result.routeId) {
        await fetch(`/api/admin/routes/${result.routeId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ distanceKm: km }),
        })
      }
      // Update prices
      const prices = vehicles.map(v => ({
        vehicleId: v.id,
        oneWayFare: calcFare(km, v),
        roundTrip: Math.ceil(calcFare(km, v) * v.roundTripRateMultiplier / 100) * 100,
      }))
      await fetch('/api/admin/routes/update-fares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ originCity: origin, destCity: dest, distanceKm: km, prices }),
      })
      setSaved(true)
    } catch { setError('Save failed') }
    finally { setSaving(false) }
  }

  const handleRecalculateAll = async () => {
    if (!confirm('This will recalculate ALL route fares based on current vehicle per-km rates. This may take a few minutes. Continue?')) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/vehicles/recalculate', { method: 'POST' })
      const data = await res.json()
      alert(data.message ?? 'Done!')
    } catch { alert('Error recalculating') }
    finally { setSaving(false) }
  }

  const inp = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628]'

  return (
    <div className="space-y-6">

      {/* Vehicle Rates Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Calculator className="w-4 h-4" /> Vehicle Per-km Rates</h2>
          <button onClick={handleRecalculateAll} disabled={saving}
            className="flex items-center gap-2 text-xs bg-[#0a1628] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#1a3a6b] disabled:opacity-50">
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
            Recalculate All Fares
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {vehicles.map(v => (
            <div key={v.id} className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
              <p className="text-xs font-semibold text-[#0a1628] mb-1">{v.name}</p>
              <p className="text-lg font-bold text-[#0a1628]">₹{v.perKmRate}</p>
              <p className="text-xs text-gray-500">per km</p>
              <p className="text-xs text-gray-400 mt-1">Min: ₹{v.minimumFare}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Edit per-km rates in <a href="/admin/vehicles" className="text-blue-600 underline">Vehicles</a> page, then click "Recalculate All Fares" to update all 13,000+ routes automatically.
        </p>
      </div>

      {/* Fare Calculator */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Calculate Fare for Specific Route</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Origin City</label>
            <input list="city-list" value={origin} onChange={e => setOrigin(e.target.value)}
              placeholder="e.g. Ahmedabad" className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Destination City</label>
            <input list="city-list" value={dest} onChange={e => setDest(e.target.value)}
              placeholder="e.g. Surat" className={inp} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Distance (km) — override</label>
            <input type="number" value={manualKm} onChange={e => setManualKm(e.target.value)}
              placeholder="Auto from DB or enter manually" className={inp} />
          </div>
        </div>
        <datalist id="city-list">{cities.map(c => <option key={c} value={c} />)}</datalist>

        {error && <p className="text-xs text-red-500 mb-3 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}

        <div className="flex gap-3 mb-6">
          <button onClick={handleSearch} disabled={loading}
            className="flex items-center gap-2 bg-[#f59e0b] text-[#0a1628] font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#d97706] disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
            {loading ? 'Searching…' : 'Calculate Fares'}
          </button>
          {(result || previewKm > 0) && (
            <button onClick={handleSave} disabled={saving || !previewKm}
              className="flex items-center gap-2 bg-[#0a1628] text-white font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-[#1a3a6b] disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4 text-green-400" /> : null}
              {saved ? 'Saved!' : 'Save Fares to DB'}
            </button>
          )}
        </div>

        {/* Live Preview Table */}
        {(liveFares || result?.fares) && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm font-semibold text-gray-800">
                {origin} → {dest}
                {previewKm > 0 && <span className="ml-2 text-[#f59e0b] font-bold">{previewKm} km</span>}
              </p>
              {result?.routeId && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Route exists in DB</span>}
              {result && !result.routeId && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Route not in DB yet</span>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Vehicle</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Per km</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Formula</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">One-Way Fare</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Round Trip</th>
                  </tr>
                </thead>
                <tbody>
                  {(liveFares ?? result?.fares ?? []).map((f, i) => (
                    <tr key={f.id ?? f.vehicleId ?? i} className="border-t border-gray-100">
                      <td className="px-4 py-2.5 font-medium text-gray-800">{f.vehicleName ?? f.name}</td>
                      <td className="px-4 py-2.5 text-gray-600">₹{f.perKmRate}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-400 font-mono">
                        max({previewKm},{f.minimumBillableKm ?? 100}) × ₹{f.perKmRate}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-[#0a1628] text-base">₹{(f.oneWayFare ?? 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-2.5 text-gray-600">₹{(f.roundTrip ?? 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
