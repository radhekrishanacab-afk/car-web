import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const DEFAULT_PAGES = [
  { pageKey: 'home',     pageLabel: 'Home Page',     title: 'Radhe Krishna Cab — Taxi Service in India', description: 'Book reliable taxi and outstation cab service across India.', keywords: 'taxi India, cab service, outstation taxi, one way taxi' },
  { pageKey: 'about',    pageLabel: 'About Us',      title: 'About Us — Radhe Krishna Cab', description: 'Learn about Radhe Krishna Cab — trusted taxi service since 2020.', keywords: 'about Radhe Krishna Cab, trusted taxi service, cab since 2020' },
  { pageKey: 'vehicles', pageLabel: 'Our Fleet',     title: 'Our Fleet — Radhe Krishna Cab', description: 'Explore our fleet of AC cabs — Sedan, SUV, Innova Crysta and more.', keywords: 'cab fleet, Innova Crysta taxi, SUV cab, sedan taxi Gujarat' },
  { pageKey: 'services', pageLabel: 'Services',      title: 'Our Services — Radhe Krishna Cab', description: 'Airport transfer, city rides, outstation trips and corporate travel.', keywords: 'airport taxi, city cab, outstation service, corporate travel' },
  { pageKey: 'routes',   pageLabel: 'Routes',        title: 'Taxi Routes in Gujarat — Radhe Krishna Cab', description: 'Browse all intercity taxi routes across Gujarat.', keywords: 'Gujarat taxi routes, Ahmedabad to Surat cab, one way routes' },
  { pageKey: 'faq',      pageLabel: 'FAQ',           title: 'FAQ — Radhe Krishna Cab', description: 'Frequently asked questions about our cab service.', keywords: 'cab FAQ, taxi questions, booking help' },
  { pageKey: 'contact',  pageLabel: 'Contact Us',    title: 'Contact Us — Radhe Krishna Cab', description: 'Get in touch with Radhe Krishna Cab for bookings and enquiries.', keywords: 'contact cab service, book taxi, taxi enquiry Gujarat' },
]

async function requireAdmin() {
  const session = await getSession()
  if (!session) return null
  return session
}

export async function GET() {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Seed defaults if missing
  for (const page of DEFAULT_PAGES) {
    await prisma.seoSettings.upsert({
      where: { pageKey: page.pageKey },
      update: {},
      create: { ...page, ogTitle: page.title, ogDesc: page.description },
    })
  }

  const pages = await prisma.seoSettings.findMany({ orderBy: { pageKey: 'asc' } })
  return Response.json({ pages })
}

export async function PATCH(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { pageKey, title, description, keywords, ogTitle, ogDesc } = body

  if (!pageKey || !title || !description) {
    return Response.json({ error: 'pageKey, title and description are required' }, { status: 400 })
  }

  const updated = await prisma.seoSettings.upsert({
    where: { pageKey },
    update: { title, description, keywords: keywords ?? '', ogTitle: ogTitle ?? title, ogDesc: ogDesc ?? description },
    create: {
      pageKey,
      pageLabel: pageKey,
      title, description,
      keywords: keywords ?? '',
      ogTitle: ogTitle ?? title,
      ogDesc: ogDesc ?? description,
    },
  })

  return Response.json({ page: updated })
}
