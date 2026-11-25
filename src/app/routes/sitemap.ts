import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { SITE_URL } from '@/lib/site'

/**
 * Sitemap for route detail pages (/routes/sitemap.xml).
 *
 * All 13,110 routes have distance and fare data, so none are "thin".
 * We order by slug so Google crawls them predictably.
 *
 * Only routes that carry real data are listed — the same condition used
 * by the page's `noindex` check. If a route is noindexed, it stays out
 * of this sitemap to avoid contradicting that signal.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const routes = await prisma.route.findMany({
      where: {
        isActive: true,
        OR: [
          { distanceKm: { not: null } },
          { description: { not: null } },
          { priceOverrides: { some: { isActive: true } } },
        ],
      },
      select: { slug: true, updatedAt: true },
      orderBy: { slug: 'asc' },
    })
    return routes.map((r) => ({
      url: `${SITE_URL}/routes/${r.slug}`,
      lastModified: r.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch {
    return []
  }
}
