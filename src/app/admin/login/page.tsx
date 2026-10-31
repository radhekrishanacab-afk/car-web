import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import LoginForm from '@/components/admin/LoginForm'

export const metadata: Metadata = { title: 'Admin Login' }

export default async function AdminLoginPage() {
  const session = await getSession()
  if (session) redirect('/admin')

  return (
    <div className="min-h-screen bg-[#0a1628] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#f59e0b] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-[#0a1628] text-2xl font-bold">RK</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Radhe Krishna Cab</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
