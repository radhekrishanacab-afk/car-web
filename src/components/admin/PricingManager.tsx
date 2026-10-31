'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { IndianRupee, Plus, Loader2, CheckCircle, AlertCircle, Trash2, Edit2, X } from 'lucide-react'

interface RouteOption {
  id: number
  label: string
  distanceKm: number | null
}

interface VehicleOption {
  id: number
  name: string
  perKmRate: number
  minimumFare: number
}

interface PriceEntry {
  id: number
  routeId: number
  routeLabel: string
  vehicleId: number
  vehicleName: string
  oneWayFare: number
  roundTrip: number | null
  driverAllowance: number | null
  tollCharges: number | null
  parkingCharges: number | null
  nightCharges: number | null
  otherCharges: number | null
  isActive: boolean
}

interface Props {
  routes: RouteOption[]
  vehicles: VehicleOption[]
  prices: PriceEntry[]
  selectedRouteId: number | null
  page: number
  pages: number
  total: number
}

const emptyForm = {
  routeId: '',
  vehicleId: '',
  oneWayFare: '',
  roundTrip: '',
  driverAllowance: '',
  tollCharges: '',
  parkingCharges: '',
  nightCharges: '',
  otherCharges: '',
  isActive: true,
}

export default function PricingManager({ routes, vehicles, prices, selectedRouteId, page, pages, total }: Props) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ ...emptyForm, routeId: selectedRouteId ? String(selectedRouteId) : '' })
  const [editId, setEditId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [serverError, setServerError] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const update = (f: string, v: string | boolean) => {
    setForm((p) => ({ ...p, [f]: v }))
    if (errors[f]) setErrors((p) => ({ ...p, [f]: '' }))
    setServerError('')
    setSaved(false)
  }

  const startEdit = (p: PriceEntry) => {
    setEditId(p.id)
    setForm({
      routeId: String(p.routeId),
      vehicleId: String(p.vehicleId),
      oneWayFare: String(p.oneWayFare),
      roundTrip: p.roundTrip != null ? String(p.roundTrip) : '',
      driverAllowance: p.driverAllowance != null ? String(p.driverAllowance) : '',
      tollCharges: p.tollCharges != null ? String(p.tollCharges) : '',
      parkingCharges: p.parkingCharges != null ? String(p.parkingCharges) : '',
      nightCharges: p.nightCharges != null ? String(p.nightCharges) : '',
      otherCharges: p.otherCharges != null ? String(p.otherCharges) : '',
      isActive: p.isActive,
    })
    setShowForm(true)
    setServerError('')
    setErrors({})
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditId(null)
    setForm({ ...emptyForm, routeId: selectedRouteId ? String(selectedRouteId) : '' })
    setServerError('')
    setErrors({})
    setSaved(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this price entry?')) return
    try {
      const res = await fetch(`/api/admin/pricing/${id}`, { method: 'DELETE' })
      if (res.ok) router.refresh()
    } catch { /* ignore */ }
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.routeId) e.routeId = 'Select route'
    if (!form.vehicleId) e.vehicleId = 'Select vehicle'
    if (!form.oneWayFare || isNaN(Number(form.oneWayFare)) || Number(form.oneWayFare) < 0) e.oneWayFare = 'Required — positive number'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ve = validate()
    if (Object.keys(ve).length) { setErrors(ve); return }

    setLoading(true)
    setServerError('')
    try {
      const isEdit = editId !== null
      const url = isEdit ? `/api/admin/pricing/${editId}` : '/api/admin/pricing'
      const method = isEdit ? 'PATCH' : 'POST'
      const payload: Record<string, unknown> = {
        oneWayFare: Number(form.oneWayFare),
        roundTrip: form.roundTrip ? Number(form.roundTrip) : null,
        driverAllowance: form.driverAllowance ? Number(form.driverAllowance) : null,
        tollCharges: form.tollCharges ? Number(form.tollCharges) : null,
        parkingCharges: form.parkingCharges ? Number(form.parkingCharges) : null,
        nightCharges: form.nightCharges ? Number(form.nightCharges) : null,
        otherCharges: form.otherCharges ? Number(form.otherCharges) : null,
        isActive: form.isActive,
      }
      if (!isEdit) {
        payload.routeId = parseInt(form.routeId)
        payload.vehicleId = parseInt(form.vehicleId)
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        setSaved(true)
        setTimeout(() => {
          cancelForm()
          router.refresh()
        }, 600)
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
    <div>
      {/* Filter by route */}
      <div className="flex flex-wrap gap-3 mb-5">
        <form className="flex gap-2">
          <select name="routeId" defaultValue={selectedRouteId ?? ''}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628]">
            <option value="">All Routes</option>
            {routes.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
          </select>
          <button type="submit" className="px-4 py-2 bg-[#0a1628] text-white rounded-lg text-sm font-medium hover:bg-[#1a3a6b] transition-colors">Filter</button>
          {selectedRouteId && <Link href="/admin/pricing" className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Clear</Link>}
        </form>
        <button onClick={() => { setShowForm(true); setEditId(null) }}
          className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#1a3a6b] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ml-auto">
          <Plus className="w-4 h-4" /> Add Price Entry
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-[#f59e0b]" />
              {editId ? 'Edit Price Entry' : 'Add Price Entry'}
            </h2>
            <button onClick={cancelForm} className="p-1.5 text-gray-400 hover:text-gray-700 rounded hover:bg-gray-100">
              <X className="w-4 h-4" />
            </button>
          </div>

          {serverError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" />{serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route <span className="text-red-500">*</span></label>
                <select value={form.routeId} onChange={(e) => update('routeId', e.target.value)}
                  disabled={editId !== null} className={inp('routeId')}>
                  <option value="">Select route…</option>
                  {routes.map((r) => <option key={r.id} value={r.id}>{r.label}{r.distanceKm ? ` (${r.distanceKm} km)` : ''}</option>)}
                </select>
                <Err f="routeId" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle <span className="text-red-500">*</span></label>
                <select value={form.vehicleId} onChange={(e) => update('vehicleId', e.target.value)}
                  disabled={editId !== null} className={inp('vehicleId')}>
                  <option value="">Select vehicle…</option>
                  {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
                <Err f="vehicleId" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { f: 'oneWayFare', label: 'One-Way Fare (₹)', req: true },
                { f: 'roundTrip', label: 'Round-Trip Fare (₹)' },
                { f: 'driverAllowance', label: 'Driver Allowance (₹)' },
                { f: 'tollCharges', label: 'Toll Charges (₹)' },
                { f: 'parkingCharges', label: 'Parking (₹)' },
                { f: 'nightCharges', label: 'Night Charges (₹)' },
                { f: 'otherCharges', label: 'Other Charges (₹)' },
              ].map(({ f, label, req }) => (
                <div key={f}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {label}{req && <span className="text-red-500"> *</span>}
                  </label>
                  <input type="number" value={(form as Record<string, unknown>)[f] as string} min={0}
                    onChange={(e) => update(f, e.target.value)}
                    placeholder="0" className={inp(f)} />
                  <Err f={f} />
                </div>
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700">
              <input type="checkbox" checked={form.isActive} onChange={(e) => update('isActive', e.target.checked)}
                className="w-4 h-4 text-[#0a1628] rounded border-gray-300" />
              Active
            </label>

            <div className="flex gap-3">
              <button type="submit" disabled={loading || saved}
                className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {saved && <CheckCircle className="w-4 h-4 text-green-400" />}
                {saved ? 'Saved!' : loading ? 'Saving…' : editId ? 'Save Changes' : 'Add Entry'}
              </button>
              <button type="button" onClick={cancelForm} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg text-sm hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Price entries table */}
      {prices.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400">
          {selectedRouteId ? 'No prices for this route yet.' : 'No price entries yet. Add your first entry.'}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium text-gray-500">Route</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Vehicle</th>
                  <th className="px-4 py-3 font-medium text-gray-500">One-Way</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Round-Trip</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Driver</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Tolls</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs text-gray-700">{p.routeLabel}</td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-900">{p.vehicleName}</td>
                    <td className="px-4 py-3 font-semibold text-[#0a1628]">₹{p.oneWayFare.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-gray-600">{p.roundTrip != null ? `₹${p.roundTrip.toLocaleString('en-IN')}` : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.driverAllowance != null ? `₹${p.driverAllowance}` : '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{p.tollCharges != null ? `₹${p.tollCharges}` : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(p)}
                          className="p-1.5 text-[#1a3a6b] hover:text-[#f59e0b] rounded hover:bg-amber-50 transition-colors"
                          title="Edit price">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-red-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors"
                          title="Delete price">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Page {page} of {pages} ({total} entries)</p>
          <div className="flex gap-2">
            {page > 1 && <Link href={`/admin/pricing?page=${page - 1}${selectedRouteId ? `&routeId=${selectedRouteId}` : ''}`} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">← Prev</Link>}
            {page < pages && <Link href={`/admin/pricing?page=${page + 1}${selectedRouteId ? `&routeId=${selectedRouteId}` : ''}`} className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Next →</Link>}
          </div>
        </div>
      )}
    </div>
  )
}
