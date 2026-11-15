'use client'

import { useState } from 'react'
import { CheckCircle, Loader2, Save } from 'lucide-react'

interface Props {
  initialHeading: string
  initialDescription: string
}

export default function HomepageBlogSettingsForm({ initialHeading, initialDescription }: Props) {
  const [heading, setHeading] = useState(initialHeading)
  const [description, setDescription] = useState(initialDescription)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setSaved(false)
    setError('')
    try {
      const response = await fetch('/api/admin/homepage-blog', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heading, description }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? 'Could not save homepage heading.')
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save settings.')
    } finally {
      setBusy(false)
    }
  }

  const inputClass = 'w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1628]'

  return (
    <form onSubmit={submit} className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4">
        <h2 className="font-semibold text-gray-900">Homepage Blog Section Heading</h2>
        <p className="mt-1 text-xs text-gray-500">This text appears above the selected homepage blog cards.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-gray-700">
          Small heading
          <input value={heading} onChange={e => setHeading(e.target.value)} maxLength={120} className={`${inputClass} mt-1`} />
        </label>
        <label className="block text-sm font-medium text-gray-700">
          Section title / description
          <input value={description} onChange={e => setDescription(e.target.value)} maxLength={300} className={`${inputClass} mt-1`} />
        </label>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-[#0a1628] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a3a6b] disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save section text
        </button>
        {saved && <span className="inline-flex items-center gap-1 text-sm text-green-700"><CheckCircle className="h-4 w-4" /> Saved</span>}
        {error && <span role="alert" className="text-sm text-red-600">{error}</span>}
      </div>
    </form>
  )
}
