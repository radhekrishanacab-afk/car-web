import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import RoutesClient from '@/components/routes/RoutesClient'
import { getPopularCities } from '@/lib/services/city-service'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'All Taxi Routes — One Way & Outstation Cabs | Radhe Krishna Cab',
  description:
    'Browse all intercity taxi routes across Gujarat and India. Select your pickup city to see available one-way cab routes with fixed fares. Radhe Krishna Cab.',
  openGraph: {
    title: 'Taxi Routes — One Way Cabs | Radhe Krishna Cab',
    description: 'Find one-way taxi routes between all major cities. Fixed prices, verified drivers.',
    type: 'website',
  },
}

const PER_PAGE = 12

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>
}

export default async function RoutesPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const search = sp.search ?? ''
  const page = Math.max(1, parseInt(sp.page ?? '1'))

  const where = {
    isActive: true,
    ...(search ? { name: { contains: search } } : {}),
  }

  let citiesRaw: Awaited<ReturnType<typeof prisma.city.findMany>> = []
  let total = 0
  let popularCities: Awaited<ReturnType<typeof getPopularCities>> = []

  try {
    ;[citiesRaw, total, popularCities] = await Promise.all([
      prisma.city.findMany({
        where,
        include: {
          _count: {
            select: { routesFrom: { where: { isActive: true } } },
          },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
      }),
      prisma.city.count({ where }),
      getPopularCities().catch(() => []),
    ])
  } catch {
    citiesRaw = []
    total = 0
    popularCities = []
  }

  const pages = Math.ceil(total / PER_PAGE)
  const cities = citiesRaw.map((c) => ({ ...c, routeCount: c._count.routesFrom }))

  return (
    <>
      <Header />
      <main>
        <RoutesClient
          cities={cities}
          popularCities={popularCities}
          total={total}
          page={page}
          pages={pages}
          initialSearch={search}
        />
      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
    </>
  )
}
