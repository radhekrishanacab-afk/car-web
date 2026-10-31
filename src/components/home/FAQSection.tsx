'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'

const faqs = [
  { q: 'How do I book a cab?', a: "Fill the booking form on our website or WhatsApp us at +91 97230 97832 with your pickup location, destination, and travel date. We'll confirm availability and share fare details." },
  { q: 'Are your taxi prices fixed or do they change over time?', a: 'We believe in full pricing transparency. Our taxi fares are fixed at the time of booking based on your route and vehicle type. No surge pricing or hidden charges.' },
  { q: 'Is Radhe Krishna Cabs available for airport transfer?', a: 'Yes, we provide reliable airport pickup and drop services in Surat, Ahmedabad, Vadodara, and Rajkot with an on-time guarantee.' },
  { q: 'Are your drivers trained and professional?', a: 'All our chauffeurs are experienced, background-verified, and professionally trained to ensure a safe and comfortable journey.' },
  { q: 'Can I book a cab for the whole day?', a: 'Yes, we offer full-day cab services at affordable pricing. Contact us on WhatsApp or call to know custom day package rates.' },
  { q: 'What safety measures do you follow?', a: 'Our vehicles are regularly sanitized, GPS-enabled, and drivers follow all safety protocols for every trip.' },
  { q: 'Do you provide one-way taxi service?', a: 'Yes, we specialise in one-way intercity taxi across India. You only pay for the one-way distance — no return fare charges.' },
  { q: 'How is the fare calculated?', a: 'Fare depends on the vehicle type, distance, and trip type (one-way or round trip). Tolls and parking are transparently detailed upfront.' },
]

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-14 items-start">

          {/* ── Left Column: Heading & Desktop Image ── */}
          <div className="lg:col-span-2 text-center lg:text-left">
            {/* Overline with dash */}
            <div className="inline-flex items-center gap-2.5 mb-3 lg:mb-4">
              <div className="w-7 h-0.5 bg-[#08A9EE] rounded-full hidden lg:block" />
              <span className="section-overline !mb-0">FAQ</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#10264A] leading-tight mb-3">
              Frequently Asked{' '}
              <span className="text-[#08A9EE]">Questions</span>
            </h2>

            <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-lg mx-auto lg:mx-0 mb-6 lg:mb-8">
              Have questions about our cab service or the booking process? Find answers to the most common questions here.
            </p>

            {/* Decorative car image — desktop only (hidden on mobile to eliminate huge empty gaps) */}
            <div className="hidden lg:block relative w-full h-64 rounded-2xl overflow-hidden">
              <Image
                src="/images/faq-car.png"
                alt="Radhe Krishna Cab — SUV"
                fill
                sizes="380px"
                className="object-contain"
                style={{ filter: 'drop-shadow(0 14px 28px rgba(0,0,0,0.18))' }}
              />
            </div>
          </div>

          {/* ── Right Column: Accordion list ── */}
          <div className="lg:col-span-3">
            <div className="flex flex-col gap-3">
              {faqs.map((faq, i) => {
                const isOpen = open === i
                return (
                  <div
                    key={i}
                    style={{
                      borderRadius: 14,
                      border: `1.5px solid ${isOpen ? 'rgba(8,169,238,0.45)' : '#e2e8f0'}`,
                      background: isOpen ? '#f0f9ff' : '#ffffff',
                      overflow: 'hidden',
                      transition: 'all 0.18s ease',
                      boxShadow: isOpen ? '0 4px 16px rgba(8,169,238,0.08)' : 'none',
                    }}
                  >
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 18px',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        gap: 12,
                      }}
                    >
                      <span style={{
                        fontWeight: 700,
                        fontSize: 15,
                        color: isOpen ? '#0284c7' : '#10264A',
                        lineHeight: 1.4,
                        flex: 1,
                      }}>
                        {faq.q}
                      </span>
                      <ChevronDown
                        size={18}
                        style={{
                          flexShrink: 0,
                          color: isOpen ? '#08A9EE' : '#94a3b8',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease, color 0.2s ease',
                        }}
                      />
                    </button>

                    {isOpen && (
                      <div style={{
                        padding: '0 18px 16px',
                        fontSize: 13.5,
                        color: '#475569',
                        lineHeight: 1.7,
                      }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
