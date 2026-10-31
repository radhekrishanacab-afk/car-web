'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle } from 'lucide-react'

interface Props {
  bookingId: number
  currentStatus: string
}

const statuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

export default function BookingStatusForm({ bookingId, currentStatus }: Props) {
  const router = useRouter()
  const [status, setStatus] = useState(currentStatus)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (status === currentStatus) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error ?? 'Failed to update')
      } else {
        setSaved(true)
        router.refresh()
        setTimeout(() => setSaved(false), 2000)
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <select
        value={status}
        onChange={(e) => { setStatus(e.target.value); setSaved(false) }}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628]"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        onClick={handleSave}
        disabled={loading || status === currentStatus}
        className="w-full flex items-center justify-center gap-2 bg-[#0a1628] disabled:opacity-50 text-white py-2 rounded-lg text-sm font-medium hover:bg-[#1a3a6b] transition-colors"
      >
        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        {saved && <CheckCircle className="w-3.5 h-3.5 text-green-400" />}
        {loading ? 'Saving…' : saved ? 'Saved!' : 'Update Status'}
      </button>
    </div>
  )
}
