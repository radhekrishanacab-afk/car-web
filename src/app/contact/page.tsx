import type { Metadata } from 'next'
import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import ContactForm from '@/components/contact/ContactForm'
import ContactCards from '@/components/contact/ContactCards'
import Link from 'next/link'
import { MessageCircle, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us — Radhe Krishna Cab | +91 97230 97832',
  description:
    'Contact Radhe Krishna Cab for taxi booking enquiries. Call or WhatsApp +91 97230 97832. Serving all major cities in Gujarat.',
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>

        {/* ── Hero ── */}
        <section style={{
          background: 'linear-gradient(135deg, #0f1e3d 0%, #1a3a6b 55%, #0d1f3c 100%)',
          position: 'relative', overflow: 'hidden',
        }} className="py-14 sm:py-16 lg:py-20">
          <div style={{
            position: 'absolute', top: 0, right: 0, pointerEvents: 'none',
            width: '480px', height: '480px',
            background: 'radial-gradient(circle at 80% 20%, rgba(8,169,238,0.12), transparent 60%)',
          }} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ position: 'relative' }}>
            <nav style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem' }}>
              <Link href="/" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Home</Link>
              <span style={{ margin: '0 0.5rem' }}>/</span>
              <span style={{ color: '#ffffff' }}>Contact Us</span>
            </nav>
            <span className="section-overline">GET IN TOUCH</span>
            <h1 style={{ color: '#ffffff', marginTop: '0.5rem', marginBottom: '1rem', lineHeight: 1.2,
              fontSize: 'clamp(1.875rem, 4vw, 2.875rem)' }}>
              Contact <span style={{ color: '#08A9EE' }}>Radhe Krishna Cab</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.62)', fontSize: '1rem', lineHeight: 1.8, maxWidth: '36rem' }}>
              Reach us on call or WhatsApp for quick responses.
              We&apos;re available 24×7 — no holidays, no off days.
            </p>
          </div>
        </section>

        {/* ── Main Content ── */}
        <section className="py-12 sm:py-16 lg:py-18" style={{ background: '#f8fafc' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">

              {/* ── Left: Contact Info ── */}
              <div className="lg:col-span-5">
                {/* Overline pill */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  background: '#EAF6FF', borderRadius: '999px',
                  padding: '0.3rem 0.875rem', marginBottom: '1rem',
                }}>
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: '#08A9EE', display: 'inline-block',
                  }} />
                  <span style={{
                    fontSize: '0.6875rem', fontWeight: 700,
                    color: '#08A9EE', letterSpacing: '0.12em', textTransform: 'uppercase',
                  }}>
                    Reach Us
                  </span>
                </div>

                <h2 style={{
                  color: '#10264A', marginBottom: '0.75rem', lineHeight: 1.2,
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                }}>
                  We&apos;re here to <span style={{ color: '#08A9EE' }}>help you</span>
                </h2>
                <p style={{
                  color: '#64748b', fontSize: '0.9375rem',
                  lineHeight: 1.7, marginBottom: '1.5rem',
                }}>
                  Call us, WhatsApp us, or send an email.
                  Our team responds fast and confirms bookings quickly.
                </p>

                <ContactCards />

                {/* Booking reassurance */}
                <div style={{
                  marginTop: '1rem',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.875rem',
                  padding: '0.875rem 1rem',
                }}>
                  <div style={{
                    width: '2.5rem', height: '2.5rem', flexShrink: 0,
                    background: '#EAF6FF',
                    borderRadius: '0.75rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Zap size={18} color="#08A9EE" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#10264A', lineHeight: 1.35 }}>
                      Fast booking confirmation
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '2px', lineHeight: 1.5 }}>
                      Most trips are confirmed within 5 minutes.
                    </div>
                  </div>
                </div>

              </div>

              {/* ── Right: Form ── */}
              <div id="enquiry" className="lg:col-span-7">
                <div style={{
                  background: '#ffffff',
                  borderRadius: '1.25rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 12px 36px rgba(16,38,74,0.08)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '4px',
                    background: '#08A9EE',
                  }} />

                  <div className="p-5 sm:p-7 lg:p-8">
                    {/* Form header */}
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                      marginBottom: '1.5rem',
                      paddingBottom: '1.25rem',
                      borderBottom: '1px solid #f3f4f6',
                    }}>
                      <div style={{
                        width: '2.75rem', height: '2.75rem', flexShrink: 0,
                        background: 'linear-gradient(135deg, #EAF6FF, #dbeeff)',
                        borderRadius: '0.875rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(8,169,238,0.15)',
                      }}>
                        <MessageCircle size={18} color="#08A9EE" />
                      </div>
                      <div>
                        <span style={{
                          display: 'inline-block',
                          fontSize: '0.75rem', fontWeight: 700,
                          color: '#08A9EE', letterSpacing: '0.08em',
                          textTransform: 'uppercase', marginBottom: '0.25rem',
                        }}>
                          Quick Enquiry
                        </span>
                        <h2 style={{
                          color: '#10264A', fontSize: 'clamp(1.125rem, 3vw, 1.375rem)',
                          fontWeight: 800, lineHeight: 1.25, margin: 0,
                        }}>
                          Send a booking enquiry
                        </h2>
                        <p style={{
                          fontSize: '0.875rem', color: '#64748b',
                          lineHeight: 1.6, marginTop: '0.3rem',
                        }}>
                          Share your trip details and we&apos;ll help you choose the right cab.
                        </p>
                      </div>
                    </div>

                    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>Loading form…</div>}>
                      <ContactForm />
                    </Suspense>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>
      <Footer />
      <WhatsAppButton variant="floating" />
    </>
  )
}
