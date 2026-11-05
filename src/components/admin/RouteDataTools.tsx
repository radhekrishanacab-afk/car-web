'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Trash2, Upload, AlertTriangle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Props {
  totalRoutes: number
}

export default function RouteDataTools({ totalRoutes }: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleteMsg, setDeleteMsg] = useState('')

  const handleExport = () => {
    window.location.href = '/api/admin/routes/export'
  }

  const handleDeleteAll = async () => {
    setDeleting(true)
    setDeleteMsg('')
    try {
      const res = await fetch('/api/admin/routes/delete-all', { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        setDeleteMsg(data.message)
        setShowConfirm(false)
        router.refresh()
      } else {
        setDeleteMsg(data.error ?? 'Delete failed')
      }
    } catch {
      setDeleteMsg('Network error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>

      {/* Export CSV */}
      <button onClick={handleExport}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0a1628', color: '#fff', fontWeight: 600, fontSize: 13, padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer' }}>
        <Download size={14} /> Export CSV
      </button>

      {/* Bulk Import */}
      <Link href="/admin/routes/import"
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f59e0b', color: '#0a1628', fontWeight: 600, fontSize: 13, padding: '8px 16px', borderRadius: 8, textDecoration: 'none' }}>
        <Upload size={14} /> Import CSV
      </Link>

      {/* Delete All */}
      {!showConfirm ? (
        <button onClick={() => setShowConfirm(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fef2f2', color: '#dc2626', fontWeight: 600, fontSize: 13, padding: '8px 16px', borderRadius: 8, border: '1px solid #fecaca', cursor: 'pointer' }}>
          <Trash2 size={14} /> Delete All Routes
        </button>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '8px 14px' }}>
          <AlertTriangle size={14} style={{ color: '#dc2626', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#dc2626', fontWeight: 600 }}>Delete all {totalRoutes} routes?</span>
          <button onClick={handleDeleteAll} disabled={deleting}
            style={{ background: '#dc2626', color: '#fff', fontWeight: 700, fontSize: 12, padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            {deleting && <Loader2 size={12} className="animate-spin" />}
            {deleting ? 'Deleting…' : 'Yes, Delete All'}
          </button>
          <button onClick={() => setShowConfirm(false)}
            style={{ background: '#fff', color: '#64748b', fontWeight: 600, fontSize: 12, padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      )}

      {deleteMsg && (
        <span style={{ fontSize: 12, color: deleteMsg.includes('Deleted') ? '#16a34a' : '#dc2626', fontWeight: 500 }}>
          {deleteMsg}
        </span>
      )}
    </div>
  )
}
