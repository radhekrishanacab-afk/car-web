'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'

export default function LoginForm() {
  const router = useRouter()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.username || !form.password) {
      setError('Please enter username and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setError(data.error ?? 'Login failed. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 mb-5 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="mb-5">
        <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-1.5">
          Username or Email
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          value={form.username}
          onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
          placeholder="admin"
          className="w-full px-4 py-2.5 bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent text-sm"
          disabled={loading}
        />
      </div>

      <div className="mb-6">
        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 pr-10 bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f59e0b] focus:border-transparent text-sm"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-[#f59e0b] hover:bg-[#fbbf24] disabled:opacity-60 text-[#0a1628] font-semibold py-2.5 rounded-lg transition-colors"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}
