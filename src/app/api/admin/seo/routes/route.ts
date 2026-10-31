/**
 * POST /api/admin/seo/routes
 * Generate and save SEO for one or more routes.
 *
 * Protected: only seoTitle, seoDescription, seoKeywords are written.
 * This endpoint NEVER modifies distanceKm, fares, originCityId, destinationCityId.
 *
 * Body:
 *   { routeIds: number[], mode: 'all' | 'missing_only', overwriteManual?: boolean }
 */
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { generateRouteSeo } from '@/lib/content-generator'
import { z } from 'zod'

const BulkSeoSchema = z.object({
  routeIds: z.array(z.number().int().positive()).min(1).max(500),
  mode: z.enum(['all', 'missing_only']).default('missing_only'),
  overwriteManual: z.boolean().default(false),
})

async function requireAdmin() {
  const session = await getSession()
  return session ?? null
}

export async function POST(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = BulkSeoSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', issues: parsed.error.issues }, { status: 400 })
  }

  const { routeIds, mode, overwriteManual } = parsed.data

  const routes = await prisma.route.findMany({
    where: { id: { in: routeIds } },
    select: {
      id: true,
      slug: true,
      distanceKm: true,
      seoTitle: true,
      seoDescription: true,
      seoKeywords: true,
      originCity: { select: { name: true } },
      destinationCity: { select: { name: true } },
    },
  })

  type Result = { routeId: number; route: string; status: 'generated' | 'skipped' | 'error'; reason?: string }
  const results: Result[] = []
  let generated = 0
  let skipped = 0

  for (const route of routes) {
    const hasManualSeo = !!(route.seoTitle || route.seoDescription || route.seoKeywords)

    // Skip if manual SEO exists and overwrite is not requested
    if (hasManualSeo && !overwriteManual && mode === 'missing_only') {
      results.push({ routeId: route.id, route: `${route.originCity.name} → ${route.destinationCity.name}`, status: 'skipped', reason: 'Manual SEO exists' })
      skipped++
      continue
    }
    if (hasManualSeo && !overwriteManual && mode === 'all') {
      results.push({ routeId: route.id, route: `${route.originCity.name} → ${route.destinationCity.name}`, status: 'skipped', reason: 'Manual SEO preserved (overwriteManual=false)' })
      skipped++
      continue
    }

    try {
      const seo = generateRouteSeo(
        route.originCity.name,
        route.destinationCity.name,
        route.distanceKm ? Number(route.distanceKm) : null,
        route.slug,
      )

      // Only update SEO fields — never touches protected route data
      await prisma.route.update({
        where: { id: route.id },
        data: {
          seoTitle: seo.seoTitle,
          seoDescription: seo.seoDescription,
          seoKeywords: seo.seoKeywords,
        },
      })

      results.push({ routeId: route.id, route: `${route.originCity.name} → ${route.destinationCity.name}`, status: 'generated' })
      generated++
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      results.push({ routeId: route.id, route: `${route.originCity.name} → ${route.destinationCity.name}`, status: 'error', reason: msg })
    }
  }

  return Response.json({ summary: { total: routeIds.length, generated, skipped }, results })
}

/** GET — preview generated SEO for a single route without saving */
export async function GET(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const routeId = parseInt(request.nextUrl.searchParams.get('routeId') ?? '0')
  if (!routeId) return Response.json({ error: 'routeId required' }, { status: 400 })

  const route = await prisma.route.findUnique({
    where: { id: routeId },
    include: {
      originCity: { select: { name: true } },
      destinationCity: { select: { name: true } },
    },
  })
  if (!route) return Response.json({ error: 'Route not found' }, { status: 404 })

  const generated = generateRouteSeo(
    route.originCity.name,
    route.destinationCity.name,
    route.distanceKm ? Number(route.distanceKm) : null,
    route.slug,
  )

  return Response.json({
    routeId,
    existing: {
      seoTitle: route.seoTitle,
      seoDescription: route.seoDescription,
      seoKeywords: route.seoKeywords,
    },
    generated,
  })
}
