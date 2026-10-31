import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms & Conditions — Radhe Krishna Cab',
  description: 'Terms and conditions for using Radhe Krishna Cab taxi service.',
}

export default function TermsPage() {
  return (
    <>
      <Header />
      <main>
        <div className="hero-gradient text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="text-sm text-gray-400 mb-4" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#fbbf24]">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-white">Terms &amp; Conditions</span>
            </nav>
            <h1 className="text-4xl font-bold">Terms &amp; Conditions</h1>
          </div>
        </div>

        <div className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-gray-500 text-sm mb-8">Last updated: October 2026</p>

            {[
              {
                title: '1. Service Nature',
                body: 'Radhe Krishna Cab operates as an enquiry-based taxi service. All bookings are confirmed via WhatsApp communication with our team. No advance online payment is required or accepted.',
              },
              {
                title: '2. Booking Confirmation',
                body: 'A booking is only confirmed when our team explicitly confirms it via phone call or WhatsApp message. Submitting an enquiry form does not constitute a confirmed booking.',
              },
              {
                title: '3. Fare and Pricing',
                body: 'Fares quoted are estimates. Final fare depends on actual distance, applicable tolls, state taxes, night charges (10 PM – 6 AM), and driver allowance for outstation trips. All charges are communicated before you confirm the booking.',
              },
              {
                title: '4. Payment',
                body: 'Payment is made directly to the driver at the end of the trip — cash or UPI. No advance payment is collected. Radhe Krishna Cab does not operate any payment gateway.',
              },
              {
                title: '5. Cancellation',
                body: 'Cancellations must be communicated at least 2 hours before the pickup time. Late cancellations may incur a cancellation fee at the driver\'s discretion. Contact us on WhatsApp or phone to cancel.',
              },
              {
                title: '6. Passenger Responsibility',
                body: 'Passengers are responsible for their personal belongings throughout the trip. Radhe Krishna Cab is not liable for loss of personal property inside the vehicle.',
              },
              {
                title: '7. Conduct',
                body: 'Passengers are expected to behave respectfully towards the driver. The driver has the right to end the trip if passengers behave in a threatening, abusive, or illegal manner.',
              },
              {
                title: '8. Force Majeure',
                body: 'We are not liable for delays or cancellations caused by circumstances beyond our control including weather, road closures, natural disasters, or government restrictions.',
              },
              {
                title: '9. Changes',
                body: 'These terms may be updated at any time. Continued use of our service constitutes acceptance of the current terms.',
              },
              {
                title: '10. Contact',
                body: 'For any service-related queries: +91 97230 97832 | info@radhekrishanacab.com',
              },
            ].map((s) => (
              <div key={s.title} className="mb-8">
                <h2 className="text-xl font-bold text-[#0a1628] mb-3">{s.title}</h2>
                <p className="text-gray-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
