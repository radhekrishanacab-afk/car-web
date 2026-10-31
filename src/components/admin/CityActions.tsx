'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2 } from 'lucide-react'

interface Props {
  cityId: number
  cityName: string
  routeCount: number
}

export default function CityActions({ cityId, cityName, routeCount }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (routeCount > 0) {
      setError(`Cannot delete — ${routeCount} route${routeCount > 1 ? 's' : ''} attached. Deactivate first.`)
      return
    }
    if (!confirm(`Delete city "${cityName}"? This cannot be undone.`)) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/cities/${cityId}`, { method: 'DELETE' })
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
      {error && (
        <span className="text-xs text-red-500 mr-2 max-w-xs">{error}</span>
      )}
      <button
        onClick={handleDelete}
        disabled={loading || routeCount > 0}
        title={routeCount > 0 ? `Cannot delete — has ${routeCount} routes` : `Delete ${cityName}`}
        className="p-1.5 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-red-50 transition-colors"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}
