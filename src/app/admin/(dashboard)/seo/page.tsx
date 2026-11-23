import type { Metadata } from 'next'
import SeoManager from '@/components/admin/SeoManager'
import RouteSeoManager from '@/components/admin/RouteSeoManager'
import BulkSeoGenerator from '@/components/admin/BulkSeoGenerator'
import { prisma } from '@/lib/prisma'
import { PAGE_SEO_DEFAULTS } from '@/lib/site'

export const metadata: Metadata = { title: 'SEO Settings' }

const PAGE_LABELS: Record<string, string> = {
  home: 'Home Page',
  about: 'About Us',
  vehicles: 'Our Fleet',
  services: 'Services',
  routes: 'Routes',
  faq: 'FAQ',
  contact: 'Contact Us',
}

// Seed values reuse the canonical per-page defaults so the database rows and the
// hard-coded page metadata never diverge.
const DEFAULT_PAGES = Object.entries(PAGE_LABELS).map(([pageKey, pageLabel]) => {
  const seo = PAGE_SEO_DEFAULTS[pageKey]
  return {
    pageKey,
    pageLabel,
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords.join(', '),
    ogTitle: seo.title,
    ogDesc: seo.description,
  }
})

export default async function SeoPage() {
  // Seed defaults
  for (const page of DEFAULT_PAGES) {
    await prisma.seoSettings.upsert({
      where: { pageKey: page.pageKey },
      update: {},
      create: {
        pageKey: page.pageKey,
        pageLabel: page.pageLabel,
        title: page.title,
        description: page.description,
        keywords: page.keywords,
        ogTitle: page.ogTitle,
        ogDesc: page.ogDesc,
      },
    })
  }

  const [pages, routes] = await Promise.all([
    prisma.seoSettings.findMany({ orderBy: { pageKey: 'asc' } }),
    prisma.route.findMany({
      include: {
        originCity: { select: { name: true } },
        destinationCity: { select: { name: true } },
      },
      orderBy: [{ originCity: { name: 'asc' } }, { destinationCity: { name: 'asc' } }],
    }),
  ])

  const hasSeoCount = routes.filter((r) => r.seoTitle || r.seoDescription).length
  const missingSeoCount = routes.length - hasSeoCount

  // Serialise routes for client components
  const serialisedRoutes = routes.map((r) => ({
    id: r.id,
    slug: r.slug,
    distanceKm: r.distanceKm != null ? Number(r.distanceKm) : null,
    seoTitle: r.seoTitle,
    seoDescription: r.seoDescription,
    seoKeywords: r.seoKeywords,
    originCity: { name: r.originCity.name },
    destinationCity: { name: r.destinationCity.name },
  }))

  // ── SEO health checks (missing / duplicate metadata detection) ──
  const pagesMissingMeta = pages.filter((p) => !p.title?.trim() || !p.description?.trim()).length
  const pagesShortTitle = pages.filter((p) => {
    const n = p.title?.trim().length ?? 0
    return n > 0 && n < 30
  }).length
  const pagesLongTitle = pages.filter((p) => (p.title?.trim().length ?? 0) > 60).length
  const pagesLongDesc = pages.filter((p) => (p.description?.trim().length ?? 0) > 160).length

  const countDuplicates = (values: (string | null)[]) => {
    const counts = new Map<string, number>()
    for (const v of values) {
      const key = v?.trim()
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    return [...counts.values()].filter((c) => c > 1).reduce((sum, c) => sum + c, 0)
  }
  const dupRouteTitles = countDuplicates(routes.map((r) => r.seoTitle))
  const dupRouteDescs = countDuplicates(routes.map((r) => r.seoDescription))
  const dupPageTitles = countDuplicates(pages.map((p) => p.title))

  const health = [
    { label: 'Pages missing title / description', value: pagesMissingMeta, warn: pagesMissingMeta > 0 },
    { label: 'Page titles under 30 chars', value: pagesShortTitle, warn: pagesShortTitle > 0 },
    { label: 'Page titles over 60 chars', value: pagesLongTitle, warn: pagesLongTitle > 0 },
    { label: 'Page descriptions over 160 chars', value: pagesLongDesc, warn: pagesLongDesc > 0 },
    { label: 'Duplicate page titles', value: dupPageTitles, warn: dupPageTitles > 0 },
    { label: 'Routes missing SEO', value: missingSeoCount, warn: missingSeoCount > 0 },
    { label: 'Duplicate route titles', value: dupRouteTitles, warn: dupRouteTitles > 0 },
    { label: 'Duplicate route descriptions', value: dupRouteDescs, warn: dupRouteDescs > 0 },
  ]

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Settings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage title, description and keywords for each page and route. Unique keywords per route improve search-engine discoverability.
          </p>
        </div>
        <a
          href="/api/admin/seo/export"
          className="flex-shrink-0 inline-flex items-center gap-2 border border-gray-300 hover:border-[#0a1628] hover:text-[#0a1628] text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          Export CSV
        </a>
      </div>

      <div className="space-y-10">

        {/* Section 0: SEO Health */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-1">SEO Health</h2>
          <p className="text-xs text-gray-500 mb-4">
            Automatic missing / duplicate metadata detection across pages and routes.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {health.map((h) => (
              <div
                key={h.label}
                className={`rounded-lg border p-3 ${h.warn ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'}`}
              >
                <div className={`text-2xl font-bold ${h.warn ? 'text-amber-700' : 'text-green-700'}`}>{h.value}</div>
                <div className={`text-xs mt-0.5 leading-snug ${h.warn ? 'text-amber-700' : 'text-green-700'}`}>{h.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200" />

        {/* Section 1: Page SEO */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#0a1628] text-white rounded-lg flex items-center justify-center text-sm font-bold">P</div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Page SEO</h2>
              <p className="text-xs text-gray-500">Home, About, Vehicles, Services, Routes, FAQ, Contact</p>
            </div>
          </div>
          <SeoManager initialPages={pages} />
        </div>

        <div className="border-t border-gray-200" />

        {/* Section 2: Bulk Route SEO Generator */}
        {routes.length > 0 && (
          <>
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">⚡</div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Bulk SEO Generator</h2>
                  <p className="text-xs text-gray-500">
                    Auto-generate route-specific SEO for all eligible routes.
                    {missingSeoCount > 0 && <span className="text-amber-600 ml-1 font-medium">{missingSeoCount} route{missingSeoCount !== 1 ? 's' : ''} missing SEO.</span>}
                    {hasSeoCount > 0 && <span className="text-green-600 ml-1 font-medium">{hasSeoCount} route{hasSeoCount !== 1 ? 's' : ''} already have SEO.</span>}
                  </p>
                </div>
              </div>
              <BulkSeoGenerator routes={serialisedRoutes} />
            </div>

            <div className="border-t border-gray-200" />
          </>
        )}

        {/* Section 3: Individual Route SEO */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-[#1a3a6b] text-white rounded-lg flex items-center justify-center text-sm font-bold">R</div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Route SEO (Individual)</h2>
              <p className="text-xs text-gray-500">
                Edit SEO for each route individually. Manually set values are preserved during bulk generation unless you choose to overwrite.
              </p>
            </div>
          </div>

          {routes.length === 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
              <p className="text-amber-700 font-medium text-sm">No routes added yet.</p>
              <p className="text-amber-600 text-xs mt-1">Add routes from the <a href="/admin/routes" className="underline">Routes</a> section first.</p>
            </div>
          ) : (
            <RouteSeoManager routes={serialisedRoutes} />
          )}
        </div>

      </div>
    </div>
  )
}
