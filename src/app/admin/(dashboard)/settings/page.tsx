import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import SettingsForm from '@/components/admin/SettingsForm'

export const metadata: Metadata = { title: 'Settings' }

export default async function SettingsPage() {
  const settings = await prisma.contactSettings.findFirst().catch(() => null)

  const data = settings ?? {
    id: null,
    businessName: 'Radhe Krishana Cabs & Taxi Service',
    phone: '+91 97230 97832',
    whatsappNumber: '919723097832',
    email: 'info@radhekrishanacab.com',
    address: 'Gujarat, India',
    logoUrl: null,
    metaDescription: 'Premium taxi and cab service across Gujarat.',
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Business Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage contact details and business information.</p>
      </div>
      <SettingsForm settings={data} />
    </div>
  )
}
