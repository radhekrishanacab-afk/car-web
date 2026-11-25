import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { SITE_URL } from '@/lib/site'

/**
 * Core sitemap (/sitemap.xml).
 * Covers static marketing pages and all active city landing pages.
 *
 * Large collections have their own sitemaps declared in robots.ts:
 *   /routes/sitemap.xml  · /blog/sitemap.xml  · /explore-india/sitemap.xml
 */
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,               lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/services`,        lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/routes`,          lastModified: now, changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/vehicles`,        lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/explore-india`,   lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${SITE_URL}/about`,           lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/blog`,            lastModified: now, changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${SITE_URL}/contact`,         lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/faq`,             lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/privacy-policy`,  lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${SITE_URL}/terms`,           lastModified: now, changeFrequency: 'yearly',  priority: 0.3 },
  ]

  try {
    const cities = await prisma.city.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { name: 'asc' },
    })
    const cityPages: MetadataRoute.Sitemap = cities.map((c) => ({
      url: `${SITE_URL}/routes/city/${c.slug}`,
      lastModified: c.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
    return [...staticPages, ...cityPages]
  } catch {
    return staticPages
  }
}
