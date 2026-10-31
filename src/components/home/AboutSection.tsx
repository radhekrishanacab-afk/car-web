import Link from 'next/link'
import Image from 'next/image'
import { Phone, CheckCircle2, ArrowRight } from 'lucide-react'

const features = [
  'Background-verified professional chauffeurs',
  'Well-maintained clean vehicles',
  'Sedans, SUVs, Innova & Tempo Travellers',
  'Quick booking confirmation',
  'Transparent upfront pricing',
  '250+ cities across India',
]

export default function AboutSection() {
  return (
    <section className="py-16 lg:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── Image Column ── */}
          <div className="relative order-2 lg:order-1 max-w-xl mx-auto lg:max-w-none w-full">
            <div style={{
              borderRadius: '1.25rem',
              overflow: 'hidden',
              boxShadow: '0 12px 35px rgba(0,0,0,0.08)',
              border: '1.5px solid #e5e7eb',
              lineHeight: 0,
            }}>
              <Image
                src="/images/about-ertiga.jpg"
                alt="Radhe Krishna Cab — Taxi Service"
                width={680}
                height={460}
                className="w-full h-auto object-cover"
                style={{ width: '100%', height: 'auto', display: 'block' }}
                priority
              />
            </div>
          </div>

          {/* ── Content Column ── */}
          <div className="order-1 lg:order-2 text-center lg:text-left">
            <span className="section-overline">ABOUT US</span>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#10264A] leading-tight mt-2 mb-4">
              Your Trusted Travel<br />
              <span className="text-[#08A9EE]">Partner in India</span>
            </h2>

            <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0">
              Radhe Krishna Cab is a professional taxi and outstation cab service
              operating across India since 2020. We connect cities with safe,
              comfortable, and reliable intercity taxi service — for individuals,
              families, and corporate travellers.
            </p>

            {/* Feature Checklist — 2 Column */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 p-0 list-none max-w-lg mx-auto lg:mx-0 text-left">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#08A9EE] shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700 leading-snug">{f}</span>
                </li>
              ))}
            </ul>

            {/* Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <a href="tel:+919723097832" className="btn btn-primary">
                <Phone size={15} />
                <span>Call Now</span>
              </a>
              <Link href="/about" className="btn btn-outline">
                <span>More About Us</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
