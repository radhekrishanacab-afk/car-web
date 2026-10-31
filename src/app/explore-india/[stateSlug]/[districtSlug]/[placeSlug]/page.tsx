import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import { getPlaceBySlug } from '@/lib/services/explore-service'
import PlaceDetailClient from '@/components/explore/PlaceDetailClient'

interface PageProps {
  params: Promise<{ stateSlug: string; districtSlug: string; placeSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { placeSlug } = await params
  const place = await getPlaceBySlug(placeSlug).catch(() => null)
  if (!place) return {}
  const title = place.seoTitle || `${place.name} — ${place.state.name} | Radhe Krishna Cabs`
  const description = place.seoDescription || place.shortDescription || `Visit ${place.name} in ${place.state.name}. Book taxi with Radhe Krishna Cabs.`
  return {
    title, description,
    openGraph: { title, description, type: 'website' },
    alternates: { canonical: `https://radhekrishanacab.com/explore-india/${place.state.slug}/${place.district?.slug ?? '_'}/${place.slug}` },
  }
}

export default async function PlaceDetailPage({ params }: PageProps) {
  const { placeSlug, stateSlug } = await params
  const place = await getPlaceBySlug(placeSlug).catch(() => null)
  if (!place) notFound()

  return (
    <>
      <Header />
      <main>
        <PlaceDetailClient
          place={{
            id: place.id,
            name: place.name,
            slug: place.slug,
            shortDescription: place.shortDescription,
            description: place.description,
            featuredImage: place.featuredImage,
            address: place.address,
            latitude: place.latitude,
            longitude: place.longitude,
            cityName: place.cityName,
            visitingHours: place.visitingHours,
            entryFee: place.entryFee,
            bestTimeToVisit: place.bestTimeToVisit,
            visitDuration: place.visitDuration,
            tags: place.tags,
            seoTitle: place.seoTitle,
            category: place.category ? { name: place.category.name, icon: place.category.icon, slug: place.category.slug } : null,
            state: { name: place.state.name, slug: place.state.slug },
            district: place.district ? { name: place.district.name, slug: place.district.slug } : null,
          }}
          stateSlug={stateSlug}
        />
      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
    </>
  )
}
