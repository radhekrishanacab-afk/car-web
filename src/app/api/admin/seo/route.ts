import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { PAGE_SEO_DEFAULTS } from '@/lib/site'

const PAGE_LABELS: Record<string, string> = {
  home: 'Home Page',
  about: 'About Us',
  vehicles: 'Our Fleet',
  services: 'Services',
  routes: 'Routes',
  faq: 'FAQ',
  contact: 'Contact Us',
}

const DEFAULT_PAGES = Object.entries(PAGE_LABELS).map(([pageKey, pageLabel]) => {
  const seo = PAGE_SEO_DEFAULTS[pageKey]
  return {
    pageKey,
    pageLabel,
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords.join(', '),
  }
})

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
