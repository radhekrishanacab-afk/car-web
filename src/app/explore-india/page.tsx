import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import ExploreIndiaClient from '@/components/explore/ExploreIndiaClient'
import {
  getAllPublishedPlaces,
  getAllActiveStates,
  getAllCategories,
} from '@/lib/services/explore-service'
import { pageMetadata, jsonLdHtml, breadcrumbJsonLd, absoluteUrl, SITE_NAME } from '@/lib/site'

export const revalidate = 3600

interface PageProps {
  searchParams: Promise<{ state?: string; category?: string; search?: string; page?: string }>
}

type PlacesResult = Awaited<ReturnType<typeof getAllPublishedPlaces>>
type StatesResult = Awaited<ReturnType<typeof getAllActiveStates>>
type CategoriesResult = Awaited<ReturnType<typeof getAllCategories>>

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const sp = await searchParams
  const isFiltered = Boolean(
    sp.state || sp.category || sp.search || (sp.page && sp.page !== '1'),
  )
  return pageMetadata({
    title: 'Tourist Places in India — Book a Taxi | Radhe Krishna Cab',
    description:
      'Explore tourist destinations, temples, hill stations and beaches across Gujarat & India. Book a reliable taxi with Radhe Krishna Cab for your sightseeing trip. Call +91 97230 97832.',
    path: '/explore-india',
    keywords: [
      'tourist places India',
      'taxi for sightseeing India',
      'Gujarat tourist destinations',
      'book taxi for tourism',
      'Gujarat sightseeing cab',
    ],
    // Filtered / paginated facet URLs are kept out of the index to avoid
    // thin duplicate pages, but stay crawlable (follow) for link discovery.
    noindex: isFiltered,
  })
}

export default async function ExploreIndiaPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const stateSlug = sp.state ?? ''
  const categorySlug = sp.category ?? ''
  const search = sp.search ?? ''
  const page = Math.max(1, parseInt(sp.page ?? '1', 10) || 1)

  let places: PlacesResult['places'] = []
  let total = 0
  let pages = 0
  let states: StatesResult = []
  let categories: CategoriesResult = []

  try {
    const [result, statesRaw, categoriesRaw] = await Promise.all([
      getAllPublishedPlaces({
        stateSlug: stateSlug || undefined,
        categorySlug: categorySlug || undefined,
        search: search || undefined,
        page,
        perPage: 12,
      }),
      getAllActiveStates(),
      getAllCategories(),
    ])
    places = result.places
    total = result.total
    pages = result.pages
    states = statesRaw
    categories = categoriesRaw
  } catch {
    places = []
    total = 0
    pages = 0
    states = []
    categories = []
  }

  return (
    <>
      <Header />
      <main>
        <ExploreIndiaClient
          places={places}
          total={total}
          page={page}
          pages={pages}
          states={states.map((s) => ({ ...s, region: s.region ?? '' }))}
          categories={categories.map((c) => ({ ...c, icon: c.icon ?? '' }))}
          initialState={stateSlug}
          initialCategory={categorySlug}
          initialSearch={search}
        />
      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml(
            breadcrumbJsonLd([
              { name: 'Home', url: '/' },
              { name: 'Tourist Places', url: '/explore-india' },
            ]),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdHtml({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: `Tourist Places in India — ${SITE_NAME}`,
            numberOfItems: total,
            itemListElement: places.slice(0, 12).map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              url: absoluteUrl(`/explore-india/${p.state.slug}/${p.district?.slug ?? '_'}/${p.slug}`),
              name: p.name,
            })),
          }),
        }}
      />
    </>
  )
}
