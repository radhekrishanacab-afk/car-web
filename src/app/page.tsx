import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import HeroSection from '@/components/home/HeroSection'
import AboutSection from '@/components/home/AboutSection'
import RouteFareSection from '@/components/home/RouteFareSection'
import VehicleSliderSection from '@/components/home/VehicleSliderSection'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import FAQSection from '@/components/home/FAQSection'
import ContactCTA from '@/components/home/ContactCTA'
import { getRoutesWithFares } from '@/lib/services/route-service'
import { getAllActiveCities } from '@/lib/services/city-service'
import { getActiveVehicles } from '@/lib/services/vehicle-service'

export const metadata: Metadata = {
  title: 'Radhe Krishna Cab — Taxi Service in India | One Way & Outstation Cabs',
  description:
    'Book reliable taxi and outstation cab service across India. One-way taxi, round trip, airport transfers from Ahmedabad, Surat, Vadodara, Rajkot and all major cities. Call +91 97230 97832.',
  keywords: [
    'taxi India', 'one way taxi', 'outstation cab',
    'Ahmedabad taxi', 'airport taxi India', 'Radhe Krishna Cab', 'cab service India',
  ],
  openGraph: {
    title: 'Radhe Krishna Cab — Taxi & cab service India',
    description: 'Reliable one-way and outstation taxi service across India.',
    type: 'website',
    url: 'https://radhekrishanacab.com',
  },
}

export default async function HomePage() {
  const [routesWithFares, allCities, vehicles] = await Promise.all([
    getRoutesWithFares(8).catch(() => []),
    getAllActiveCities().catch(() => []),
    getActiveVehicles().catch(() => []),
  ])

  return (
    <>
      <Header />
      <main>
        {/* 1. Hero */}
        <HeroSection vehicles={vehicles} />

        {/* 2. About */}
        <AboutSection />

        {/* 3. Popular Routes & Fares */}
        <RouteFareSection initialRoutes={routesWithFares} allCities={allCities} />

        {/* 4. Choose Your Next Trip — vehicle slider */}
        <VehicleSliderSection />

        {/* 5. Why Choose Us */}
        <WhyChooseUs />

        {/* 6. FAQ */}
        <FAQSection />

        {/* 7. Book CTA */}
        <ContactCTA />
      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
    </>
  )
}
