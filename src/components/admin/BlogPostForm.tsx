'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string
  featuredImage: string | null
  category: string | null
  tags: string | null
  status: string
  isFeatured: boolean
  homepagePosition: number | null
  homepageTitle: string | null
  homepageDescription: string | null
  homepageImage: string | null
  homepageButtonLabel: string | null
  homepageWhatsappMessage: string | null
  readingMinutes: number
  authorName: string
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
    slug:           post?.slug ?? '',
    excerpt:        post?.excerpt ?? '',
    content:        post?.content ?? '',
    featuredImage:  post?.featuredImage ?? '',
    category:       post?.category ?? '',
    tags:           post?.tags ?? '',
    status:         post?.status ?? 'DRAFT',
    isFeatured:     post?.isFeatured ?? false,
    homepagePosition: post?.homepagePosition != null ? String(post.homepagePosition) : '',
    homepageTitle: post?.homepageTitle ?? '',
    homepageDescription: post?.homepageDescription ?? '',
    homepageImage: post?.homepageImage ?? '',
    homepageButtonLabel: post?.homepageButtonLabel ?? 'Enquire on WhatsApp',
    homepageWhatsappMessage: post?.homepageWhatsappMessage ?? '',
    readingMinutes: String(post?.readingMinutes ?? 3),
    authorName:     post?.authorName ?? 'Radhe Krishna Cab',
    seoTitle:       post?.seoTitle ?? '',
    seoDescription: post?.seoDescription ?? '',
  })
  const [loading,     setLoading]     = useState(false)
  const [uploading,   setUploading]   = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [saved,       setSaved]       = useState(false)
  const [serverError, setServerError] = useState('')

  const set = (f: string, v: string | boolean) => setForm(p => ({ ...p, [f]: v }))

  const handleTitleChange = (v: string) => {
    set('title', v)
    if (!isEdit && !form.slug) set('slug', slugify(v))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setServerError('Title is required'); return }
    if (!form.content.trim()) { setServerError('Content is required'); return }

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
          slug:           form.slug.trim() || slugify(form.title),
          excerpt:        form.excerpt.trim() || null,
          content:        form.content.trim(),
          featuredImage:  form.featuredImage.trim() || null,
          category:       form.category.trim() || null,
          tags:           form.tags.trim() || null,
          status:         form.status,
          isFeatured:     form.isFeatured,
          homepagePosition: form.homepagePosition === '' ? null : parseInt(form.homepagePosition),
          homepageTitle: form.homepageTitle.trim() || null,
          homepageDescription: form.homepageDescription.trim() || null,
          homepageImage: form.homepageImage.trim() || null,
          homepageButtonLabel: form.homepageButtonLabel.trim() || null,
          homepageWhatsappMessage: form.homepageWhatsappMessage.trim() || null,
          readingMinutes: parseInt(form.readingMinutes) || 3,
          authorName:     form.authorName.trim() || 'Radhe Krishna Cab',
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

      {/* Title + Slug */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">Post Details</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
          <input type="text" value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Post title" className={inp} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input type="text" value={form.slug} onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="auto-generated-from-title" className={inp} />
          <p className="text-xs text-gray-400 mt-1">URL: /blog/{form.slug || 'auto-generated'}</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt (short summary)</label>
          <textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} rows={2} placeholder="A brief summary shown on listing pages…" className={`${inp} resize-none`} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input type="text" value={form.category} onChange={e => set('category', e.target.value)} placeholder="e.g. Travel Tips" className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
            <input type="text" value={form.authorName} onChange={e => set('authorName', e.target.value)} className={inp} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reading Time (min)</label>
            <input type="number" min={1} max={60} value={form.readingMinutes} onChange={e => set('readingMinutes', e.target.value)} className={inp} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
          <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="Gujarat, taxi, travel guide" className={inp} />
        </div>
      </div>

      {/* Featured Image */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Featured Image</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
          <input type="text" value={form.featuredImage} onChange={e => set('featuredImage', e.target.value)} placeholder="https://... or /images/..." className={inp} />
          <p className="text-xs text-gray-400 mt-1">Enter a full URL or a path relative to /public (e.g. /images/blog/post.jpg)</p>
        </div>
        {form.featuredImage && (
          <div className="mt-3 h-40 rounded-lg overflow-hidden border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={form.featuredImage} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Content <span className="text-red-500">*</span></h2>
        <textarea
          value={form.content}
          onChange={e => set('content', e.target.value)}
          rows={18}
          placeholder="Write your post content here. You can use plain text or paste HTML."
          className={`${inp} resize-y font-mono text-xs`}
        />
        <p className="text-xs text-gray-400 mt-1">Plain text or HTML. Paragraphs separated by blank lines.</p>
      </div>

      {/* SEO */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-800">SEO (optional)</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SEO Title</label>
          <input type="text" value={form.seoTitle} onChange={e => set('seoTitle', e.target.value)} placeholder="Leave blank to use post title" className={inp} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SEO Description</label>
          <textarea value={form.seoDescription} onChange={e => set('seoDescription', e.target.value)} rows={2} placeholder="Leave blank to use excerpt" className={`${inp} resize-none`} />
        </div>
      </div>

      {/* Publish settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-3">
        <h2 className="font-semibold text-gray-800 mb-2">Publish Settings</h2>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
            <input type="radio" name="status" value="DRAFT" checked={form.status === 'DRAFT'} onChange={() => set('status', 'DRAFT')} className="w-4 h-4" />
            Save as Draft
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
            <input type="radio" name="status" value="PUBLISHED" checked={form.status === 'PUBLISHED'} onChange={() => set('status', 'PUBLISHED')} className="w-4 h-4" />
            Publish Now
          </label>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-gray-700">
          <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} className="w-4 h-4 rounded" />
          Mark as Featured (shown prominently on blog listing)
        </label>

        {/* Homepage card controls */}
        <div className="pt-3 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800 mb-1">Homepage Blog Card</h3>
          <p className="text-xs text-gray-500 mb-3">
            Choose whether this post appears on the homepage and set its order. Each position can be used by one post.
          </p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Display Position</label>
          <select value={form.homepagePosition} onChange={e => set('homepagePosition', e.target.value)} className={inp}>
            <option value="">— Do not show on homepage —</option>
            <option value="1">Position 1 (First)</option>
            <option value="2">Position 2 (Second)</option>
            <option value="3">Position 3 (Third)</option>
            <option value="4">Position 4 (Fourth)</option>
          </select>
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Homepage Card Image</label>
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
                    set('homepageImage', await optimizeImage(file))
                  } catch (error) {
                    setUploadError(error instanceof Error ? error.message : 'Image upload failed.')
                  } finally {
                    setUploading(false)
                    e.target.value = ''
                  }
                }}
                className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
              />
              <p className="text-xs text-gray-400 mt-1">Select an image (max 10 MB). It is optimized before saving.</p>
              {uploading && <p className="text-xs text-blue-600 mt-1">Processing image…</p>}
              {uploadError && <p className="text-xs text-red-600 mt-1">{uploadError}</p>}
              <label className="block text-xs font-medium text-gray-500 mt-3 mb-1">Or use an image URL</label>
              <input type="text" value={form.homepageImage} onChange={e => set('homepageImage', e.target.value)} placeholder="https://… or /images/…" className={inp} />
              {form.homepageImage && (
                <div className="mt-3 h-40 rounded-lg overflow-hidden border border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.homepageImage} alt="Homepage card preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Homepage Card Heading</label>
              <input type="text" value={form.homepageTitle} onChange={e => set('homepageTitle', e.target.value)} placeholder={form.title || 'Defaults to post title'} className={inp} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Homepage Card Description</label>
              <textarea value={form.homepageDescription} onChange={e => set('homepageDescription', e.target.value)} rows={3} placeholder={form.excerpt || 'Defaults to post excerpt'} className={`${inp} resize-y`} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Button Label</label>
                <input type="text" value={form.homepageButtonLabel} onChange={e => set('homepageButtonLabel', e.target.value)} placeholder="Enquire on WhatsApp" className={inp} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Message</label>
                <input type="text" value={form.homepageWhatsappMessage} onChange={e => set('homepageWhatsappMessage', e.target.value)} placeholder="Defaults to a message about this post" className={inp} />
              </div>
            </div>
            <p className="text-xs text-gray-400">
              The button opens WhatsApp using the number saved under Admin → Settings.
            </p>
          </div>
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
