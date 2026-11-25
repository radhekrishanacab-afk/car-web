import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { SITE_URL } from '@/lib/site'

/** Sitemap for published tourist places (/explore-india/sitemap.xml). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const places = await prisma.touristPlace.findMany({
      where: { status: 'PUBLISHED' },
      select: {
        slug: true,
        updatedAt: true,
        isFeatured: true,
        state: { select: { slug: true } },
        district: { select: { slug: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })
    return places.map((p) => ({
      url: `${SITE_URL}/explore-india/${p.state.slug}/${p.district?.slug ?? '_'}/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: p.isFeatured ? 0.8 : 0.6,
    }))
  } catch {
    return []
  }
}
