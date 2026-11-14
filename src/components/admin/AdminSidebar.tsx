'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Car, MapPin, Navigation, IndianRupee,
  CalendarCheck, MessageSquare, Settings, LogOut,
  Menu, X, ChevronRight, Search, Upload, Globe,
} from 'lucide-react'

const navItems = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { href: '/admin/bookings', icon: CalendarCheck, label: 'Bookings' },
  { href: '/admin/enquiries', icon: MessageSquare, label: 'Enquiries' },
  { href: '/admin/cities', icon: MapPin, label: 'Cities' },
  { href: '/admin/routes', icon: Navigation, label: 'Routes' },
  { href: '/admin/routes/import', icon: Upload, label: 'Bulk Import' },
  { href: '/admin/pricing', icon: IndianRupee, label: 'Route Pricing' },
  { href: '/admin/vehicles', icon: Car, label: 'Vehicles' },
  { href: '/admin/seo', icon: Search, label: 'SEO Settings' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
]

function NavLink({ item, onClick }: { item: typeof navItems[0]; onClick?: () => void }) {
  const pathname = usePathname()
  const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
        active
          ? 'bg-[#f59e0b] text-[#0a1628]'
          : 'text-gray-400 hover:text-white hover:bg-white/10'
      }`}
    >
      <item.icon className="w-4 h-4 shrink-0" />
      {item.label}
      {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
    </Link>
  )
}

export default function AdminSidebar() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#f59e0b] rounded-lg flex items-center justify-center shrink-0">
            <span className="text-[#0a1628] text-xs font-bold">RK</span>
          </div>
          <div>
            <div className="text-white text-sm font-bold leading-tight">Radhe Krishna Cab</div>
            <div className="text-gray-500 text-xs">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} onClick={onLinkClick} />
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-white/10 pt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-red-500/20 transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-[#0a1628] border-r border-white/10 fixed inset-y-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0a1628] border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#f59e0b] rounded flex items-center justify-center">
            <span className="text-[#0a1628] text-xs font-bold">RK</span>
          </div>
          <span className="text-white text-sm font-bold">Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 text-gray-300 hover:text-white"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 bg-[#0a1628] border-r border-white/10 flex flex-col">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-white"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent onLinkClick={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  )
}
