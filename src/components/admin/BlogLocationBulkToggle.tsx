'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, MapPin } from 'lucide-react'

export default function BlogLocationBulkToggle() {
  const router = useRouter()
  const [busy, setBusy] = useState<'show' | 'hide' | null>(null)
  const [error, setError] = useState('')

  const update = async (show: boolean) => {
    setBusy(show ? 'show' : 'hide')
    setError('')
    try {
      const res = await fetch('/api/admin/blog/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showState: show, showDistrict: show }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Update failed')
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-gray-400" />
        <p className="text-sm font-semibold text-gray-800">State &amp; District on the website</p>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Applies to every blog post at once — including posts created later. Use this to show or hide state and
        district everywhere in one click.
      </p>
      <div className="flex flex-wrap items-center gap-3 mt-3">
        <button type="button" onClick={() => update(true)} disabled={busy !== null}
          className="flex items-center gap-2 px-4 py-2 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors">
          {busy === 'show' && <Loader2 className="w-4 h-4 animate-spin" />}
          Show for all posts
        </button>
        <button type="button" onClick={() => update(false)} disabled={busy !== null}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 disabled:opacity-60 text-gray-700 rounded-lg text-sm font-medium transition-colors">
          {busy === 'hide' && <Loader2 className="w-4 h-4 animate-spin" />}
          Hide for all posts
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>
    </div>
  )
}
