import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import 'leaflet/dist/leaflet.css'

/**
 * Plus Jakarta Sans — same font family as navyarides.com
 * Modern geometric sans-serif: clean headings, readable body, professional feel
 */
const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: {
    default: 'Radhe Krishana Cabs & Taxi Service',
    template: '%s | Radhe Krishana Cabs',
  },
  description:
    'Premium taxi and cab service across Gujarat. One-way and outstation cabs for Ahmedabad, Surat, Vadodara and all major cities.',
  keywords: ['taxi', 'cab', 'one way taxi', 'outstation cab', 'Gujarat taxi', 'Ahmedabad taxi'],
  openGraph: {
    type: 'website',
    siteName: 'Radhe Krishana Cabs & Taxi Service',
    locale: 'en_IN',
  },
}

// This app fetches live database data on every page load.
export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${plusJakarta.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
