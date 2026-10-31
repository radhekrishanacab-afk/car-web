'use client'

import { useState } from 'react'
import { Search, ChevronDown, ChevronUp, Save, CheckCircle2, AlertCircle } from 'lucide-react'

interface SeoPage {
  id: number
  pageKey: string
  pageLabel: string
  title: string
  description: string
  keywords: string
  ogTitle: string | null
  ogDesc: string | null
}

export default function SeoManager({ initialPages }: { initialPages: SeoPage[] }) {
  const [pages, setPages] = useState<SeoPage[]>(initialPages)
  const [expanded, setExpanded] = useState<string | null>(initialPages[0]?.pageKey ?? null)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const filtered = pages.filter(p =>
    p.pageLabel.toLowerCase().includes(search.toLowerCase()) ||
    p.pageKey.toLowerCase().includes(search.toLowerCase())
  )

  const update = (pageKey: string, field: keyof SeoPage, value: string) => {
    setPages(prev => prev.map(p => p.pageKey === pageKey ? { ...p, [field]: value } : p))
  }

  const save = async (pageKey: string) => {
    const page = pages.find(p => p.pageKey === pageKey)
    if (!page) return
    setSaving(pageKey)
    setError(null)
    try {
      const res = await fetch('/api/admin/seo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pageKey: page.pageKey,
          title: page.title,
          description: page.description,
          keywords: page.keywords,
          ogTitle: page.ogTitle || page.title,
          ogDesc: page.ogDesc || page.description,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      setSaved(pageKey)
      setTimeout(() => setSaved(null), 3000)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(null)
    }
  }

  const charCount = (str: string) => str?.length ?? 0
  const titleStatus = (len: number) => len < 30 ? 'text-red-500' : len > 60 ? 'text-yellow-500' : 'text-green-500'
  const descStatus = (len: number) => len < 80 ? 'text-red-500' : len > 160 ? 'text-yellow-500' : 'text-green-500'

  return (
    <div className="space-y-4 max-w-4xl">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search pages…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1628]"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Pages accordion */}
      {filtered.map((page) => (
        <div key={page.pageKey} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <button
            onClick={() => setExpanded(expanded === page.pageKey ? null : page.pageKey)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#0a1628] text-white text-xs font-bold flex items-center justify-center uppercase">
                {page.pageKey.slice(0, 2)}
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">{page.pageLabel}</div>
                <div className="text-xs text-gray-400 truncate max-w-md">{page.title}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {saved === page.pageKey && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                </span>
              )}
              {expanded === page.pageKey ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </div>
          </button>

          {/* Form */}
          {expanded === page.pageKey && (
            <div className="px-5 pb-5 border-t border-gray-100 space-y-4 pt-4">

              {/* Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Page Title
                  </label>
                  <span className={`text-xs font-medium ${titleStatus(charCount(page.title))}`}>
                    {charCount(page.title)}/60 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={page.title}
                  onChange={e => update(page.pageKey, 'title', e.target.value)}
                  placeholder="Page title (30–60 characters ideal)"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1628]"
                />
                <p className="text-xs text-gray-400 mt-1">Shown in browser tab and Google search results.</p>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Meta Description
                  </label>
                  <span className={`text-xs font-medium ${descStatus(charCount(page.description))}`}>
                    {charCount(page.description)}/160 chars
                  </span>
                </div>
                <textarea
                  value={page.description}
                  onChange={e => update(page.pageKey, 'description', e.target.value)}
                  placeholder="Brief page description (80–160 characters ideal)"
                  rows={3}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1628] resize-none"
                />
                <p className="text-xs text-gray-400 mt-1">Shown below the title in Google search results.</p>
              </div>

              {/* Keywords */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                  Keywords
                </label>
                <input
                  type="text"
                  value={page.keywords}
                  onChange={e => update(page.pageKey, 'keywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1628]"
                />
                <p className="text-xs text-gray-400 mt-1">Comma-separated keywords. Used for meta keywords tag.</p>
              </div>

              {/* OG Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                    OG Title (Social Share)
                  </label>
                  <input
                    type="text"
                    value={page.ogTitle ?? page.title}
                    onChange={e => update(page.pageKey, 'ogTitle', e.target.value)}
                    placeholder="Title for WhatsApp/Facebook share"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1628]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                    OG Description
                  </label>
                  <input
                    type="text"
                    value={page.ogDesc ?? page.description}
                    onChange={e => update(page.pageKey, 'ogDesc', e.target.value)}
                    placeholder="Description for social share"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0a1628]"
                  />
                </div>
              </div>

              {/* Google Preview */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Google Preview</p>
                <div className="text-[#1a0dab] text-base font-medium truncate">{page.title || 'Page Title'}</div>
                <div className="text-[#006621] text-xs">radhekrishanacab.com/{page.pageKey === 'home' ? '' : page.pageKey}</div>
                <div className="text-gray-600 text-sm mt-0.5 line-clamp-2">{page.description || 'Page description...'}</div>
              </div>

              {/* Save */}
              <div className="flex justify-end">
                <button
                  onClick={() => save(page.pageKey)}
                  disabled={saving === page.pageKey}
                  className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {saving === page.pageKey ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
