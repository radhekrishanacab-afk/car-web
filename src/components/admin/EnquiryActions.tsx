'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2, MailCheck } from 'lucide-react'

interface Props {
  enquiryId: number
  isRead: boolean
}

export default function EnquiryActions({ enquiryId, isRead }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const markRead = async () => {
    setLoading(true)
    try {
      await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !isRead }),
      })
      router.refresh()
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this enquiry?')) return
    setLoading(true)
    try {
      await fetch(`/api/admin/enquiries/${enquiryId}`, { method: 'DELETE' })
      router.refresh()
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-1">
      <button onClick={markRead} disabled={loading}
        title={isRead ? 'Mark as unread' : 'Mark as read'}
        className="p-1.5 text-blue-500 hover:text-blue-700 disabled:opacity-40 rounded hover:bg-blue-50 transition-colors">
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MailCheck className="w-3.5 h-3.5" />}
      </button>
      <button onClick={handleDelete} disabled={loading}
        title="Delete"
        className="p-1.5 text-red-400 hover:text-red-600 disabled:opacity-40 rounded hover:bg-red-50 transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
