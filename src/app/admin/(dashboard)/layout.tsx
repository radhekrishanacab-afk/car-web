import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar />
      {/* Main content — offset by sidebar width on desktop, top bar height on mobile */}
      <div className="lg:pl-56 pt-14 lg:pt-0">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  )
}
