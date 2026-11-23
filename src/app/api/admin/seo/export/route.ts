import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { SITE_URL } from '@/lib/site'

/**
 * Exports all managed SEO records (page-level `SeoSettings` and per-route SEO)
 * as a UTF-8 CSV the admin can open in Excel / Google Sheets.
 */
function csvCell(value: string | number | null | undefined): string {
  const s = value == null ? '' : String(value)
  return `"${s.replace(/"/g, '""')}"`
}

export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

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

  const header = ['type', 'key', 'label', 'title', 'description', 'keywords', 'canonical', 'og_title', 'og_description']

  const lines: string[] = [header.join(',')]

  for (const p of pages) {
    lines.push([
      csvCell('page'),
      csvCell(p.pageKey),
      csvCell(p.pageLabel),
      csvCell(p.title),
      csvCell(p.description),
      csvCell(p.keywords),
      csvCell(`${SITE_URL}${p.pageKey === 'home' ? '/' : `/${p.pageKey}`}`),
      csvCell(p.ogTitle),
      csvCell(p.ogDesc),
    ].join(','))
  }

  for (const r of routes) {
    const label = `${r.originCity.name} to ${r.destinationCity.name}`
    lines.push([
      csvCell('route'),
      csvCell(r.slug),
      csvCell(label),
      csvCell(r.seoTitle),
      csvCell(r.seoDescription),
      csvCell(r.seoKeywords),
      csvCell(`${SITE_URL}/routes/${r.slug}`),
      csvCell(r.seoTitle),
      csvCell(r.seoDescription),
    ].join(','))
  }

  const csv = '\uFEFF' + lines.join('\r\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="seo-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  })
}
