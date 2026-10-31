import { prisma } from './prisma'
import type { Metadata } from 'next'

export async function getPageSeo(pageKey: string): Promise<Metadata> {
  try {
    const seo = await prisma.seoSettings.findUnique({ where: { pageKey } })
    if (!seo) return {}
    return {
      title: seo.title,
      description: seo.description,
      keywords: seo.keywords ? seo.keywords.split(',').map(k => k.trim()) : undefined,
      openGraph: {
        title: seo.ogTitle ?? seo.title,
        description: seo.ogDesc ?? seo.description,
        type: 'website',
      },
    }
  } catch {
    return {}
  }
}
