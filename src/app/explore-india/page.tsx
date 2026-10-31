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

export const metadata: Metadata = {
  title: 'Explore Incredible India — Tourist Places | Radhe Krishna Cabs & Taxi Service',
  description:
    'Discover amazing tourist destinations across India — temples, beaches, hill stations, forts, wildlife parks and more. Plan your trip with Radhe Krishna Cabs & Taxi Service.',
  keywords: ['tourist places India', 'explore India', 'India tourism', 'Radhe Krishna Cab travel'],
  openGraph: {
    title: 'Explore Incredible India — Tourist Places',
    description: 'Browse tourist destinations across all Indian states. Book taxi for your trip.',
    type: 'website',
  },
}

interface PageProps {
  searchParams: Promise<{ state?: string; category?: string; search?: string; page?: string }>
}

export default async function ExploreIndiaPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const stateSlug    = sp.state ?? ''
  const categorySlug = sp.category ?? ''
  const search       = sp.search ?? ''
  const page         = Math.max(1, parseInt(sp.page ?? '1'))

  const [result, states, categories] = await Promise.all([
    getAllPublishedPlaces({ stateSlug: stateSlug || undefined, categorySlug: categorySlug || undefined, search: search || undefined, page, perPage: 12 }).catch(() => ({ places: [], total: 0, pages: 0 })),
    getAllActiveStates().catch(() => []),
    getAllCategories().catch(() => []),
  ])

  return (
    <>
      <Header />
      <main>
        <ExploreIndiaClient
          places={result.places.map(p => ({
            id: p.id, name: p.name, slug: p.slug,
            shortDescription: p.shortDescription,
            featuredImage: p.featuredImage,
            cityName: p.cityName,
            latitude: p.latitude,
            longitude: p.longitude,
            category: p.category ? { name: p.category.name, icon: p.category.icon, slug: p.category.slug } : null,
            state: { name: p.state.name, slug: p.state.slug },
            district: p.district ? { name: p.district.name, slug: p.district.slug } : null,
          }))}
          total={result.total}
          page={page}
          pages={result.pages}
          states={states.map(s => ({
            id: s.id, name: s.name, slug: s.slug, code: s.code,
            region: s.region ?? '', placeCount: s.placeCount,
            latitude: s.latitude, longitude: s.longitude,
          }))}
          categories={categories.map(c => ({
            id: c.id, name: c.name, slug: c.slug,
            icon: c.icon ?? '', placeCount: c.placeCount,
          }))}
          mapPlaces={[]}
          initialState={stateSlug}
          initialCategory={categorySlug}
          initialSearch={search}
        />
      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
    </>
  )
}
