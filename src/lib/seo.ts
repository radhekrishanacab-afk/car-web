import { prisma } from './prisma'
import type { Metadata } from 'next'
import { pageMetadata } from './site'

type PageMetadataInput = Parameters<typeof pageMetadata>[0]

/**
 * Builds page metadata from the hard-coded defaults produced by `pageMetadata()`,
 * then overlays any admin-managed `SeoSettings` row for the given `pageKey`.
 *
 * The hard-coded defaults are always used as a safe fallback when no row exists,
 * when the row is empty, or when the database is unreachable (e.g. during a build
 * with no database connection). This keeps pages rendering even if the DB is down.
 */
export async function buildPageMetadata(
  pageKey: string,
  defaults: PageMetadataInput,
): Promise<Metadata> {
  const base = pageMetadata(defaults)
  try {
    const seo = await prisma.seoSettings.findUnique({ where: { pageKey } })
    if (!seo || (!seo.title && !seo.description)) return base

    const keywords = seo.keywords
      ? seo.keywords.split(',').map((k) => k.trim()).filter(Boolean)
      : []

    const titleIsAbsolute =
      typeof base.title === 'object' && base.title !== null && 'absolute' in base.title

    const title = seo.title
      ? titleIsAbsolute
        ? { absolute: seo.title }
        : seo.title
      : base.title

    const ogTitle = seo.ogTitle || seo.title
    const ogDesc = seo.ogDesc || seo.description

    return {
      ...base,
      title,
      description: seo.description || base.description,
      ...(keywords.length > 0 ? { keywords } : {}),
      openGraph: {
        ...(base.openGraph ?? {}),
        ...(ogTitle ? { title: ogTitle } : {}),
        ...(ogDesc ? { description: ogDesc } : {}),
      },
      twitter: {
        ...(base.twitter ?? {}),
        ...(ogTitle ? { title: ogTitle } : {}),
        ...(ogDesc ? { description: ogDesc } : {}),
      },
    }
  } catch {
    return base
  }
}
