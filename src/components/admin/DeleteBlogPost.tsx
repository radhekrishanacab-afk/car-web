'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export default function DeleteBlogPost({ id }: { id: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    setLoading(true)
    try {
      await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={handleDelete} disabled={loading}
      className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-0.5 disabled:opacity-50">
      <Trash2 className="w-3 h-3" />
      {loading ? '…' : 'Delete'}
    </button>
  )
}
