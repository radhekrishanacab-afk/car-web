import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata: Metadata = {
  title: {
    default: 'Admin — Radhe Krishna Cab',
    template: '%s | Admin — Radhe Krishna Cab',
  },
  robots: { index: false, follow: false },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Don't protect the login page itself
  return <AdminLayoutInner>{children}</AdminLayoutInner>
}

async function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  return children
}
