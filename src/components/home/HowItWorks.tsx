import { Send, CheckCircle, CalendarCheck, Car } from 'lucide-react'

const steps = [
  { step: '01', icon: Send,         title: 'Send Enquiry',      description: 'Fill the booking form or WhatsApp us with your pickup, destination, and travel date.' },
  { step: '02', icon: CheckCircle,  title: 'Get Fare Details',  description: 'Our team confirms vehicle availability and shares the fare for your route.' },
  { step: '03', icon: CalendarCheck,title: 'Confirm Booking',   description: 'Confirm on WhatsApp. Your driver details will be shared before your trip.' },
  { step: '04', icon: Car,          title: 'Travel Comfortably',description: 'Your AC cab arrives on time. Pay directly to the driver after the trip.' },
]

export default function HowItWorks() {
  return (
    <section style={{ padding: '5rem 0', background: 'linear-gradient(180deg, #0d1f3c 0%, #10264A 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span className="section-overline">HOW IT WORKS</span>
          <h2 style={{ color: '#ffffff', marginTop: '0.5rem', marginBottom: '1rem' }}>
            Simple 4-Step Process
          </h2>
          <p style={{ color: 'rgba(156,163,175,0.9)', fontSize: '1rem', maxWidth: '34rem', margin: '0 auto', textAlign: 'center', lineHeight: 1.75 }}>
            Book your cab in minutes — simple, transparent, and hassle-free.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => {
            const Icon = s.icon
            return (
              <div key={s.step} className="relative text-center">
                {/* Connector */}
                {i < steps.length - 1 && (
                  <div
                    className="hidden lg:block absolute"
                    style={{
                      top: '2rem', left: 'calc(50% + 2.75rem)',
                      right: 'calc(-50% + 2.75rem)',
                      height: '1px', background: 'rgba(255,255,255,0.08)', zIndex: 0,
                    }}
                  />
                )}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  {/* Icon box */}
                  <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1.25rem' }}>
                    <div
                      className="flex items-center justify-center mx-auto rounded-2xl"
                      style={{ width: '4rem', height: '4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <Icon className="w-7 h-7" style={{ color: '#08A9EE' }} />
                    </div>
                    <span
                      className="absolute flex items-center justify-center rounded-full"
                      style={{
                        top: '-8px', right: '-8px',
                        width: '1.375rem', height: '1.375rem',
                        background: '#08A9EE', color: '#fff',
                        fontSize: '0.625rem', fontWeight: 800,
                        boxShadow: '0 2px 8px rgba(8,169,238,0.4)',
                      }}
                    >
                      {s.step}
                    </span>
                  </div>
                  <h3 style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700, marginBottom: '0.625rem' }}>
                    {s.title}
                  </h3>
                  <p style={{ color: 'rgba(156,163,175,0.85)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                    {s.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
