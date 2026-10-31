/**
 * Seed script for Explore India feature.
 * Run: node scripts/seed-explore-india.mjs
 * Safe to re-run — uses upsert throughout.
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// ── Categories ──────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: 'Temples & Religious Places', slug: 'temples', icon: '🛕', displayOrder: 1 },
  { name: 'Beaches',                    slug: 'beaches', icon: '🏖️', displayOrder: 2 },
  { name: 'Hill Stations',              slug: 'hill-stations', icon: '⛰️', displayOrder: 3 },
  { name: 'Historical Places',          slug: 'historical', icon: '🏛️', displayOrder: 4 },
  { name: 'Forts & Palaces',            slug: 'forts-palaces', icon: '🏯', displayOrder: 5 },
  { name: 'Wildlife & National Parks',  slug: 'wildlife', icon: '🐘', displayOrder: 6 },
  { name: 'Waterfalls',                 slug: 'waterfalls', icon: '💧', displayOrder: 7 },
  { name: 'Lakes',                      slug: 'lakes', icon: '🏞️', displayOrder: 8 },
  { name: 'Adventure',                  slug: 'adventure', icon: '🧗', displayOrder: 9 },
  { name: 'Museums',                    slug: 'museums', icon: '🏛️', displayOrder: 10 },
  { name: 'Gardens & Parks',            slug: 'gardens-parks', icon: '🌿', displayOrder: 11 },
  { name: 'Family Attractions',         slug: 'family', icon: '👨‍👩‍👧‍👦', displayOrder: 12 },
  { name: 'Cultural & Heritage Sites',  slug: 'cultural-heritage', icon: '🎭', displayOrder: 13 },
]

// ── Indian States & UTs ─────────────────────────────────────────────────────
const STATES = [
  { name: 'Andhra Pradesh',          slug: 'andhra-pradesh',        code: 'AP', region: 'South',     capital: 'Amaravati',    latitude: 15.9129, longitude: 79.7400 },
  { name: 'Arunachal Pradesh',       slug: 'arunachal-pradesh',     code: 'AR', region: 'Northeast', capital: 'Itanagar',     latitude: 28.2180, longitude: 94.7278 },
  { name: 'Assam',                   slug: 'assam',                 code: 'AS', region: 'Northeast', capital: 'Dispur',       latitude: 26.2006, longitude: 92.9376 },
  { name: 'Bihar',                   slug: 'bihar',                 code: 'BR', region: 'East',      capital: 'Patna',        latitude: 25.0961, longitude: 85.3131 },
  { name: 'Chhattisgarh',            slug: 'chhattisgarh',          code: 'CG', region: 'Central',   capital: 'Raipur',       latitude: 21.2787, longitude: 81.8661 },
  { name: 'Goa',                     slug: 'goa',                   code: 'GA', region: 'West',      capital: 'Panaji',       latitude: 15.2993, longitude: 74.1240 },
  { name: 'Gujarat',                 slug: 'gujarat',               code: 'GJ', region: 'West',      capital: 'Gandhinagar',  latitude: 22.2587, longitude: 71.1924 },
  { name: 'Haryana',                 slug: 'haryana',               code: 'HR', region: 'North',     capital: 'Chandigarh',   latitude: 29.0588, longitude: 76.0856 },
  { name: 'Himachal Pradesh',        slug: 'himachal-pradesh',      code: 'HP', region: 'North',     capital: 'Shimla',       latitude: 31.1048, longitude: 77.1734 },
  { name: 'Jharkhand',               slug: 'jharkhand',             code: 'JH', region: 'East',      capital: 'Ranchi',       latitude: 23.6102, longitude: 85.2799 },
  { name: 'Karnataka',               slug: 'karnataka',             code: 'KA', region: 'South',     capital: 'Bengaluru',    latitude: 15.3173, longitude: 75.7139 },
  { name: 'Kerala',                  slug: 'kerala',                code: 'KL', region: 'South',     capital: 'Thiruvananthapuram', latitude: 10.8505, longitude: 76.2711 },
  { name: 'Madhya Pradesh',          slug: 'madhya-pradesh',        code: 'MP', region: 'Central',   capital: 'Bhopal',       latitude: 22.9734, longitude: 78.6569 },
  { name: 'Maharashtra',             slug: 'maharashtra',           code: 'MH', region: 'West',      capital: 'Mumbai',       latitude: 19.7515, longitude: 75.7139 },
  { name: 'Manipur',                 slug: 'manipur',               code: 'MN', region: 'Northeast', capital: 'Imphal',       latitude: 24.6637, longitude: 93.9063 },
  { name: 'Meghalaya',               slug: 'meghalaya',             code: 'ML', region: 'Northeast', capital: 'Shillong',     latitude: 25.4670, longitude: 91.3662 },
  { name: 'Mizoram',                 slug: 'mizoram',               code: 'MZ', region: 'Northeast', capital: 'Aizawl',       latitude: 23.1645, longitude: 92.9376 },
  { name: 'Nagaland',                slug: 'nagaland',              code: 'NL', region: 'Northeast', capital: 'Kohima',       latitude: 26.1584, longitude: 94.5624 },
  { name: 'Odisha',                  slug: 'odisha',                code: 'OD', region: 'East',      capital: 'Bhubaneswar',  latitude: 20.9517, longitude: 85.0985 },
  { name: 'Punjab',                  slug: 'punjab',                code: 'PB', region: 'North',     capital: 'Chandigarh',   latitude: 31.1471, longitude: 75.3412 },
  { name: 'Rajasthan',               slug: 'rajasthan',             code: 'RJ', region: 'North',     capital: 'Jaipur',       latitude: 27.0238, longitude: 74.2179 },
  { name: 'Sikkim',                  slug: 'sikkim',                code: 'SK', region: 'Northeast', capital: 'Gangtok',      latitude: 27.5330, longitude: 88.5122 },
  { name: 'Tamil Nadu',              slug: 'tamil-nadu',            code: 'TN', region: 'South',     capital: 'Chennai',      latitude: 11.1271, longitude: 78.6569 },
  { name: 'Telangana',               slug: 'telangana',             code: 'TS', region: 'South',     capital: 'Hyderabad',    latitude: 18.1124, longitude: 79.0193 },
  { name: 'Tripura',                 slug: 'tripura',               code: 'TR', region: 'Northeast', capital: 'Agartala',     latitude: 23.9408, longitude: 91.9882 },
  { name: 'Uttar Pradesh',           slug: 'uttar-pradesh',         code: 'UP', region: 'North',     capital: 'Lucknow',      latitude: 26.8467, longitude: 80.9462 },
  { name: 'Uttarakhand',             slug: 'uttarakhand',           code: 'UK', region: 'North',     capital: 'Dehradun',     latitude: 30.0668, longitude: 79.0193 },
  { name: 'West Bengal',             slug: 'west-bengal',           code: 'WB', region: 'East',      capital: 'Kolkata',      latitude: 22.9868, longitude: 87.8550 },
  // Union Territories
  { name: 'Andaman & Nicobar Islands', slug: 'andaman-nicobar',    code: 'AN', region: 'Islands',   capital: 'Port Blair',   latitude: 11.7401, longitude: 92.6586 },
  { name: 'Chandigarh',              slug: 'chandigarh',            code: 'CH', region: 'North',     capital: 'Chandigarh',   latitude: 30.7333, longitude: 76.7794 },
  { name: 'Dadra & Nagar Haveli',    slug: 'dadra-nagar-haveli',   code: 'DN', region: 'West',      capital: 'Silvassa',     latitude: 20.1809, longitude: 73.0169 },
  { name: 'Delhi',                   slug: 'delhi',                 code: 'DL', region: 'North',     capital: 'New Delhi',    latitude: 28.7041, longitude: 77.1025 },
  { name: 'Jammu & Kashmir',         slug: 'jammu-kashmir',         code: 'JK', region: 'North',     capital: 'Srinagar',     latitude: 33.7782, longitude: 76.5762 },
  { name: 'Ladakh',                  slug: 'ladakh',                code: 'LA', region: 'North',     capital: 'Leh',          latitude: 34.1526, longitude: 77.5771 },
  { name: 'Lakshadweep',             slug: 'lakshadweep',           code: 'LD', region: 'Islands',   capital: 'Kavaratti',    latitude: 10.5593, longitude: 72.6358 },
  { name: 'Puducherry',              slug: 'puducherry',            code: 'PY', region: 'South',     capital: 'Puducherry',   latitude: 11.9416, longitude: 79.8083 },
]

// ── Sample districts for Gujarat ───────────────────────────────────────────
const GUJARAT_DISTRICTS = [
  { name: 'Ahmedabad',     slug: 'ahmedabad',     latitude: 23.0225, longitude: 72.5714 },
  { name: 'Narmada',       slug: 'narmada',       latitude: 21.8719, longitude: 73.4757 },
  { name: 'Kutch',         slug: 'kutch',         latitude: 23.7337, longitude: 69.8597 },
  { name: 'Amreli',        slug: 'amreli',        latitude: 21.5969, longitude: 71.2171 },
  { name: 'Gir Somnath',   slug: 'gir-somnath',   latitude: 20.9110, longitude: 70.3677 },
  { name: 'Gandhinagar',   slug: 'gandhinagar',   latitude: 23.2156, longitude: 72.6369 },
  { name: 'Dwarka',        slug: 'dwarka',        latitude: 22.2394, longitude: 68.9678 },
]

// ── Sample destinations ─────────────────────────────────────────────────────
// These are clearly labelled development samples.
// Real data should be added through the admin panel.
const SAMPLE_PLACES = [
  {
    name: 'Statue of Unity',
    slug: 'statue-of-unity',
    shortDescription: 'The world\'s tallest statue, dedicated to Sardar Vallabhbhai Patel, stands at 182 metres in the Narmada district of Gujarat.',
    description: 'The Statue of Unity is the world\'s tallest statue, standing at a height of 182 metres (597 ft). It is a tribute to Sardar Vallabhbhai Patel, the first Deputy Prime Minister of India. Located near Kevadiya Colony in the Narmada district of Gujarat, it faces the Sardar Sarovar Dam. The statue was inaugurated on 31 October 2018, coinciding with the 143rd birth anniversary of Sardar Patel.',
    address: 'Kevadiya, Narmada District, Gujarat 393155',
    latitude: 21.8381,
    longitude: 73.7196,
    stateSlug: 'gujarat',
    districtSlug: 'narmada',
    cityName: 'Kevadiya',
    categorySlug: 'historical',
    tags: 'statue, landmark, world tallest, Sardar Patel, Gujarat tourism',
    visitingHours: '8:00 AM – 6:00 PM (Closed on Mondays)',
    entryFee: '₹120 per adult (Indian), ₹380 per adult (Foreign)',
    bestTimeToVisit: 'October to March',
    visitDuration: '3–4 hours',
    isFeatured: true,
    seoTitle: 'Statue of Unity — World\'s Tallest Statue | Gujarat Tourism',
    seoDescription: 'Visit the Statue of Unity in Narmada, Gujarat — the world\'s tallest statue at 182 metres. Book your taxi from any city with Radhe Krishna Cab.',
    featuredImage: '/images/destinations/statue-of-unity.jpg',
  },
  {
    name: 'Dwarka',
    slug: 'dwarka',
    shortDescription: 'One of the four sacred Hindu dhams, Dwarka is an ancient city on the western coast of Gujarat with the Dwarkadhish Temple at its heart.',
    description: 'Dwarka, located on the western coast of Gujarat at the tip of the Kathiawar peninsula, is one of the Char Dhams — the four sacred Hindu pilgrimage sites. The Dwarkadhish Temple, also known as Jagat Mandir, is dedicated to Lord Krishna and is a magnificent example of Chalukya-style architecture. The city is believed to be the ancient kingdom of Lord Krishna.',
    address: 'Dwarka, Devbhumi Dwarka District, Gujarat 361335',
    latitude: 22.2394,
    longitude: 68.9678,
    stateSlug: 'gujarat',
    districtSlug: 'dwarka',
    cityName: 'Dwarka',
    categorySlug: 'temples',
    tags: 'temple, pilgrimage, char dham, Lord Krishna, sacred, Gujarat',
    visitingHours: '6:00 AM – 1:00 PM, 5:00 PM – 9:30 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'November to February',
    visitDuration: '1–2 days',
    isFeatured: true,
    seoTitle: 'Dwarka — Dwarkadhish Temple & Char Dham | Gujarat',
    seoDescription: 'Explore Dwarka, the sacred Char Dham pilgrimage site in Gujarat. Visit the ancient Dwarkadhish Temple. Book your taxi with Radhe Krishna Cab.',
    featuredImage: '/images/destinations/dwarka.jpg',
  },
  {
    name: 'Rann of Kutch',
    slug: 'rann-of-kutch',
    shortDescription: 'The Great Rann of Kutch is the largest salt desert in the world, famous for the Rann Utsav festival, spanning across the Kutch district of Gujarat.',
    description: 'The Rann of Kutch is a seasonal salt marsh located in the Thar Desert in the Kutch District of Gujarat. It is part of the Indo-Pakistani border region. The Great Rann of Kutch is the world\'s largest salt desert. During the Rann Utsav (October to February), the white salt marsh is illuminated under the moonlight, creating a magical landscape that attracts visitors from around the world.',
    address: 'Rann of Kutch, Kutch District, Gujarat',
    latitude: 23.7337,
    longitude: 69.8597,
    stateSlug: 'gujarat',
    districtSlug: 'kutch',
    cityName: 'Bhuj',
    categorySlug: 'adventure',
    tags: 'salt desert, Rann Utsav, Kutch, Gujarat, festival, white desert',
    visitingHours: 'Open 24 hours during Rann Utsav (October–February)',
    entryFee: '₹100 per person (approximate)',
    bestTimeToVisit: 'November to February (Rann Utsav season)',
    visitDuration: '1–2 days',
    isFeatured: true,
    seoTitle: 'Rann of Kutch — White Salt Desert & Rann Utsav | Gujarat',
    seoDescription: 'Visit the Rann of Kutch, the world\'s largest salt desert in Gujarat. Experience the magical Rann Utsav. Book taxi with Radhe Krishna Cab.',
    featuredImage: '/images/destinations/rann-of-kutch.jpg',
  },
  {
    name: 'Saputara Hill Station',
    slug: 'saputara',
    shortDescription: 'Saputara is Gujarat\'s only hill station, nestled in the Sahyadri mountain range of the Dang district, offering scenic views and tribal culture.',
    description: 'Saputara, meaning "Abode of Serpents," is the only hill station in Gujarat, located in the Dang district at an elevation of about 1,000 metres in the Sahyadri mountain range (Western Ghats). It is known for its scenic beauty, pleasant climate, tribal culture, and the picturesque Saputara Lake. The hill station provides access to several waterfalls, nature parks, and trekking trails.',
    address: 'Saputara, Dang District, Gujarat 394720',
    latitude: 20.5789,
    longitude: 73.7440,
    stateSlug: 'gujarat',
    districtSlug: 'ahmedabad',
    cityName: 'Saputara',
    categorySlug: 'hill-stations',
    tags: 'hill station, Gujarat, Sahyadri, Western Ghats, tribal, lake, trekking',
    visitingHours: 'Open all day',
    entryFee: 'Free (individual attractions may charge)',
    bestTimeToVisit: 'June to February',
    visitDuration: '1–2 days',
    isFeatured: true,
    seoTitle: 'Saputara Hill Station — Gujarat\'s Only Hill Station',
    seoDescription: 'Explore Saputara, Gujarat\'s only hill station in the Dang district. Book your taxi from Surat, Ahmedabad with Radhe Krishna Cab.',
    featuredImage: '/images/destinations/saputara.jpg',
  },
  {
    name: 'India Gate',
    slug: 'india-gate-delhi',
    shortDescription: 'India Gate is a war memorial located astride the Rajpath (now Kartavya Path) in New Delhi, honouring over 70,000 soldiers of the British Indian Army who died in World War I.',
    description: 'India Gate is one of the most iconic landmarks of India and a prominent war memorial in New Delhi. Standing 42 metres tall, it was designed by Edwin Lutyens. The names of over 13,300 soldiers from the British Indian Army who died in the northwestern Frontier and Anglo-Afghan War are inscribed on its walls. The Amar Jawan Jyoti, a flame that burns perpetually, was added after Independence to honour soldiers who died in the 1971 Indo-Pakistani War.',
    address: 'Rajpath (Kartavya Path), New Delhi, Delhi 110001',
    latitude: 28.6129,
    longitude: 77.2295,
    stateSlug: 'delhi',
    districtSlug: null,
    cityName: 'New Delhi',
    categorySlug: 'historical',
    tags: 'war memorial, Delhi, landmark, Lutyens Delhi, monument, India Gate',
    visitingHours: 'Open 24 hours',
    entryFee: 'Free',
    bestTimeToVisit: 'October to March',
    visitDuration: '1–2 hours',
    isFeatured: true,
    seoTitle: 'India Gate New Delhi — War Memorial & Iconic Landmark',
    seoDescription: 'Visit India Gate in New Delhi, one of India\'s most iconic war memorials. Book outstation taxi with Radhe Krishna Cab.',
    featuredImage: null,
  },
  {
    name: 'Taj Mahal',
    slug: 'taj-mahal-agra',
    shortDescription: 'The Taj Mahal, a UNESCO World Heritage Site in Agra, is a white marble mausoleum built by Mughal Emperor Shah Jahan in memory of his wife Mumtaz Mahal.',
    description: 'The Taj Mahal is an ivory-white marble mausoleum on the south bank of the Yamuna river in Agra, Uttar Pradesh. It was commissioned in 1632 by the Mughal Emperor Shah Jahan to house the tomb of his favourite wife, Mumtaz Mahal. The tomb is the centrepiece of a 17-hectare complex that includes a mosque and a guest house. The Taj Mahal was designated as a UNESCO World Heritage Site in 1983.',
    address: 'Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh 282001',
    latitude: 27.1751,
    longitude: 78.0421,
    stateSlug: 'uttar-pradesh',
    districtSlug: null,
    cityName: 'Agra',
    categorySlug: 'historical',
    tags: 'UNESCO, Taj Mahal, Mughal, Agra, heritage, monument',
    visitingHours: 'Sunrise to Sunset (Closed on Fridays)',
    entryFee: '₹50 (Indian), ₹1100 (Foreign)',
    bestTimeToVisit: 'October to March',
    visitDuration: '2–3 hours',
    isFeatured: true,
    seoTitle: 'Taj Mahal Agra — UNESCO World Heritage Site | India Tourism',
    seoDescription: 'Visit the iconic Taj Mahal in Agra, Uttar Pradesh. Book your outstation taxi from any city with Radhe Krishna Cab.',
    featuredImage: null,
  },
]

async function main() {
  console.log('🌍 Seeding Explore India data...\n')

  // ── Categories ──────────────────────────────────────────────────────────
  console.log('Creating categories...')
  const categoryMap = {}
  for (const cat of CATEGORIES) {
    const c = await prisma.placeCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, displayOrder: cat.displayOrder },
      create: cat,
    })
    categoryMap[cat.slug] = c
  }
  console.log(`  ✓ ${CATEGORIES.length} categories`)

  // ── States ──────────────────────────────────────────────────────────────
  console.log('Creating Indian states & UTs...')
  const stateMap = {}
  for (const s of STATES) {
    const state = await prisma.indianState.upsert({
      where: { slug: s.slug },
      update: { name: s.name, code: s.code, region: s.region, capital: s.capital, latitude: s.latitude, longitude: s.longitude },
      create: { ...s, isActive: true },
    })
    stateMap[s.slug] = state
  }
  console.log(`  ✓ ${STATES.length} states/UTs`)

  // ── Gujarat Districts ────────────────────────────────────────────────────
  console.log('Creating Gujarat districts...')
  const gujaratState = stateMap['gujarat']
  const districtMap = {}
  for (const d of GUJARAT_DISTRICTS) {
    const dist = await prisma.indianDistrict.upsert({
      where: { stateId_slug: { stateId: gujaratState.id, slug: d.slug } },
      update: { name: d.name, latitude: d.latitude, longitude: d.longitude },
      create: { ...d, stateId: gujaratState.id, isActive: true },
    })
    districtMap[d.slug] = dist
  }
  console.log(`  ✓ ${GUJARAT_DISTRICTS.length} districts`)

  // ── Sample tourist places ────────────────────────────────────────────────
  console.log('Creating sample tourist places...')
  for (const p of SAMPLE_PLACES) {
    const stateRecord = stateMap[p.stateSlug]
    if (!stateRecord) { console.warn(`  ⚠ State not found: ${p.stateSlug}`); continue }
    const districtRecord = p.districtSlug ? districtMap[p.districtSlug] : null
    const categoryRecord = categoryMap[p.categorySlug]

    await prisma.touristPlace.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        shortDescription: p.shortDescription,
        description: p.description,
        address: p.address,
        latitude: p.latitude,
        longitude: p.longitude,
        stateId: stateRecord.id,
        districtId: districtRecord?.id ?? null,
        cityName: p.cityName,
        categoryId: categoryRecord?.id ?? null,
        tags: p.tags,
        visitingHours: p.visitingHours,
        entryFee: p.entryFee,
        bestTimeToVisit: p.bestTimeToVisit,
        visitDuration: p.visitDuration,
        isFeatured: p.isFeatured,
        status: 'PUBLISHED',
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        featuredImage: p.featuredImage ?? null,
      },
      create: {
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        description: p.description,
        address: p.address,
        latitude: p.latitude,
        longitude: p.longitude,
        stateId: stateRecord.id,
        districtId: districtRecord?.id ?? null,
        cityName: p.cityName,
        categoryId: categoryRecord?.id ?? null,
        tags: p.tags,
        visitingHours: p.visitingHours,
        entryFee: p.entryFee,
        bestTimeToVisit: p.bestTimeToVisit,
        visitDuration: p.visitDuration,
        isFeatured: p.isFeatured,
        status: 'PUBLISHED',
        seoTitle: p.seoTitle,
        seoDescription: p.seoDescription,
        featuredImage: p.featuredImage ?? null,
      },
    })
    console.log(`  ✓ ${p.name}`)
  }

  console.log('\n✅ Explore India seed complete!')
  console.log(`   States/UTs: ${STATES.length}`)
  console.log(`   Districts:  ${GUJARAT_DISTRICTS.length}`)
  console.log(`   Categories: ${CATEGORIES.length}`)
  console.log(`   Places:     ${SAMPLE_PLACES.length} (sample/dev data)`)
}

main()
  .catch(e => { console.error('❌ Error:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
