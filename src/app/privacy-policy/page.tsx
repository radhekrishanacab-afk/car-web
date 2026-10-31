import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — Radhe Krishna Cab',
  description: 'Privacy policy for Radhe Krishna Cab taxi service.',
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main>
        <div className="hero-gradient text-white py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="text-sm text-gray-400 mb-4" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-[#fbbf24]">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-white">Privacy Policy</span>
            </nav>
            <h1 className="text-4xl font-bold">Privacy Policy</h1>
          </div>
        </div>

        <div className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate max-w-none">
            <p className="text-gray-500 text-sm mb-8">Last updated: October 2026</p>

            <h2 className="text-xl font-bold text-[#0a1628] mt-8 mb-3">1. Information We Collect</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              When you use Radhe Krishna Cab&apos;s enquiry form or contact us, we may collect:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
              <li>Your name and mobile number</li>
              <li>Pickup and destination information</li>
              <li>Travel date and time preferences</li>
              <li>Any additional message you provide</li>
            </ul>

            <h2 className="text-xl font-bold text-[#0a1628] mt-8 mb-3">2. How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Information you provide is used solely to respond to your taxi booking enquiry and
              provide the requested cab service. We do not use your information for unsolicited
              marketing.
            </p>

            <h2 className="text-xl font-bold text-[#0a1628] mt-8 mb-3">3. WhatsApp Communication</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our enquiry forms direct you to WhatsApp to send your booking request. When you
              open WhatsApp through our website, your information is transmitted to WhatsApp
              (Meta Platforms) according to their privacy policy. We encourage you to review
              WhatsApp&apos;s privacy policy at whatsapp.com/legal/privacy-policy.
            </p>

            <h2 className="text-xl font-bold text-[#0a1628] mt-8 mb-3">4. Data Sharing</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We do not sell, rent, or share your personal information with third parties
              for commercial purposes. Driver information is shared with you only upon booking
              confirmation.
            </p>

            <h2 className="text-xl font-bold text-[#0a1628] mt-8 mb-3">5. Data Retention</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Enquiry records submitted through our website are retained for business operations
              purposes. You may request deletion of your data by contacting us.
            </p>

            <h2 className="text-xl font-bold text-[#0a1628] mt-8 mb-3">6. Cookies</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Our website uses only essential functional cookies (such as admin session management).
              No advertising or tracking cookies are used.
            </p>

            <h2 className="text-xl font-bold text-[#0a1628] mt-8 mb-3">7. Contact</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              For privacy-related questions, contact us at:{' '}
              <a href="tel:+919723097832" className="text-[#1a3a6b] hover:underline">
                +91 97230 97832
              </a>{' '}
              or{' '}
              <a href="mailto:info@radhekrishanacab.com" className="text-[#1a3a6b] hover:underline">
                info@radhekrishanacab.com
              </a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
