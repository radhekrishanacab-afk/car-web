'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, X, Check, Loader2 } from 'lucide-react'

interface BlogCategory {
  id: number
  name: string
  slug: string
  displayOrder: number
  isActive: boolean
  createdAt?: string | Date
  updatedAt?: string | Date
}

interface Props {
  initialCategories: BlogCategory[]
  legacyCategories: string[]
}

export default function BlogCategoryManager({ initialCategories, legacyCategories }: Props) {
  const router = useRouter()
  const [categories, setCategories] = useState<BlogCategory[]>(initialCategories)
  const [legacy, setLegacy] = useState<string[]>(legacyCategories)

  // Add form
  const [newName, setNewName] = useState('')
  const [newOrder, setNewOrder] = useState('')
  const [adding, setAdding] = useState(false)

  // Edit state
  const [editId, setEditId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editOrder, setEditOrder] = useState('')
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')

  const refresh = async () => {
    try {
      const res = await fetch('/api/admin/blog/categories')
      const data = await res.json()
      setCategories(data.categories ?? [])
      setLegacy(data.legacy ?? [])
    } catch {
      // ignore
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) { setError('Category name is required'); return }
    setAdding(true)
    setError('')
    try {
      const res = await fetch('/api/admin/blog/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          displayOrder: newOrder === '' ? 0 : parseInt(newOrder),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setNewName('')
        setNewOrder('')
        await refresh()
        router.refresh()
      } else {
        setError(data.error ?? 'Failed to add category')
      }
    } catch {
      setError('Network error')
    } finally {
      setAdding(false)
    }
  }

  const startEdit = (cat: BlogCategory) => {
    setEditId(cat.id)
    setEditName(cat.name)
    setEditOrder(String(cat.displayOrder))
    setError('')
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditName('')
    setEditOrder('')
  }

  const saveEdit = async (id: number) => {
    if (!editName.trim()) { setError('Category name is required'); return }
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/blog/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          displayOrder: editOrder === '' ? 0 : parseInt(editOrder),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        cancelEdit()
        await refresh()
        router.refresh()
      } else {
        setError(data.error ?? 'Failed to update category')
      }
    } catch {
      setError('Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category? Posts using it will keep their category text.')) return
    try {
      await fetch(`/api/admin/blog/categories/${id}`, { method: 'DELETE' })
      await refresh()
      router.refresh()
    } catch {
      // ignore
    }
  }

  const inp = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0a1628]'

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Add new category */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Add New Category</h2>
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Travel Tips"
              className={inp}
            />
          </div>
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-1">Order No.</label>
            <input
              type="number"
              min="0"
              value={newOrder}
              onChange={e => setNewOrder(e.target.value)}
              placeholder="1, 2, 3…"
              className={inp}
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="flex items-center gap-2 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Category
          </button>
        </form>
        <p className="text-xs text-gray-400 mt-2">
          Use the order number to control the sequence. Lower numbers appear first.
        </p>
      </div>

      {/* Categories list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Categories ({categories.length})</h2>
        </div>
        {categories.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            No categories yet. Add one above.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium text-gray-500 w-24">Order</th>
                <th className="px-4 py-3 font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 font-medium text-gray-500 w-32">Status</th>
                <th className="px-4 py-3 font-medium text-gray-500 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b border-gray-50 hover:bg-gray-50">
                  {editId === cat.id ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          value={editOrder}
                          onChange={e => setEditOrder(e.target.value)}
                          className={`${inp} w-20`}
                          autoFocus
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className={inp}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => saveEdit(cat.id)}
                            disabled={saving}
                            className="text-green-600 hover:text-green-800 p-1 disabled:opacity-50"
                            aria-label="Save"
                          >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-gray-400 hover:text-gray-600 p-1"
                            aria-label="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#0a1628] text-white text-xs font-bold">
                          {cat.displayOrder}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => startEdit(cat)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-xs flex items-center gap-1"
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="text-red-500 hover:text-red-700 font-medium text-xs flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Legacy categories from posts */}
      {legacy.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h2 className="font-semibold text-amber-800 mb-2">Categories used in posts (not yet managed)</h2>
          <p className="text-xs text-amber-700 mb-3">
            These category names appear in existing blog posts but are not in your managed list. Add them above to manage their order.
          </p>
          <div className="flex flex-wrap gap-2">
            {legacy.map(name => (
              <span key={name} className="px-3 py-1 bg-white border border-amber-300 rounded-full text-xs text-amber-800">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
