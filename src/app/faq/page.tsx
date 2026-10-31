import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import FAQSection from '@/components/home/FAQSection'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions — Radhe Krishna Cab',
  description:
    'Answers to common questions about Radhe Krishna Cab — booking, pricing, vehicles, payment, and more.',
}

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832'

export default function FAQPage() {
  return (
    <>
      <Header />
      <main>
        <div className="hero-gradient text-white py-14 sm:py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="text-sm text-gray-400 mb-4" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#08A9EE] transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-white">FAQ</span>
            </nav>
            <h1 className="text-4xl font-bold text-white mb-3">Frequently Asked Questions</h1>
            <p className="text-gray-300 text-lg max-w-2xl">
              Common questions about our taxi service, booking process, pricing, and more.
            </p>
          </div>
        </div>

        <FAQSection />

        <div className="py-16 lg:py-20 bg-white text-center">
          <p className="text-gray-600 mb-5">Didn&apos;t find your answer?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-[#08A9EE] hover:bg-[#0798d4] text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-md shadow-[#08A9EE]/25"
            >
              Contact Us
            </Link>
            <a
              href={`https://wa.me/${WA}?text=${encodeURIComponent('Hello! I have a question about Radhe Krishna Cab.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-md shadow-green-500/25"
            >
              <MessageCircle className="w-4 h-4" />
              Ask on WhatsApp
            </a>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
    </>
  )
}
