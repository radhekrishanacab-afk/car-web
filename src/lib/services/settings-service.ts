import { prisma } from '../prisma'

const defaultSettings = {
  id: 0,
  businessName: 'Radhe Krishana Cabs & Taxi Service',
  phone: '+91 97230 97832',
  whatsappNumber: '919723097832',
  email: 'info@radhekrishanacab.com',
  address: 'Gujarat, India',
  logoUrl: null as string | null,
  metaDescription: 'Premium taxi and cab service across Gujarat.',
  createdAt: new Date(),
  updatedAt: new Date(),
}

export async function getContactSettings() {
  try {
    const settings = await prisma.contactSettings.findFirst()
    return settings ?? defaultSettings
  } catch {
    return defaultSettings
  }
}
