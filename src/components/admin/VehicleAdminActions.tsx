'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2 } from 'lucide-react'

interface Props {
  vehicleId: number
  vehicleName: string
  bookingCount: number
}

export default function VehicleAdminActions({ vehicleId, vehicleName, bookingCount }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (bookingCount > 0) {
      setError(`Has ${bookingCount} booking${bookingCount > 1 ? 's' : ''} — deactivate instead`)
      return
    }
    if (!confirm(`Delete vehicle "${vehicleName}"? This cannot be undone.`)) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        router.refresh()
      } else {
        setError(data.error ?? 'Delete failed')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      {error && <span className="text-xs text-red-500 mr-1 max-w-xs">{error}</span>}
      <button
        onClick={handleDelete}
        disabled={loading || bookingCount > 0}
        title={bookingCount > 0 ? `Has ${bookingCount} bookings` : `Delete ${vehicleName}`}
        className="p-1.5 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-red-50 transition-colors"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}
