/**
 * whatsapp.ts
 * -----------
 * Central WhatsApp message builder for every inquiry source on the site.
 *
 * Rules:
 *   - Every message starts with the "WEBSITE INQUIRY" header
 *   - No emojis or decorative icons in message text
 *   - Section headings use WhatsApp bold (*asterisks*) with a leading bullet dot
 *   - Plain bullet dots (•) separate individual fields
 *   - Only include fields that have real values — never undefined/null/empty
 *   - The Source line always identifies the exact page the customer came from
 *
 * All builders return the raw message string. Wrap with buildWAUrl() to get a
 * ready-to-open https://wa.me deep link.
 */

export const DEFAULT_WA_NUMBER = '919723097832'
export const SITE_DOMAIN = 'radhekrishanacab.com'

/** Build a wa.me deep link with a correctly URL-encoded message. */
export function buildWAUrl(message: string, number: string = DEFAULT_WA_NUMBER): string {
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
}

/* ── Small formatting helpers ─────────────────────────────────────────────── */

/** ISO date (yyyy-mm-dd) → DD-MM-YYYY */
function fmtDate(iso?: string | null): string | null {
  if (!iso) return null
  const [y, m, d] = iso.split('-')
  if (!d || !m || !y) return iso.trim() || null
  return `${d}-${m}-${y}`
}

/** 24h time (HH:mm) → 12h formatted (e.g. 01:50 AM) */
function fmtTime(t?: string | null): string | null {
  if (!t) return null
  const [h, m] = t.split(':')
  const hour = parseInt(h, 10)
  if (Number.isNaN(hour)) return t.trim() || null
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m ?? '00'} ${ampm}`
}

/** Format an Indian mobile number as "+91 XXXXXXXXXX" when possible. */
function fmtMobile(mobile?: string | null): string | null {
  if (!mobile) return null
  const digits = mobile.replace(/\D/g, '')
  if (!digits) return null
  if (digits.length === 10) return `+91 ${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+91 ${digits.slice(2)}`
  if (digits.length === 11 && digits.startsWith('0')) return `+91 ${digits.slice(1)}`
  return mobile.trim()
}

/** Format a number as an Indian rupee amount (e.g. ₹4,500). */
function fmtRupees(amount?: number | null): string | null {
  if (amount === null || amount === undefined) return null
  const n = Number(amount)
  if (!Number.isFinite(n)) return null
  return `₹${n.toLocaleString('en-IN')}`
}

/** "• Label: value" — returns null when value is missing/blank. */
function bullet(label: string, value?: string | number | null): string | null {
  if (value === null || value === undefined) return null
  const s = String(value).trim()
  if (!s) return null
  return `• ${label}: ${s}`
}

/** Section block: "*• HEADING*" + blank line + bullet lines. Empty block → ''. */
function section(heading: string, items: (string | null | undefined)[]): string {
  const present = items.filter((x): x is string => !!x && x.trim().length > 0)
  if (present.length === 0) return ''
  return `*• ${heading}*\n\n${present.join('\n')}`
}

/** Join non-empty blocks with a blank line between each. */
function join(blocks: (string | null | undefined)[]): string {
  return blocks.filter((b): b is string => !!b && b.trim().length > 0).join('\n\n')
}

const WEBSITE_LINE = `Website: ${SITE_DOMAIN}`

/* ── 1. Homepage / general booking form ──────────────────────────────────── */

export interface HomeBookingData {
  name?: string | null
  mobile?: string | null
  email?: string | null
  pickup?: string | null
  drop?: string | null
  distanceKm?: number | null
  date?: string | null
  time?: string | null
  vehicle?: string | null
  seating?: string | null
  fare?: number | null
  notes?: string | null
  /** Where the form lives, e.g. "Homepage Booking Form". */
  source?: string
}

export function buildHomeBookingMessage(d: HomeBookingData): string {
  return join([
    '*WEBSITE INQUIRY – NEW CAB BOOKING*',
    'Hello! I am interested in booking a taxi from your website.',
    section('CUSTOMER DETAILS', [
      bullet('Name', d.name),
      bullet('Mobile', fmtMobile(d.mobile)),
      bullet('Email', d.email),
    ]),
    section('JOURNEY DETAILS', [
      bullet('Pickup', d.pickup),
      bullet('Drop', d.drop),
      bullet('Distance', d.distanceKm != null ? `${d.distanceKm} KM` : null),
      bullet('Date', fmtDate(d.date)),
      bullet('Pickup Time', d.time ? fmtTime(d.time) : 'Anytime'),
    ]),
    section('VEHICLE DETAILS', [
      bullet('Vehicle', d.vehicle),
      bullet('Seating', d.seating),
      bullet('Fare', fmtRupees(d.fare)),
    ]),
    section('ADDITIONAL NOTES', [bullet('Notes', d.notes)]),
    `Source: ${d.source || 'Website Booking Form'}`,
    WEBSITE_LINE,
  ])
}

/* ── 2. Route booking ────────────────────────────────────────────────────── */

export interface RouteFareItem {
  vehicleName: string
  oneWayFare?: number | null
}

export interface RouteBookingData {
  pickupCity: string
  dropCity: string
  distanceKm?: number | null
  fares?: RouteFareItem[]
  selectedVehicle?: string | null
  selectedFare?: number | null
  source?: string
}

export function buildRouteBookingMessage(d: RouteBookingData): string {
  const allFares = (d.fares ?? []).filter(
    (f) => f.vehicleName && f.oneWayFare != null,
  )
  const hasSelection = !!d.selectedVehicle?.trim()

  // When a vehicle is selected, never mix prices — show only its fare row.
  const applicableFares = hasSelection
    ? allFares.filter((f) => f.vehicleName === d.selectedVehicle)
    : allFares

  const fareLines = applicableFares.map((f) =>
    bullet(f.vehicleName, fmtRupees(f.oneWayFare)),
  )

  return join([
    '*WEBSITE INQUIRY – ROUTE BOOKING*',
    'Hello! I want to book a taxi for this route.',
    section('ROUTE DETAILS', [
      bullet('Pickup City', d.pickupCity),
      bullet('Drop City', d.dropCity),
      bullet('Total Distance', d.distanceKm != null ? `${d.distanceKm} KM` : null),
    ]),
    fareLines.length > 0 ? `*• AVAILABLE FARES*\n\n${fareLines.join('\n')}` : '',
    section('SELECTED VEHICLE', [
      bullet('Vehicle', d.selectedVehicle || 'Not Selected'),
      bullet('Selected Fare', hasSelection ? fmtRupees(d.selectedFare) ?? 'Not Selected' : 'Not Selected'),
    ]),
    'Please confirm availability and booking details.',
    `Source: ${d.source || 'Routes Page'}`,
    WEBSITE_LINE,
  ])
}

/* ── 3. Vehicle card booking ─────────────────────────────────────────────── */

export interface VehicleBookingData {
  vehicleName: string
  seating?: string | null
  category?: string | null
  price?: number | null
  source?: string
}

export function buildVehicleBookingMessage(d: VehicleBookingData): string {
  return join([
    '*WEBSITE INQUIRY – VEHICLE BOOKING*',
    'Hello! I am interested in booking a vehicle.',
    section('VEHICLE DETAILS', [
      bullet('Vehicle', d.vehicleName),
      bullet('Seating Capacity', d.seating),
      bullet('Category', d.category),
      bullet('Price', fmtRupees(d.price)),
      bullet('Source', d.source || 'Our Cars Page'),
    ]),
    'Please share availability, pricing and booking details.',
    WEBSITE_LINE,
  ])
}

/* ── 4. Tourist place inquiry ────────────────────────────────────────────── */

export interface TouristPlaceData {
  placeName: string
  attraction?: string | null
  state?: string | null
  district?: string | null
  source?: string
}

export function buildTouristPlaceMessage(d: TouristPlaceData): string {
  return join([
    '*WEBSITE INQUIRY – TOURIST PLACE*',
    'Hello! I am interested in visiting this destination.',
    section('DESTINATION DETAILS', [
      bullet('Place Name', d.placeName),
      bullet('Attraction', d.attraction),
      bullet('State', d.state),
      bullet('District', d.district),
      bullet('Source', d.source || 'Tourist Places Page'),
    ]),
    section('TRAVEL REQUEST', [
      'Please share taxi availability, travel charges and booking details.',
    ]),
    WEBSITE_LINE,
  ])
}

/* ── 5. Blog post inquiry ────────────────────────────────────────────────── */

export interface BlogInquiryData {
  title: string
  category?: string | null
  source?: string
}

export function buildBlogInquiryMessage(d: BlogInquiryData): string {
  return join([
    '*WEBSITE INQUIRY – BLOG POST*',
    section('BLOG DETAILS', [
      bullet('Blog Title', d.title),
      bullet('Category', d.category),
      bullet('Source', d.source || 'Blog Page'),
    ]),
    section('CUSTOMER REQUEST', [
      'I read your blog and would like to know about taxi services related to this destination.',
      'Please share details and pricing.',
    ]),
    WEBSITE_LINE,
  ])
}

/* ── 6. Contact Us page ──────────────────────────────────────────────────── */

export interface ContactInquiryData {
  name?: string | null
  mobile?: string | null
  email?: string | null
  message?: string | null
  source?: string
}

export function buildContactInquiryMessage(d: ContactInquiryData): string {
  return join([
    '*WEBSITE INQUIRY – CONTACT US*',
    section('CUSTOMER DETAILS', [
      bullet('Name', d.name),
      bullet('Mobile', fmtMobile(d.mobile)),
      bullet('Email', d.email),
    ]),
    section('MESSAGE DETAILS', [
      bullet('Inquiry', d.message),
      bullet('Source', d.source || 'Contact Us Page'),
    ]),
    'Please contact me regarding my inquiry.',
    WEBSITE_LINE,
  ])
}

/* ── 7. Floating / general enquiry ───────────────────────────────────────── */

export interface GeneralEnquiryData {
  sourcePage?: string | null
  pageUrl?: string | null
}

export function buildGeneralEnquiryMessage(d: GeneralEnquiryData = {}): string {
  return join([
    '*WEBSITE INQUIRY – GENERAL ENQUIRY*',
    'Hello! I visited your website and I am interested in your taxi services.',
    section('INQUIRY DETAILS', [
      bullet('Source Page', d.sourcePage),
      bullet('Page URL', d.pageUrl),
    ]),
    'Please share your available vehicles, routes and pricing details.',
    WEBSITE_LINE,
  ])
}
