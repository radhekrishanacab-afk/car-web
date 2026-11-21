/**
 * whatsapp.ts
 * -----------
 * Central WhatsApp message builder for every inquiry source on the site.
 *
 * Rules:
 *   - Every message starts with "WEBSITE INQUIRY" header
 *   - No emojis or decorative icons in message text
 *   - Clean, professional format
 *   - Only include fields that have actual values — never undefined/null/empty
 *   - Source line always identifies the exact page the customer came from
 */

export const DEFAULT_WA_NUMBER = '919723097832'

export function buildWAUrl(message: string, number = DEFAULT_WA_NUMBER): string {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
}

function fmtDate(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  if (!d || !m || !y) return iso
  return `${d}-${m}-${y}`
}

function fmtTime(t?: string): string {
  if (!t) return 'Anytime'
  const [h, m] = t.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}

function lines(...parts: (string | null | undefined)[]): string {
  return parts.filter(Boolean).join('\n')
}

const HEADER = 'WEBSITE INQUIRY\nRadhe Krishna Cab & Taxi Service'
const FOOTER = '\nSent from radhekrishanacab.com'

// ─────────────────────────────────────────────────────────────
// 1. Homepage Booking Form
// ─────────────────────────────────────────────────────────────
export interface HomepageBookingData {
  name: string
  phone: string
  pickup: string
  drop: string
  date: string
  time?: string
  vehicle: string
}

export function buildHomepageBookingMsg(data: HomepageBookingData): string {
  return lines(
    HEADER,
    'Source: Homepage Booking Form',
    '',
    `Customer Name: ${data.name}`,
    `Customer Phone: +91 ${data.phone}`,
    `Pickup Location: ${data.pickup}`,
    `Drop Location: ${data.drop}`,
    `Travel Date: ${fmtDate(data.date)}`,
    `Pickup Time: ${fmtTime(data.time)}`,
    `Selected Vehicle: ${data.vehicle}`,
    FOOTER
  )
}

// ─────────────────────────────────────────────────────────────
// 2. Homepage Quick CTA (WhatsApp button in hero, not the form)
// ─────────────────────────────────────────────────────────────
export function buildHomepageCtaMsg(): string {
  return lines(
    HEADER,
    'Source: Homepage - Quick WhatsApp Button',
    '',
    'I would like to enquire about taxi booking.',
    'Please share available vehicle options and fares.',
    FOOTER
  )
}

// ─────────────────────────────────────────────────────────────
// 3. Vehicle Cards (Our Cars page + Homepage slider)
// ─────────────────────────────────────────────────────────────
export interface VehicleInquiryData {
  name: string
  seats: string
  type?: string
  source: 'Our Cars Page' | 'Homepage Vehicle Slider'
}

export function buildVehicleInquiryMsg(data: VehicleInquiryData): string {
  return lines(
    HEADER,
    `Source: ${data.source}`,
    '',
    `Vehicle: ${data.name}`,
    `Seating: ${data.seats}`,
    data.type ? `Category: ${data.type}` : null,
    '',
    'I would like to book this vehicle. Please share fare and availability.',
    FOOTER
  )
}

export function buildVehicleCtaMsg(): string {
  return lines(
    HEADER,
    'Source: Our Cars Page - Help CTA',
    '',
    'I need help choosing the right vehicle for my trip.',
    'Please recommend the best option based on my route and group size.',
    FOOTER
  )
}

// ─────────────────────────────────────────────────────────────
// 4. Routes — Homepage fare table row
// ─────────────────────────────────────────────────────────────
export interface HomepageRouteData {
  pickup: string
  drop: string
  distanceKm?: number | null
  vehicleName?: string
  fare?: number | null
}

export function buildHomepageRouteMsg(data: HomepageRouteData): string {
  return lines(
    HEADER,
    'Source: Homepage Routes & Fare Table',
    '',
    `Pickup: ${data.pickup}`,
    `Drop: ${data.drop}`,
    data.distanceKm ? `Distance: ${data.distanceKm} km` : null,
    data.vehicleName ? `Vehicle: ${data.vehicleName}` : null,
    data.fare != null ? `Quoted Fare: Rs. ${data.fare.toLocaleString('en-IN')}` : null,
    '',
    'Please confirm availability and final fare.',
    FOOTER
  )
}

// ─────────────────────────────────────────────────────────────
// 5. Route Detail Page — hero CTA & per-vehicle row
// ─────────────────────────────────────────────────────────────
export interface RouteDetailData {
  pickup: string
  drop: string
  distanceKm?: number | null
  estimatedHours?: number | null
  vehicleName?: string
  fare?: number | null
}

export function buildRouteDetailMsg(data: RouteDetailData): string {
  return lines(
    HEADER,
    'Source: Route Booking Page',
    '',
    `Pickup: ${data.pickup}`,
    `Drop: ${data.drop}`,
    data.distanceKm ? `Distance: ${data.distanceKm} km` : null,
    data.estimatedHours ? `Estimated Duration: ${data.estimatedHours} hrs` : null,
    data.vehicleName ? `Vehicle: ${data.vehicleName}` : null,
    data.fare != null ? `Quoted Fare: Rs. ${data.fare.toLocaleString('en-IN')}` : null,
    '',
    'Please confirm availability and final fare.',
    FOOTER
  )
}

// ─────────────────────────────────────────────────────────────
// 6. City Routes Page
// ─────────────────────────────────────────────────────────────
export function buildCityRouteMsg(cityName: string): string {
  return lines(
    HEADER,
    'Source: City Routes Page',
    '',
    `Pickup City: ${cityName}`,
    '',
    'I would like to book a taxi from this city. Please share available routes and fares.',
    FOOTER
  )
}

// ─────────────────────────────────────────────────────────────
// 7. Tourist Place / Explore India
// ─────────────────────────────────────────────────────────────
export interface TouristPlaceData {
  name: string
  cityName?: string | null
  districtName?: string | null
  stateName: string
  source?: 'Tourist Place Page' | 'Explore India Section'
}

export function buildTouristPlaceMsg(data: TouristPlaceData): string {
  const src = data.source ?? 'Tourist Place Page'
  return lines(
    HEADER,
    `Source: ${src}`,
    '',
    `Place Name: ${data.name}`,
    data.cityName ? `City: ${data.cityName}` : null,
    data.districtName ? `District: ${data.districtName}` : null,
    `State: ${data.stateName}`,
    '',
    'I would like to book a taxi to visit this destination. Please share available options and fares.',
    FOOTER
  )
}

export function buildExploreIndiaCtaMsg(): string {
  return lines(
    HEADER,
    'Source: Homepage Explore India Section',
    '',
    'I would like to plan a tourist trip across India.',
    'Please share taxi options and fares for my destination.',
    FOOTER
  )
}

// ─────────────────────────────────────────────────────────────
// 8. Blog Post
// ─────────────────────────────────────────────────────────────
export interface BlogInquiryData {
  title: string
  location?: string | null
  source: 'Blog Post Page' | 'Homepage Blog Section'
}

export function buildBlogInquiryMsg(data: BlogInquiryData): string {
  return lines(
    HEADER,
    `Source: ${data.source}`,
    '',
    `Blog Post: ${data.title}`,
    data.location ? `Location: ${data.location}` : null,
    '',
    'I read this article on your website and would like to book a cab for this trip.',
    'Please share availability and fare details.',
    FOOTER
  )
}

// ─────────────────────────────────────────────────────────────
// 9. Contact Us Page
// ─────────────────────────────────────────────────────────────
export function buildContactPageMsg(): string {
  return lines(
    HEADER,
    'Source: Contact Us Page',
    '',
    'I would like to enquire about taxi booking.',
    'Please share available options and fares.',
    FOOTER
  )
}

// ─────────────────────────────────────────────────────────────
// 10. Floating WhatsApp Button (present on every page)
// ─────────────────────────────────────────────────────────────
export function buildFloatingButtonMsg(): string {
  return lines(
    HEADER,
    'Source: Floating WhatsApp Button',
    '',
    'I would like to enquire about taxi services.',
    'Please share available vehicle options and fares.',
    FOOTER
  )
}

// ─────────────────────────────────────────────────────────────
// 11. Full Enquiry Form (Contact page / EnquiryForm component)
// ─────────────────────────────────────────────────────────────
export interface EnquiryFormData {
  name: string
  mobile: string
  pickup: string
  destination: string
  date: string
  time: string
  vehicle: string
  message?: string
}

export function buildEnquiryFormMsg(data: EnquiryFormData): string {
  return lines(
    HEADER,
    'Source: Contact Us - Booking Enquiry Form',
    '',
    `Customer Name: ${data.name}`,
    `Customer Phone: +91 ${data.mobile}`,
    `Pickup Location: ${data.pickup}`,
    `Drop Location: ${data.destination}`,
    `Travel Date: ${fmtDate(data.date)}`,
    `Pickup Time: ${fmtTime(data.time)}`,
    `Selected Vehicle: ${data.vehicle}`,
    data.message?.trim() ? `Additional Notes: ${data.message.trim()}` : null,
    FOOTER
  )
}
