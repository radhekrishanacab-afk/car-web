import type { Metadata } from 'next'
import SeoManager from '@/components/admin/SeoManager'
import RouteSeoManager from '@/components/admin/RouteSeoManager'
import BulkSeoGenerator from '@/components/admin/BulkSeoGenerator'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = { title: 'SEO Settings' }

const DEFAULT_PAGES = [
  { pageKey: 'home',     pageLabel: 'Home Page' },
  { pageKey: 'about',    pageLabel: 'About Us' },
  { pageKey: 'vehicles', pageLabel: 'Our Fleet' },
  { pageKey: 'services', pageLabel: 'Services' },
  { pageKey: 'routes',   pageLabel: 'Routes' },
  { pageKey: 'faq',      pageLabel: 'FAQ' },
  { pageKey: 'contact',  pageLabel: 'Contact Us' },
]

export default async function SeoPage() {
  // Seed defaults
  for (const page of DEFAULT_PAGES) {
    await prisma.seoSettings.upsert({
      where: { pageKey: page.pageKey },
      update: {},
      create: {
        pageKey: page.pageKey,
        pageLabel: page.pageLabel,
        title: `${page.pageLabel} — Radhe Krishna Cab`,
        description: 'Reliable taxi and cab service across Gujarat & India.',
        keywords: 'taxi Gujarat, cab service, outstation cab',
        ogTitle: `${page.pageLabel} — Radhe Krishna Cab`,
        ogDesc: 'Reliable taxi and cab service across Gujarat & India.',
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

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">SEO Settings</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage title, description and keywords for each page and route. Unique keywords per route improve search-engine discoverability.
        </p>
      </div>

      <div className="space-y-10">

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
