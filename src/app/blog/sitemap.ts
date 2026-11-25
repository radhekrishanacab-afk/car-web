import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { SITE_URL } from '@/lib/site'

/** Sitemap for published blog posts (/blog/sitemap.xml). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true, updatedAt: true, isFeatured: true, publishedAt: true },
      orderBy: { publishedAt: 'desc' },
    })
    return posts.map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: p.isFeatured ? 0.8 : 0.6,
    }))
  } catch {
    return []
  }
}
