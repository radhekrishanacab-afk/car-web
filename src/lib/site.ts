/**
 * Central site-wide SEO configuration and structured-data (JSON-LD) builders.
 *
 * Only real, project-defined information is used here. Nothing (addresses,
 * ratings, reviews, coordinates, social profiles) is invented. Provider values
 * come from environment variables with the same fallbacks used across the app.
 */

import type { Metadata } from 'next'

export const SITE_URL = 'https://radhekrishanacab.com'
export const SITE_NAME = 'Radhe Krishna Cab'
export const SITE_TAGLINE = 'Taxi & Outstation Cab Service in Gujarat, India'
export const SITE_DESCRIPTION =
  'Book reliable taxi and outstation cab service across Gujarat and India. One-way taxi, round trip, airport transfers from Ahmedabad, Surat, Vadodara, Rajkot and all major cities.'

export const BUSINESS_PHONE_DISPLAY = process.env.NEXT_PUBLIC_BUSINESS_PHONE ?? '+91 97230 97832'
export const BUSINESS_PHONE_E164 = '+919723097832'
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '919723097832'
export const CONTACT_EMAIL = 'info@radhekrishanacab.com'

/** Existing brand asset used as the default social share image. */
export const OG_IMAGE = '/images/radhe-krishana-logo.png'

/** Service areas the business actually markets (never invent new ones). */
export const AREA_SERVED = [
  'Ahmedabad',
  'Surat',
  'Vadodara',
  'Rajkot',
  'Bhuj',
  'Dwarka',
  'Somnath',
  'Gujarat',
]

/** Real social profiles, used as `sameAs` entity signals. */
export const SOCIAL_PROFILES = [
  'https://www.facebook.com/people/Radhe-Krishana-Cab-Taxi-Service/61589139216659/',
  'https://www.instagram.com/radhe_krishana_cab_taxi',
]

/** Real office addresses as published in the site footer. */
export const BUSINESS_OFFICES = [
  { city: 'Surat', streetAddress: '137, Muktidham Society, Punagam', postalCode: '395010' },
  { city: 'Ahmedabad', streetAddress: '107, Karunasagar Estate, Bapunagar', postalCode: '382345' },
]

function postalAddress(office: { streetAddress: string; city: string; postalCode: string }) {
  return {
    '@type': 'PostalAddress',
    streetAddress: office.streetAddress,
    addressLocality: office.city,
    postalCode: office.postalCode,
    addressRegion: 'Gujarat',
    addressCountry: 'IN',
  }
}

/** Absolute URL for an internal path (or pass through an external URL). */
export function absoluteUrl(path = '/'): string {
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

/** Serialize JSON-LD safely for inline <script> tags (escape `<`). */
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

/**
 * Build consistent per-page metadata (title, description, canonical, Open Graph
 * and Twitter cards). Keeps every page's social output page-specific, because
 * Next.js replaces — not merges — nested objects like `openGraph`/`twitter`.
 */
export function pageMetadata(opts: {
  title: string
  description: string
  path?: string
  keywords?: string[]
  image?: string | null
  ogType?: 'website' | 'article'
  noindex?: boolean
  absoluteTitle?: boolean
}): Metadata {
  const {
    title,
    description,
    path = '/',
    keywords,
    image,
    ogType = 'website',
    noindex = false,
    absoluteTitle = false,
  } = opts
  const url = absoluteUrl(path)
  const imageUrl = absoluteUrl(image || OG_IMAGE)

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    ...(keywords && keywords.length > 0 ? { keywords } : {}),
    alternates: { canonical: url },
    openGraph: {
      type: ogType,
      siteName: SITE_NAME,
      locale: 'en_IN',
      url,
      title,
      description,
      images: [{ url: imageUrl, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  }
}

/* ───────────────────────── Admin-managed page SEO defaults ───────────────────────── */

export type PageSeoDefaults = {
  title: string
  description: string
  path: string
  keywords: string[]
  absoluteTitle?: boolean
}

/**
 * Canonical SEO defaults for the admin-managed static pages (the `pageKey`s in
 * `SeoSettings`). Used both as the runtime fallback in `buildPageMetadata()` and
 * as the seed values written by the admin SEO screen, so the two never diverge.
 */
export const PAGE_SEO_DEFAULTS: Record<string, PageSeoDefaults> = {
  home: {
    title: 'Radhe Krishna Cab — Taxi Service in India | One Way & Outstation Cabs',
    description:
      'Book reliable one-way and outstation taxi service across India. Fixed fares from Ahmedabad, Surat, Vadodara, Rajkot and all major cities. Airport transfers, round trips and 24/7 support. Call +91 97230 97832.',
    path: '/',
    keywords: [
      'taxi India', 'one way taxi', 'outstation cab', 'Ahmedabad taxi',
      'airport taxi India', 'cab service Gujarat', 'Radhe Krishna Cab',
    ],
    absoluteTitle: true,
  },
  about: {
    title: 'About Us — Trusted Taxi Service in Gujarat',
    description:
      'Radhe Krishna Cab is a trusted taxi & outstation cab service with professional drivers, well-maintained vehicles and transparent pricing across 250+ cities in Gujarat & India.',
    path: '/about',
    keywords: ['about Radhe Krishna Cab', 'trusted taxi service Gujarat', 'outstation cab company'],
  },
  services: {
    title: 'Taxi Services — Airport, Outstation & City Cabs',
    description:
      'Radhe Krishna Cab offers a wide range of taxi services — airport transfers, city rides, outstation trips, corporate travel, family transport and more across Gujarat & India.',
    path: '/services',
    keywords: ['airport taxi service', 'outstation cab service', 'city cab service Gujarat', 'corporate car rental'],
  },
  vehicles: {
    title: 'Our Fleet — Cabs for Every Journey',
    description:
      'Explore our fleet — Swift Dzire, Hyundai Aura, Maruti Suzuki Ertiga, Kia Carens, Toyota Innova Crysta, Tata Winger, Tempo Traveller (14 & 17 Seater) and Urbania Traveller. Vehicles for every group size. Book now.',
    path: '/vehicles',
    keywords: ['taxi fleet', 'Innova Crysta booking', 'Tempo Traveller rental Gujarat', 'SUV cab booking'],
  },
  routes: {
    title: 'All Taxi Routes — One Way & Outstation Cabs',
    description:
      'Browse all intercity taxi routes across Gujarat and India. Select your pickup city to see available one-way cab routes with fixed fares. Radhe Krishna Cab.',
    path: '/routes',
    keywords: ['taxi routes Gujarat', 'one way cab routes', 'intercity taxi routes', 'outstation routes India'],
  },
  faq: {
    title: 'Frequently Asked Questions',
    description:
      'Answers to common questions about Radhe Krishna Cab — booking, pricing, vehicles, payment, airport transfers and more.',
    path: '/faq',
    keywords: ['taxi booking FAQ', 'cab service questions', 'one way taxi FAQ'],
  },
  contact: {
    title: 'Contact Us — Call +91 97230 97832',
    description:
      'Contact Radhe Krishna Cab for taxi booking enquiries. Call or WhatsApp +91 97230 97832. Serving all major cities in Gujarat.',
    path: '/contact',
    keywords: ['contact taxi service', 'cab booking contact', 'taxi number Gujarat'],
  },
}

/* ───────────────────────── Structured data builders ───────────────────────── */

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: 'Radhe Krishna Cab Taxi Service',
    url: SITE_URL,
    logo: absoluteUrl(OG_IMAGE),
    image: absoluteUrl(OG_IMAGE),
    email: CONTACT_EMAIL,
    telephone: BUSINESS_PHONE_E164,
    description: SITE_DESCRIPTION,
    address: postalAddress(BUSINESS_OFFICES[0]),
    sameAs: SOCIAL_PROFILES,
    areaServed: AREA_SERVED,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: BUSINESS_PHONE_E164,
        contactType: 'customer service',
        areaServed: 'IN',
        availableLanguage: ['en', 'hi', 'gu'],
      },
    ],
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: 'en-IN',
    publisher: { '@id': `${SITE_URL}/#organization` },
    // Sitelinks search box — targets the site's real route/city search.
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/routes?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'TaxiService'],
    '@id': `${SITE_URL}/#localbusiness`,
    name: SITE_NAME,
    url: SITE_URL,
    image: absoluteUrl(OG_IMAGE),
    email: CONTACT_EMAIL,
    telephone: BUSINESS_PHONE_E164,
    description: SITE_DESCRIPTION,
    priceRange: '₹₹',
    address: postalAddress(BUSINESS_OFFICES[0]),
    department: BUSINESS_OFFICES.slice(1).map((office) => ({
      '@type': 'LocalBusiness',
      name: `${SITE_NAME} — ${office.city}`,
      telephone: BUSINESS_PHONE_E164,
      address: postalAddress(office),
    })),
    areaServed: AREA_SERVED,
    parentOrganization: { '@id': `${SITE_URL}/#organization` },
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  }
}

export function faqJsonLd(items: Array<{ q: string; a: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }
}

export function serviceJsonLd(input: {
  name: string
  description: string
  url: string
  areaServed?: string[]
  offers?: Array<{ name: string; price?: number | null; currency?: string }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.url),
    serviceType: 'Taxi service',
    provider: { '@id': `${SITE_URL}/#localbusiness` },
    areaServed: input.areaServed ?? AREA_SERVED,
    ...(input.offers && input.offers.length > 0
      ? {
          offers: input.offers.map((o) => ({
            '@type': 'Offer',
            name: o.name,
            ...(o.price != null
              ? { price: o.price, priceCurrency: o.currency ?? 'INR' }
              : {}),
            availability: 'https://schema.org/InStock',
          })),
        }
      : {}),
  }
}

export function touristAttractionJsonLd(input: {
  name: string
  description: string
  url: string
  image?: string | null
  addressLocality?: string | null
  region?: string | null
  latitude?: number | null
  longitude?: number | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.url),
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
    ...(input.latitude != null && input.longitude != null
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: input.latitude,
            longitude: input.longitude,
          },
        }
      : {}),
    ...(input.addressLocality || input.region
      ? {
          address: {
            '@type': 'PostalAddress',
            ...(input.addressLocality ? { addressLocality: input.addressLocality } : {}),
            ...(input.region ? { addressRegion: input.region } : {}),
            addressCountry: 'IN',
          },
        }
      : {}),
  }
}

export function articleJsonLd(input: {
  headline: string
  description: string
  url: string
  image?: string | null
  datePublished?: Date | string | null
  dateModified?: Date | string | null
  authorName?: string | null
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: input.headline,
    description: input.description,
    url: absoluteUrl(input.url),
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(input.url) },
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
    ...(input.datePublished ? { datePublished: new Date(input.datePublished).toISOString() } : {}),
    ...(input.dateModified ? { dateModified: new Date(input.dateModified).toISOString() } : {}),
    ...(input.authorName
      ? { author: { '@type': 'Organization', name: input.authorName } }
      : { author: { '@id': `${SITE_URL}/#organization` } }),
    publisher: { '@id': `${SITE_URL}/#organization` },
  }
}

/* ────────────────────────────── Shared content ────────────────────────────── */

/** Homepage / FAQ page question set — single source of truth for FAQPage SEO. */
export const HOME_FAQS: Array<{ q: string; a: string }> = [
  { q: 'How do I book a cab?', a: `Fill the booking form on our website or WhatsApp us at ${BUSINESS_PHONE_DISPLAY} with your pickup location, destination, and travel date. We'll confirm availability and share fare details.` },
  { q: 'Are your taxi prices fixed or do they change over time?', a: 'We believe in full pricing transparency. Our taxi fares are fixed at the time of booking based on your route and vehicle type. No surge pricing or hidden charges.' },
  { q: 'Is Radhe Krishna Cab available for airport transfer?', a: 'Yes, we provide reliable airport pickup and drop services in Surat, Ahmedabad, Vadodara, and Rajkot with an on-time guarantee.' },
  { q: 'Are your drivers trained and professional?', a: 'All our chauffeurs are experienced, background-verified, and professionally trained to ensure a safe and comfortable journey.' },
  { q: 'Can I book a cab for the whole day?', a: 'Yes, we offer full-day cab services at affordable pricing. Contact us on WhatsApp or call to know custom day package rates.' },
  { q: 'What safety measures do you follow?', a: 'Our vehicles are regularly sanitized, GPS-enabled, and drivers follow all safety protocols for every trip.' },
  { q: 'Do you provide one-way taxi service?', a: 'Yes, we specialise in one-way intercity taxi across India. You only pay for the one-way distance — no return fare charges.' },
  { q: 'How is the fare calculated?', a: 'Fare depends on the vehicle type, distance, and trip type (one-way or round trip). Tolls and parking are transparently detailed upfront.' },
]
