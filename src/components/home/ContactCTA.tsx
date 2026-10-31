import { Phone, MessageCircle } from 'lucide-react'

const WA = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832'

export default function ContactCTA() {
  return (
    <section
      className="py-16 lg:py-24 px-4 sm:px-6"
      style={{
        background: 'linear-gradient(135deg, #0f1e3d 0%, #1a3a6b 55%, #0d1f3c 100%)',
      }}
    >
      <div className="max-w-2xl mx-auto text-center">

        <span className="section-overline">GET IN TOUCH</span>

        <h2 style={{ color: '#ffffff', marginTop: '0.5rem', marginBottom: '1rem', lineHeight: 1.25 }}>
          Ready to Book Your Cab?
        </h2>

        <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: '1rem', lineHeight: 1.8, margin: '0 auto 2rem', maxWidth: '32rem' }}>
          Call us or send a WhatsApp message right now. Our team confirms your booking quickly.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full max-w-md mx-auto">
          <a
            href="tel:+919723097832"
            className="btn btn-primary w-full sm:w-auto"
            style={{ padding: '0.875rem 2rem', fontSize: '0.9375rem' }}
          >
            <Phone size={16} /> Call Now
          </a>
          <a
            href={`https://wa.me/${WA}?text=${encodeURIComponent('Hello! I want to book a cab from Radhe Krishna Cab.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-white w-full sm:w-auto"
            style={{ padding: '0.875rem 2rem', fontSize: '0.9375rem' }}
          >
            <MessageCircle size={16} /> WhatsApp Us
          </a>
        </div>

      </div>
    </section>
  )
}
