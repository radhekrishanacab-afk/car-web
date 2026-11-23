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
import BlogSection from '@/components/home/BlogSection'
import { getRoutesWithFares } from '@/lib/services/route-service'
import { getAllActiveCities } from '@/lib/services/city-service'
import { getActiveVehicles } from '@/lib/services/vehicle-service'
import { jsonLdHtml, faqJsonLd, HOME_FAQS, PAGE_SEO_DEFAULTS } from '@/lib/site'
import { buildPageMetadata } from '@/lib/seo'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('home', PAGE_SEO_DEFAULTS.home)
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

        {/* 7. Blog Posts */}
        <BlogSection />

        {/* 8. Book CTA */}
        <ContactCTA />
      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(faqJsonLd(HOME_FAQS)) }}
      />
    </>
  )
}
