'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface TouristPlace {
  id: number
  name: string
  slug: string
  shortDescription: string | null
  description: string | null
  featuredImage: string | null
  galleryImages: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  stateId: number
  districtId: number | null
  cityName: string | null
  categoryId: number | null
  tags: string | null
  visitingHours: string | null
  entryFee: string | null
  bestTimeToVisit: string | null
  visitDuration: string | null
  nearbyPlaces: string | null
  status: string
  isFeatured: boolean
  seoTitle: string | null
  seoDescription: string | null
  seoKeywords: string | null
}

interface Option { id: number; name: string; slug: string }
interface DistrictOption { id: number; name: string; slug: string; stateId: number }

interface Props {
  place?: TouristPlace
}

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').slice(0, 220)
}

export default function TouristPlaceForm({ place }: Props) {
  const router = useRouter()
  const isEdit = !!place

  const [form, setForm] = useState({
    name: place?.name ?? '',
    slug: place?.slug ?? '',
    shortDescription: place?.shortDescription ?? '',
    description: place?.description ?? '',
    featuredImage: place?.featuredImage ?? '',
    galleryImages: place?.galleryImages ?? '',
    address: place?.address ?? '',
    cityName: place?.cityName ?? '',
    latitude: place?.latitude != null ? String(place.latitude) : '',
    longitude: place?.longitude != null ? String(place.longitude) : '',
    stateId: place ? String(place.stateId) : '',
    districtId: place?.districtId != null ? String(place.districtId) : '',
    categoryId: place?.categoryId != null ? String(place.categoryId) : '',
    tags: place?.tags ?? '',
    visitingHours: place?.visitingHours ?? '',
    entryFee: place?.entryFee ?? '',
    bestTimeToVisit: place?.bestTimeToVisit ?? '',
    visitDuration: place?.visitDuration ?? '',
    nearbyPlaces: place?.nearbyPlaces ?? '',
    status: place?.status ?? 'DRAFT',
    isFeatured: place?.isFeatured ?? false,
    seoTitle: place?.seoTitle ?? '',
    seoDescription: place?.seoDescription ?? '',
    seoKeywords: place?.seoKeywords ?? '',
  })

  const [states, setStates] = useState<Option[]>([])
  const [districts, setDistricts] = useState<DistrictOption[]>([])
  const [categories, setCategories] = useState<Option[]>([])
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    fetch('/api/admin/tourist-places/meta')
      .then(r => r.json())
      .then(d => {
        setStates(d.states ?? [])
        setDistricts(d.districts ?? [])
        setCategories(d.categories ?? [])
      })
      .catch(() => {})
  }, [])

  const filteredDistricts = districts.filter(d => String(d.stateId) === form.stateId)

  const set = (f: string, v: string | boolean) => setForm(p => ({ ...p, [f]: v }))

  const handleNameChange = (v: string) => {
    set('name', v)
    if (!isEdit && !form.slug) set('slug', slugify(v))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setServerError('Name is required'); return }
    if (!form.stateId) { setServerError('State is required'); return }

    setLoading(true)
    setServerError('')
    try {
      const url = isEdit ? `/api/admin/tourist-places/${place!.id}` : '/api/admin/tourist-places'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          slug: form.slug.trim() || slugify(form.name),
          shortDescription: form.shortDescription.trim() || null,
          description: form.description.trim() || null,
          featuredImage: form.featuredImage.trim() || null,
          galleryImages: form.galleryImages.trim() || null,
          address: form.address.trim() || null,
          cityName: form.cityName.trim() || null,
          latitude: form.latitude === '' ? null : parseFloat(form.latitude),
          longitude: form.longitude === '' ? null : parseFloat(form.longitude),
          stateId: parseInt(form.stateId),
          districtId: form.districtId === '' ? null : parseInt(form.districtId),
          categoryId: form.categoryId === '' ? null : parseInt(form.categoryId),
          tags: form.tags.trim() || null,
          visitingHours: form.visitingHours.trim() || null,
          entryFee: form.entryFee.trim() || null,
          bestTimeToVisit: form.bestTimeToVisit.trim() || null,
          visitDuration: form.visitDuration.trim() || null,
          nearbyPlaces: form.nearbyPlaces.trim() || null,
          status: form.status,
          isFeatured: form.isFeatured,
          seoTitle: form.seoTitle.trim() || null,
          seoDescription: form.seoDescription.trim() || null,
          seoKeywords: form.seoKeywords.trim() || null,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSaved(true)
        setTimeout(() => router.push('/admin/tourist-places'), 800)
      } else {
        setServerError(data.error ?? 'Save failed')
      }
    } catch {
      setServerError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const inp = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628]'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{serverError}
        </div>
      )}

      {/* Basic Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Place Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
            <input type="text" value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Somnath Temple" className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input type="text" value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="auto-generated" className={inp} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
          <textarea value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} rows={2} placeholder="One-line summary…" className={`${inp} resize-none`} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={6} placeholder="Detailed description…" className={`${inp} resize-y`} />
        </div>
      </div>

      {/* Location */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Location</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State <span className="text-red-500">*</span></label>
            <select value={form.stateId} onChange={e => { set('stateId', e.target.value); set('districtId', '') }} className={inp}>
              <option value="">Select State</option>
              {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select value={form.districtId} onChange={e => set('districtId', e.target.value)} className={inp}>
              <option value="">Select District</option>
              {filteredDistricts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City Name</label>
            <input type="text" value={form.cityName} onChange={e => set('cityName', e.target.value)} placeholder="e.g. Veraval" className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={form.categoryId} onChange={e => set('categoryId', e.target.value)} className={inp}>
              <option value="">Select Category</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
            <input type="text" value={form.latitude} onChange={e => set('latitude', e.target.value)} placeholder="20.8880" className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
            <input type="text" value={form.longitude} onChange={e => set('longitude', e.target.value)} placeholder="70.4013" className={inp} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input type="text" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Full address…" className={inp} />
        </div>
      </div>

      {/* Images */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Images</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image URL</label>
          <input type="text" value={form.featuredImage} onChange={e => set('featuredImage', e.target.value)} placeholder="https://…" className={inp} />
          <p className="text-xs text-gray-400 mt-1">Full URL of the main image</p>
          {form.featuredImage && (
            <div className="mt-3 h-40 rounded-lg overflow-hidden border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.featuredImage} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Images (one URL per line)</label>
          <textarea value={form.galleryImages} onChange={e => set('galleryImages', e.target.value)} rows={3} placeholder="https://…&#10;https://…" className={`${inp} resize-none font-mono text-xs`} />
        </div>
      </div>

      {/* Visitor Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Visitor Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visiting Hours</label>
            <input type="text" value={form.visitingHours} onChange={e => set('visitingHours', e.target.value)} placeholder="6 AM – 9 PM" className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entry Fee</label>
            <input type="text" value={form.entryFee} onChange={e => set('entryFee', e.target.value)} placeholder="Free / ₹50" className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Best Time to Visit</label>
            <input type="text" value={form.bestTimeToVisit} onChange={e => set('bestTimeToVisit', e.target.value)} placeholder="October to March" className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visit Duration</label>
            <input type="text" value={form.visitDuration} onChange={e => set('visitDuration', e.target.value)} placeholder="1-2 hours" className={inp} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
          <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="temple, pilgrimage, Gujarat" className={inp} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nearby Places</label>
          <textarea value={form.nearbyPlaces} onChange={e => set('nearbyPlaces', e.target.value)} rows={2} placeholder="Nearby attractions…" className={`${inp} resize-none`} />
        </div>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">SEO (optional)</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
          <input type="text" value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)} placeholder="Leave blank to use place name" className={inp} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
          <textarea value={form.seoDescription} onChange={e => set('seoDescription', e.target.value)} rows={2} placeholder="Meta description…" className={`${inp} resize-none`} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SEO Keywords</label>
          <input type="text" value={form.seoKeywords} onChange={e => set('seoKeywords', e.target.value)} placeholder="comma, separated, keywords" className={inp} />
        </div>
      </div>

      {/* Publish */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-semibold text-gray-800 mb-2">Publish Settings</h2>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
            <input type="radio" name="status" value="DRAFT" checked={form.status === 'DRAFT'} onChange={() => set('status', 'DRAFT')} className="w-4 h-4" />
            Draft
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
            <input type="radio" name="status" value="PUBLISHED" checked={form.status === 'PUBLISHED'} onChange={() => set('status', 'PUBLISHED')} className="w-4 h-4" />
            Published
          </label>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
          <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} className="w-4 h-4 rounded" />
          Mark as Featured
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading || saved}
          className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {saved && <CheckCircle className="w-4 h-4 text-green-400" />}
          {saved ? 'Saved!' : loading ? 'Saving…' : isEdit ? 'Update Place' : 'Create Place'}
        </button>
        <a href="/admin/tourist-places" className="text-sm text-gray-500 hover:text-gray-900">Cancel</a>
      </div>
    </form>
  )
}
