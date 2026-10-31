'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface City {
  id: number
  name: string
  slug: string
  description?: string | null
  imageUrl?: string | null
  isPopular: boolean
  popularOrder: number
  isActive: boolean
}

interface Props {
  city?: City
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

export default function CityForm({ city }: Props) {
  const router = useRouter()
  const isEdit = !!city

  const [form, setForm] = useState({
    name: city?.name ?? '',
    slug: city?.slug ?? '',
    description: city?.description ?? '',
    imageUrl: city?.imageUrl ?? '',
    isPopular: city?.isPopular ?? false,
    popularOrder: String(city?.popularOrder ?? 0),
    isActive: city?.isActive ?? true,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [serverError, setServerError] = useState('')

  const update = (f: string, v: string | boolean) => {
    setForm((p) => ({ ...p, [f]: v }))
    if (errors[f]) setErrors((p) => ({ ...p, [f]: '' }))
    setServerError('')
  }

  const autoSlug = () => {
    if (!isEdit) update('slug', slugify(form.name))
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = 'Name is required'
    if (!form.slug.trim()) e.slug = 'Slug is required'
    else if (!/^[a-z0-9-]+$/.test(form.slug)) e.slug = 'Slug must be lowercase letters, numbers and hyphens'
    if (form.imageUrl && !/^https?:\/\//.test(form.imageUrl)) e.imageUrl = 'Must be a valid URL'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const ve = validate()
    if (Object.keys(ve).length) { setErrors(ve); return }

    setLoading(true)
    setServerError('')
    try {
      const url = isEdit ? `/api/admin/cities/${city!.id}` : '/api/admin/cities'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim(),
          description: form.description.trim() || null,
          imageUrl: form.imageUrl.trim() || null,
          isPopular: form.isPopular,
          popularOrder: parseInt(form.popularOrder) || 0,
          isActive: form.isActive,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSaved(true)
        setTimeout(() => router.push('/admin/cities'), 800)
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
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      {serverError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {serverError}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">City Name <span className="text-red-500">*</span></label>
        <input
          type="text" value={form.name}
          onChange={(e) => update('name', e.target.value)}
          onBlur={autoSlug}
          placeholder="e.g. Ahmedabad" className={inp('name')}
        />
        <Err f="name" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slug <span className="text-red-500">*</span></label>
        <input type="text" value={form.slug}
          onChange={(e) => update('slug', e.target.value.toLowerCase())}
          placeholder="e.g. ahmedabad" className={inp('slug')} />
        <p className="text-xs text-gray-400 mt-1">Used in URL: /routes/ahmedabad</p>
        <Err f="slug" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
        <textarea value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={2} placeholder="Short description of the city"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628] resize-none" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
        <input type="url" value={form.imageUrl}
          onChange={(e) => update('imageUrl', e.target.value)}
          placeholder="https://..." className={inp('imageUrl')} />
        <Err f="imageUrl" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Popular Order</label>
          <input type="number" value={form.popularOrder} min={0}
            onChange={(e) => update('popularOrder', e.target.value)}
            className={inp('popularOrder')} />
          <p className="text-xs text-gray-400 mt-1">Lower = shown first in popular cities</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700">
          <input type="checkbox" checked={form.isPopular}
            onChange={(e) => update('isPopular', e.target.checked)}
            className="w-4 h-4 text-[#0a1628] rounded border-gray-300" />
          Mark as Popular City
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-gray-700">
          <input type="checkbox" checked={form.isActive}
            onChange={(e) => update('isActive', e.target.checked)}
            className="w-4 h-4 text-[#0a1628] rounded border-gray-300" />
          Active
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={loading || saved}
          className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {saved && <CheckCircle className="w-4 h-4 text-green-400" />}
          {saved ? 'Saved!' : loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add City'}
        </button>
        <a href="/admin/cities" className="text-sm text-gray-500 hover:text-gray-900">Cancel</a>
      </div>
    </form>
  )
}
