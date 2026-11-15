'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  category: string | null
  showCategory: boolean
  state: string | null
  district: string | null
  showState: boolean
  showDistrict: boolean
  status: string
  homepagePosition: number | null
  seoTitle: string | null
  seoDescription: string | null
}

interface Props {
  post?: BlogPost
}

function slugify(t: string) {
  return t.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').slice(0, 200)
}

async function optimizeImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please select an image file.')
  if (file.size > 10 * 1024 * 1024) throw new Error('Image must be smaller than 10 MB.')

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, 1400 / bitmap.width, 900 / bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not process this image.')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas.toDataURL('image/webp', 0.82)
}

export default function BlogPostForm({ post }: Props) {
  const router = useRouter()
  const isEdit = !!post

  const [form, setForm] = useState({
    title:          post?.title ?? '',
    excerpt:        post?.excerpt ?? '',
    featuredImage:  post?.featuredImage ?? '',
    category:       post?.category ?? '',
    showCategory:   post?.showCategory ?? true,
    state:          post?.state ?? '',
    district:       post?.district ?? '',
    showState:      post?.showState ?? false,
    showDistrict:   post?.showDistrict ?? false,
    status:         post?.status ?? 'DRAFT',
    homepagePosition: post?.homepagePosition != null ? String(post.homepagePosition) : '',
    seoTitle:       post?.seoTitle ?? '',
    seoDescription: post?.seoDescription ?? '',
  })
  const [loading,     setLoading]     = useState(false)
  const [uploading,   setUploading]   = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [saved,       setSaved]       = useState(false)
  const [serverError, setServerError] = useState('')

  const [states,    setStates]    = useState<{ id: number; name: string }[]>([])
  const [districts, setDistricts] = useState<{ id: number; name: string; stateId: number }[]>([])

  useEffect(() => {
    fetch('/api/admin/tourist-places/meta')
      .then(r => r.json())
      .then(d => {
        setStates(d.states ?? [])
        setDistricts(d.districts ?? [])
      })
      .catch(() => {})
  }, [])

  const selectedStateId = states.find(s => s.name === form.state)?.id
  const filteredDistricts = districts.filter(d => d.stateId === selectedStateId)

  const set = (f: string, v: string | boolean) => setForm(p => ({ ...p, [f]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setServerError('Title is required'); return }
    if (!form.excerpt.trim()) { setServerError('Description is required'); return }
    if (uploading) { setServerError('Wait for the image to finish processing.'); return }

    setLoading(true)
    setServerError('')
    try {
      const url    = isEdit ? `/api/admin/blog/${post!.id}` : '/api/admin/blog'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title:          form.title.trim(),
          ...(!isEdit && { slug: slugify(form.title) }),
          excerpt:        form.excerpt.trim() || null,
          ...(!isEdit && { content: form.excerpt.trim() }),
          featuredImage:  form.featuredImage.trim() || null,
          category:       form.category.trim() || null,
          showCategory:   form.showCategory,
          state:          form.state.trim() || null,
          district:       form.district.trim() || null,
          showState:      form.showState,
          showDistrict:   form.showDistrict,
          status:         form.status,
          homepagePosition: form.homepagePosition === '' ? null : parseInt(form.homepagePosition),
          seoTitle:       form.seoTitle.trim() || null,
          seoDescription: form.seoDescription.trim() || null,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setSaved(true)
        setTimeout(() => router.push('/admin/blog'), 800)
      } else {
        setServerError(data.error ?? 'Save failed')
      }
    } catch {
      setServerError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const inp = 'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628]'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {serverError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />{serverError}
        </div>
      )}

      {/* Basic post details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Blog Post</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Post title" className={inp} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
          <textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} rows={3} maxLength={500} placeholder="A short description shown with the image…" className={`${inp} resize-y`} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input type="text" value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. Travel Tips" className={inp} />
          </div>
          <label className="flex items-center gap-2 pb-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.showCategory} onChange={e => set('showCategory', e.target.checked)} className="h-4 w-4 rounded" />
            Show category on the blog page
          </label>
        </div>
      </div>

      {/* State & District */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">State &amp; District</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            <select value={form.state} onChange={e => { set('state', e.target.value); set('district', '') }} className={inp}>
              <option value="">Select State</option>
              {states.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
            <select value={form.district} onChange={e => set('district', e.target.value)} className={inp}>
              <option value="">Select District</option>
              {filteredDistricts.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.showState} onChange={e => set('showState', e.target.checked)} className="h-4 w-4 rounded" />
            Show state on the website
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={form.showDistrict} onChange={e => set('showDistrict', e.target.checked)} className="h-4 w-4 rounded" />
            Show district on the website
          </label>
        </div>
        <p className="text-xs text-gray-400">
          Both are optional and hidden by default. District options depend on the selected state.
          You can also turn them on or off for every post together from the Blog Posts list.
        </p>
      </div>

      {/* Single post image */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Post Image</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload image</label>
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={async e => {
              const file = e.target.files?.[0]
              if (!file) return
              setUploading(true)
              setUploadError('')
              try {
                set('featuredImage', await optimizeImage(file))
              } catch (error) {
                setUploadError(error instanceof Error ? error.message : 'Image upload failed.')
              } finally {
                setUploading(false)
                e.target.value = ''
              }
            }}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
          />
          <p className="text-xs text-gray-400 mt-1">Select one image (max 10 MB). It is optimized before saving.</p>
          {uploading && <p className="text-xs text-blue-600 mt-1">Processing image…</p>}
          {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
        </div>
        {form.featuredImage && (
          <div className="mt-3 h-40 rounded-lg overflow-hidden border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.featuredImage} alt="Blog image preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <details className="bg-white rounded-xl border border-gray-200 p-6">
        <summary className="cursor-pointer font-semibold text-gray-800">SEO Settings (optional)</summary>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
            <input type="text" value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)} placeholder="Defaults to post title" className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
            <textarea value={form.seoDescription} onChange={e => set('seoDescription', e.target.value)} rows={2} placeholder="Defaults to post description" className={`${inp} resize-none`} />
          </div>
        </div>
      </details>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Visibility</h2>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
            <input type="radio" name="status" value="DRAFT" checked={form.status === 'DRAFT'} onChange={() => set('status', 'DRAFT')} className="w-4 h-4" />
            Draft
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
            <input type="radio" name="status" value="PUBLISHED" checked={form.status === 'PUBLISHED'} onChange={() => set('status', 'PUBLISHED')} className="w-4 h-4" />
            Publish on Blog
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Homepage position</label>
          <select value={form.homepagePosition} onChange={e => set('homepagePosition', e.target.value)} className={inp}>
            <option value="">Do not show on homepage</option>
            <option value="1">1 - First</option>
            <option value="2">2 - Second</option>
            <option value="3">3 - Third</option>
            <option value="4">4 - Fourth</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading || saved}
          className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {saved && <CheckCircle className="w-4 h-4 text-green-400" />}
          {saved ? 'Saved!' : loading ? 'Saving…' : isEdit ? 'Update Post' : 'Create Post'}
        </button>
        <a href="/admin/blog" className="text-sm text-gray-500 hover:text-gray-900">Cancel</a>
      </div>
    </form>
  )
}
