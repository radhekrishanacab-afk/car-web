/**
 * Deterministic, original content generator for Radhe Krishna Cab.
 * Every route gets unique wording — no copied content from any reference site.
 * Prices, distances and city names are never invented — only passed-in values are used.
 */

export interface RouteContentInput {
  originCity: string
  destinationCity: string
  distanceKm: number | null
  vehicles: Array<{ name: string; oneWayFare: number | null }>
  slug: string
}

export interface GeneratedContent {
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  routeDescription: string
  travelGuide: string
  whyChooseUs: Array<{ title: string; desc: string }>
  faqItems: Array<{ q: string; a: string }>
  highlights: string[]
}

function hashStr(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 33) ^ s.charCodeAt(i)) | 0
  return Math.abs(h)
}
function pick<T>(arr: T[], n: number): T { return arr[n % arr.length] }

export function generateRouteContent(input: RouteContentInput): GeneratedContent {
  const { originCity: o, destinationCity: d, distanceKm, vehicles } = input
  const seed = hashStr(`${o}::${d}`)

  const cheapest = vehicles
    .map(v => v.oneWayFare).filter((f): f is number => f !== null)
    .sort((a, b) => a - b)[0] ?? null

  const vehicleNames = vehicles.length > 0 ? vehicles.map(v => v.name) : ['Sedan', 'SUV']
  const vList = vehicleNames.join(', ')
  const km = distanceKm ? `${distanceKm} km` : 'the route'
  const fareFrom = cheapest ? `₹${cheapest.toLocaleString('en-IN')}` : 'competitive rates'
  const ph = '+91 97230 97832'

  // ── SEO Title — 6 variants, each route gets one deterministically ─────────
  const seoTitle = pick([
    `${o} to ${d} Taxi Fare & Cab Booking | Radhe Krishna Cab`,
    `Book One Way Taxi ${o} to ${d} — Fixed Fare | Radhe Krishna Cab`,
    `${o} to ${d} Cab Service — ${km} | Radhe Krishna Cab`,
    `Affordable ${o} to ${d} Taxi | Verified Drivers | Radhe Krishna Cab`,
    `${o} to ${d} One Way Cab — Starting ${fareFrom} | Radhe Krishna Cab`,
    `${d} Taxi from ${o} — Best Price Guaranteed | Radhe Krishna Cab`,
  ], seed)

  // ── SEO Description — 6 variants ─────────────────────────────────────────
  const seoDescription = pick([
    `Book a safe, comfortable one-way taxi from ${o} to ${d}. Approx. ${km}. Starting ${fareFrom}. Choose from ${vList}. No hidden charges, 24/7 support. Radhe Krishna Cab.`,
    `Travelling from ${o} to ${d}? Get a fixed-fare cab starting ${fareFrom} for ${km}. AC vehicles: ${vList}. Instant booking. Call ${ph}.`,
    `${o} to ${d} outstation cab — ${km}, starting ${fareFrom}. Sedan, SUV & Premium options. Transparent pricing, verified drivers. Book now with Radhe Krishna Cab.`,
    `Need a cab from ${o} to ${d}? Distance: ${km}. Fares from ${fareFrom}. Vehicles: ${vList}. One-way fare only — no return charges. Radhe Krishna Cab Gujarat.`,
    `Radhe Krishna Cab offers reliable ${o} to ${d} taxi at fixed fares starting ${fareFrom}. ${km} covered in comfort. Vehicles: ${vList}. Book online or call ${ph}.`,
    `Cheap ${o} to ${d} taxi starting ${fareFrom} for ${km}. Choose ${vList}. No surge pricing. Professional drivers. 24/7 bookings — Radhe Krishna Cab.`,
  ], seed + 1)

  // ── SEO Keywords ──────────────────────────────────────────────────────────
  const seoKeywords = [
    `${o} to ${d} taxi`,
    `${o} to ${d} cab`,
    `${d} to ${o} taxi`,
    `${d} to ${o} cab`,
    `one way taxi ${o} to ${d}`,
    `outstation cab ${o}`,
    `${o} ${d} cab fare`,
    `book cab ${o} to ${d}`,
    `${o} to ${d} taxi price`,
    `${o} to ${d} car rental`,
    `Radhe Krishna Cab ${o}`,
    `taxi service ${o} Gujarat`,
  ].join(', ')

  // ── Route Description — 8 fully original variants ─────────────────────────
  const intros = [
    `Looking for a stress-free way to travel from ${o} to ${d}?`,
    `Planning your journey from ${o} to ${d}?`,
    `The road between ${o} and ${d} is one of the most travelled intercity corridors in the region.`,
    `${o} and ${d} are connected by well-maintained highways, making the drive comfortable.`,
    `Whether you're travelling for business, a family visit, or a leisure trip, the ${o} to ${d} route is a practical and popular choice.`,
    `Getting from ${o} to ${d} by road is a convenient and reliable option for travellers across Gujarat.`,
    `The ${o} to ${d} cab journey covers ${km} and passes through some of Gujarat's finest highway stretches.`,
    `Intercity travel from ${o} to ${d} is made simple and affordable with Radhe Krishna Cab.`,
  ]
  const bodies = [
    `Radhe Krishna Cab makes it simple. We offer a dedicated one-way taxi service covering approximately ${km}, with AC vehicles, professional drivers, and fixed pricing — so there are no surprises at the end of your trip.`,
    `With Radhe Krishna Cab, you get a confirmed vehicle, a verified driver, and a fixed one-way fare. You pay only for the distance from ${o} to ${d} — no return leg, no hidden costs.`,
    `Our one-way cab service on this route ensures you travel in comfort with an AC vehicle of your choice. Fixed fares start at ${fareFrom}, and all pricing is disclosed upfront before you book.`,
    `Radhe Krishna Cab connects both cities with reliable, on-time service. Choose from ${vList}, confirm your fare upfront, and travel without worrying about meter-based billing or surge pricing.`,
    `We cover this route daily, with vehicles cleaned and serviced before each trip. Your driver is familiar with the roads and will ensure you reach ${d} safely and on schedule.`,
    `Our fleet for the ${o}–${d} route includes ${vList}. Every journey comes with a fixed price, an experienced driver, and 24/7 phone support — so you're always in safe hands.`,
    `From the moment you book to the moment you arrive in ${d}, our team ensures a smooth experience. Fixed fares, tracked vehicles, and courteous drivers set us apart on this route.`,
    `Radhe Krishna Cab has been serving travellers on the ${o}–${d} corridor with consistent quality. Our pricing is transparent, our drivers are trained, and our vehicles are well-maintained for your comfort.`,
  ]
  const routeDescription = `${pick(intros, seed + 2)} ${pick(bodies, seed + 3)}`

  // ── Travel Guide — 6 variants ─────────────────────────────────────────────
  const travelGuide = pick([
    `For a smooth ${o} to ${d} journey, book your cab at least a few hours in advance. Early booking guarantees vehicle availability and locks in the displayed fare. Keep a copy of your booking reference handy, and save our number ${ph} for any queries on the road.`,
    `When travelling from ${o} to ${d}, confirm your pickup point clearly when booking. Our driver will arrive 10–15 minutes before your scheduled time. All vehicles carry valid insurance and our drivers hold professional licences for your safety.`,
    `The ${o} to ${d} route is best travelled during daytime hours for maximum comfort. Our AC vehicles are equipped to handle the journey in any season. Advance booking also lets you choose your preferred vehicle type — Sedan, SUV, or Premium.`,
    `Heading from ${o} to ${d}? Pack light for ease, and note that our fares include driver charges. There are no additional costs for standard stops along the way. Call ${ph} if you need any help planning your trip.`,
    `For the ${o}–${d} trip, pre-booking your cab is the most reliable way to travel. You receive a confirmed driver's name and contact before your trip begins. Our 24/7 support team is available for rescheduling or last-minute changes.`,
    `Travelling from ${o} to ${d} is convenient with proper planning. Book your cab a day ahead when possible, especially for early morning or late-night departures. Our drivers are experienced and will reach you on time.`,
  ], seed + 4)

  // ── Why Choose Us — 5 items, title + desc ────────────────────────────────
  const whyItems = [
    { title: 'Fixed, Transparent Fares', desc: `The price you see is the price you pay. No meter, no surge, no hidden charges on the ${o} to ${d} route.` },
    { title: 'One-Way Pricing', desc: `You pay only for the trip from ${o} to ${d}. There is no return-leg charge on one-way bookings.` },
    { title: 'Clean, AC Vehicles', desc: `Every vehicle in our fleet is air-conditioned, regularly serviced, and sanitised before each journey.` },
    { title: 'Verified, Professional Drivers', desc: `All Radhe Krishna Cab drivers hold valid licences and undergo background checks for your safety and peace of mind.` },
    { title: `${vList} Available`, desc: `From compact Sedans for solo travellers to spacious Premium SUVs for groups — we have the right vehicle for you.` },
    { title: '24 / 7 Booking Support', desc: `Our team is available round the clock for bookings, rescheduling, and travel queries. Call ${ph} any time.` },
  ]
  // Rotate starting index so each route shows a slightly different order
  const rotated = [...whyItems.slice(seed % 2), ...whyItems.slice(0, seed % 2)]
  const whyChooseUs = rotated.slice(0, 5)

  // ── FAQ — 6 unique, useful questions ─────────────────────────────────────
  const faqItems = [
    {
      q: `What is the one-way taxi fare from ${o} to ${d}?`,
      a: cheapest
        ? `The starting one-way fare is ${fareFrom} for a ${vehicleNames[0]}. Larger vehicles like ${vehicleNames.slice(1).join(', ')} have higher fares. All fares are fixed — no surge pricing on this route.`
        : `Please call ${ph} or send a WhatsApp message for the current fare from ${o} to ${d}.`,
    },
    {
      q: `How many kilometres is the ${o} to ${d} road trip?`,
      a: distanceKm
        ? `The road distance from ${o} to ${d} is approximately ${distanceKm} km by the main highway. The exact distance may vary slightly depending on the route taken.`
        : `Contact us at ${ph} for the current road distance between ${o} and ${d}.`,
    },
    {
      q: `Which vehicles can I choose for the ${o} to ${d} cab?`,
      a: `We offer ${vList} for the ${o} to ${d} route. The Sedan suits individuals or couples, while the SUV and Premium SUV are ideal for families or groups with luggage.`,
    },
    {
      q: `Do I have to pay for the return trip if I book a one-way cab from ${o} to ${d}?`,
      a: `No. Our one-way taxi service means you pay only for the ${o} to ${d} journey. There is no charge for the vehicle's return trip.`,
    },
    {
      q: `How do I book a cab from ${o} to ${d} with Radhe Krishna Cab?`,
      a: `You can book by calling ${ph}, sending a WhatsApp message, or filling in the enquiry form on our website. Advance booking is recommended, especially for early morning or peak hours.`,
    },
    {
      q: `Is the cab fare from ${o} to ${d} inclusive of driver charges?`,
      a: `Yes. The quoted fare includes the driver's charges. There are no separate fees for the driver on this route.`,
    },
  ]

  // ── Highlights — short bullet points for schema / UI ──────────────────────
  const highlights = [
    `${km} one-way taxi`,
    `Starting at ${fareFrom}`,
    `${vehicleNames.length} vehicle option${vehicleNames.length > 1 ? 's' : ''}`,
    'Fixed price — no surge',
    '24/7 booking support',
    'No return-leg charge',
  ]

  return { seoTitle, seoDescription, seoKeywords, routeDescription, travelGuide, whyChooseUs, faqItems, highlights }
}

export function generateRouteSeo(
  originCity: string,
  destinationCity: string,
  distanceKm: number | null,
  slug: string
): { seoTitle: string; seoDescription: string; seoKeywords: string } {
  const r = generateRouteContent({ originCity, destinationCity, distanceKm, vehicles: [], slug })
  return { seoTitle: r.seoTitle, seoDescription: r.seoDescription, seoKeywords: r.seoKeywords }
}
