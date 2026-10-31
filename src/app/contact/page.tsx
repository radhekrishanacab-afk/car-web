import type { Metadata } from 'next'
import { Suspense } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/ui/WhatsAppButton'
import ContactForm from '@/components/contact/ContactForm'
import ContactCards from '@/components/contact/ContactCards'
import Link from 'next/link'
import { MessageCircle, Clock } from 'lucide-react'

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
        <section className="py-14 sm:py-16 lg:py-20" style={{ background: '#ffffff' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-14">

              {/* ── Left: Contact Info ── */}
              <div className="lg:col-span-2">
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
                  color: '#10264A', marginBottom: '0.875rem', lineHeight: 1.2,
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                }}>
                  We&apos;re Here<br />
                  <span style={{ color: '#08A9EE' }}>to Help You</span>
                </h2>
                <p style={{
                  color: '#6B7280', fontSize: '0.9375rem',
                  lineHeight: 1.8, marginBottom: '1.75rem',
                }}>
                  Call us, WhatsApp us, or send an email.
                  Our team responds fast and confirms bookings quickly.
                </p>

                <ContactCards />

                {/* Business Hours Box */}
                <div style={{
                  marginTop: '1.25rem',
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  background: '#F0F9FF',
                  border: '1px solid #BAE6FD',
                  borderRadius: '0.875rem',
                  padding: '0.875rem 1.125rem',
                }}>
                  <div style={{
                    width: '2.5rem', height: '2.5rem', flexShrink: 0,
                    background: '#E0F2FE',
                    borderRadius: '0.625rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#0284C7',
                  }}>
                    <Clock size={19} color="#08A9EE" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0369A1', lineHeight: 1.3 }}>
                      Business Hours: 24/7 Available
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#0284C7', marginTop: '1px' }}>
                      Monday – Sunday: Open 24 Hours (Round the Clock)
                    </div>
                  </div>
                </div>

                {/* Trust badge */}
                <div style={{
                  marginTop: '1rem',
                  display: 'flex', alignItems: 'center', gap: '0.625rem',
                  background: 'linear-gradient(135deg, #0f1e3d, #1a3a6b)',
                  borderRadius: '0.875rem',
                  padding: '0.875rem 1.125rem',
                }}>
                  <div style={{
                    width: '2.5rem', height: '2.5rem', flexShrink: 0,
                    background: 'rgba(8,169,238,0.15)',
                    borderRadius: '0.625rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.125rem',
                  }}>
                    ⚡
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.3 }}>
                      Instant Confirmation
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', marginTop: '1px' }}>
                      Most bookings confirmed within 5 minutes
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Right: Form ── */}
              <div id="enquiry" className="lg:col-span-3">
                <div style={{
                  background: '#ffffff',
                  borderRadius: '1.5rem',
                  border: '1.5px solid #e5e7eb',
                  boxShadow: '0 8px 48px rgba(16,38,74,0.10)',
                  overflow: 'hidden',
                }}>
                  {/* Coloured top bar */}
                  <div style={{
                    height: '4px',
                    background: 'linear-gradient(90deg, #08A9EE 0%, #10264A 100%)',
                  }} />

                  <div className="p-5 sm:p-8 lg:p-10">
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
                          fontSize: '0.6875rem', fontWeight: 700,
                          color: '#08A9EE', letterSpacing: '0.12em',
                          textTransform: 'uppercase', marginBottom: '0.2rem',
                        }}>
                          Quick Enquiry
                        </span>
                        <h2 style={{
                          color: '#10264A', fontSize: 'clamp(1.125rem, 3vw, 1.375rem)',
                          fontWeight: 800, lineHeight: 1.25, margin: 0,
                        }}>
                          Send Us a Message
                        </h2>
                        <p style={{
                          fontSize: '0.8125rem', color: '#9CA3AF',
                          lineHeight: 1.6, marginTop: '0.25rem',
                        }}>
                          We&apos;ll open WhatsApp with your message — just press Send there.
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
