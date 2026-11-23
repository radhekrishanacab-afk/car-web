import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { SITE_URL } from '@/lib/site'

/**
 * Sitemap for every one-way route detail page (served at /routes/sitemap.xml).
 * Route count can be large; the URL set stays well under Google's 50,000 limit.
 *
 * Only routes that carry real data (a distance, an admin description or at
 * least one active fare) are listed — the same ones the route page keeps in
 * the index. "Thin" routes are rendered with `noindex`, so listing them here
 * would contradict that signal.
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
