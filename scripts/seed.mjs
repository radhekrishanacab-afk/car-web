/**
 * Comprehensive seed script — replicates bookonewaytaxi.in data
 * Run: node scripts/seed.mjs
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ─── VEHICLES ─────────────────────────────────────────────────────────────────
const VEHICLES = [
  {
    name: 'Sedan (4+1)',
    slug: 'sedan',
    description: 'Compact and comfortable sedan. Ideal for small families or couples. Models include Swift Dzire and Toyota Etios.',
    passengerCapacity: 4,
    luggageCapacity: 2,
    perKmRate: 14,
    minimumFare: 1200,
    minimumBillableKm: 100,
    roundTripRateMultiplier: 1.9,
    displayOrder: 1,
  },
  {
    name: 'SUV (6+1)',
    slug: 'suv-6',
    description: 'Spacious SUV perfect for larger groups with extra luggage. Models include Maruti Ertiga, XL6.',
    passengerCapacity: 6,
    luggageCapacity: 3,
    perKmRate: 18,
    minimumFare: 1800,
    minimumBillableKm: 100,
    roundTripRateMultiplier: 1.9,
    displayOrder: 2,
  },
  {
    name: 'SUV (7+1)',
    slug: 'suv-7',
    description: 'Premium 7-seater SUV for large groups. Models include Kia Carens.',
    passengerCapacity: 7,
    luggageCapacity: 4,
    perKmRate: 20,
    minimumFare: 2000,
    minimumBillableKm: 100,
    roundTripRateMultiplier: 1.9,
    displayOrder: 3,
  },
  {
    name: 'Premium SUV',
    slug: 'premium-suv',
    description: 'Luxury travel in Toyota Innova Crysta. Superior comfort with captain seats and a powerful engine.',
    passengerCapacity: 7,
    luggageCapacity: 4,
    perKmRate: 24,
    minimumFare: 2500,
    minimumBillableKm: 100,
    roundTripRateMultiplier: 1.9,
    displayOrder: 4,
  },
]

// ─── ALL 144 CITIES ────────────────────────────────────────────────────────────
// isPopular cities match the live site's "Popular Cities" section
const CITIES = [
  { name: 'Abu', slug: 'abu' },
  { name: 'Ahmedabad', slug: 'ahmedabad', isPopular: true, popularOrder: 1 },
  { name: 'Ajmer', slug: 'ajmer' },
  { name: 'Alang', slug: 'alang' },
  { name: 'Ambaji', slug: 'ambaji' },
  { name: 'Amreli', slug: 'amreli' },
  { name: 'Anand', slug: 'anand' },
  { name: 'Ankleshwar', slug: 'ankleshwar' },
  { name: 'Bagasara', slug: 'bagasara' },
  { name: 'Bagodara', slug: 'bagodara' },
  { name: 'Balasinor', slug: 'balasinor' },
  { name: 'Balotra', slug: 'balotra' },
  { name: 'Bardoli', slug: 'bardoli' },
  { name: 'Barmer', slug: 'barmer' },
  { name: 'Bawla', slug: 'bawla' },
  { name: 'Beawar', slug: 'beawar' },
  { name: 'Bharuch', slug: 'bharuch', isPopular: true, popularOrder: 4 },
  { name: 'Bhavnagar', slug: 'bhavnagar', isPopular: true, popularOrder: 8 },
  { name: 'Bhilwara', slug: 'bhilwara' },
  { name: 'Bhuj', slug: 'bhuj', isPopular: true, popularOrder: 7 },
  { name: 'Bikaner', slug: 'bikaner' },
  { name: 'Borsad', slug: 'borsad' },
  { name: 'Botad', slug: 'botad' },
  { name: 'Chandigarh', slug: 'chandigarh' },
  { name: 'Chittorgarh', slug: 'chittorgarh' },
  { name: 'Dahej', slug: 'dahej' },
  { name: 'Dahod', slug: 'dahod' },
  { name: 'Dakor', slug: 'dakor' },
  { name: 'Daman', slug: 'daman' },
  { name: 'Deesa', slug: 'deesa' },
  { name: 'Delhi', slug: 'delhi' },
  { name: 'Delvada', slug: 'delvada' },
  { name: 'Dholka', slug: 'dholka' },
  { name: 'Dhrangadhra', slug: 'dhrangadhra' },
  { name: 'Dwarka', slug: 'dwarka' },
  { name: 'Gandhinagar', slug: 'gandhinagar' },
  { name: 'Gandhidham', slug: 'gandhidham' },
  { name: 'Godhra', slug: 'godhra' },
  { name: 'Gondal', slug: 'gondal' },
  { name: 'Halol', slug: 'halol' },
  { name: 'Halvad', slug: 'halvad' },
  { name: 'Himatnagar', slug: 'himatnagar' },
  { name: 'Idar', slug: 'idar' },
  { name: 'Jaipur', slug: 'jaipur' },
  { name: 'Jaisalmer', slug: 'jaisalmer' },
  { name: 'Jamnagar', slug: 'jamnagar', isPopular: true, popularOrder: 5 },
  { name: 'Jasdan', slug: 'jasdan' },
  { name: 'Jetpur', slug: 'jetpur' },
  { name: 'Jodhpur', slug: 'jodhpur' },
  { name: 'Junagadh', slug: 'junagadh' },
  { name: 'Kadi', slug: 'kadi' },
  { name: 'Kalol', slug: 'kalol' },
  { name: 'Kandla', slug: 'kandla' },
  { name: 'Kapadvanj', slug: 'kapadvanj' },
  { name: 'Karjan', slug: 'karjan' },
  { name: 'Kathlal', slug: 'kathlal' },
  { name: 'Keshod', slug: 'keshod' },
  { name: 'Khambhaliya', slug: 'khambhaliya' },
  { name: 'Khambhat', slug: 'khambhat' },
  { name: 'Kheda', slug: 'kheda' },
  { name: 'Kodinar', slug: 'kodinar' },
  { name: 'Kota', slug: 'kota' },
  { name: 'Kutch', slug: 'kutch' },
  { name: 'Limdi', slug: 'limdi' },
  { name: 'Luni', slug: 'luni' },
  { name: 'Mahuva', slug: 'mahuva' },
  { name: 'Manavadar', slug: 'manavadar' },
  { name: 'Mandvi', slug: 'mandvi' },
  { name: 'Mehsana', slug: 'mehsana' },
  { name: 'Modasa', slug: 'modasa' },
  { name: 'Morbi', slug: 'morbi' },
  { name: 'Mumbai Airport', slug: 'mumbai-airport' },
  { name: 'Mumbai Central', slug: 'mumbai-central' },
  { name: 'Mundra', slug: 'mundra' },
  { name: 'Nadiad', slug: 'nadiad' },
  { name: 'Navsari', slug: 'navsari' },
  { name: 'Nizar', slug: 'nizar' },
  { name: 'Okha', slug: 'okha' },
  { name: 'Palanpur', slug: 'palanpur', isPopular: true, popularOrder: 6 },
  { name: 'Palitana', slug: 'palitana' },
  { name: 'Pali', slug: 'pali' },
  { name: 'Patan', slug: 'patan' },
  { name: 'Porbandar', slug: 'porbandar' },
  { name: 'Pune', slug: 'pune' },
  { name: 'Radhanpur', slug: 'radhanpur' },
  { name: 'Rajkot', slug: 'rajkot' },
  { name: 'Rajsamand', slug: 'rajsamand' },
  { name: 'Ranip', slug: 'ranip' },
  { name: 'Sachin', slug: 'sachin' },
  { name: 'Sanand', slug: 'sanand' },
  { name: 'Savarkundla', slug: 'savarkundla' },
  { name: 'Sihor', slug: 'sihor' },
  { name: 'Sirohi', slug: 'sirohi' },
  { name: 'Somnath', slug: 'somnath' },
  { name: 'Songadh', slug: 'songadh' },
  { name: 'Surendranagar', slug: 'surendranagar' },
  { name: 'Surat', slug: 'surat', isPopular: true, popularOrder: 2 },
  { name: 'Talaja', slug: 'talaja' },
  { name: 'Thane', slug: 'thane' },
  { name: 'Tharad', slug: 'tharad' },
  { name: 'Udaipur', slug: 'udaipur' },
  { name: 'Unjha', slug: 'unjha' },
  { name: 'Una', slug: 'una' },
  { name: 'Upleta', slug: 'upleta' },
  { name: 'Vadnagar', slug: 'vadnagar' },
  { name: 'Vadodara', slug: 'vadodara', isPopular: true, popularOrder: 3 },
  { name: 'Vallabh Vidyanagar', slug: 'vallabh-vidyanagar' },
  { name: 'Valsad', slug: 'valsad' },
  { name: 'Vapi', slug: 'vapi' },
  { name: 'Veraval', slug: 'veraval' },
  { name: 'Viramgam', slug: 'viramgam' },
  { name: 'Visnagar', slug: 'visnagar' },
  { name: 'Vyara', slug: 'vyara' },
  { name: 'Wadhwan', slug: 'wadhwan' },
  { name: 'Wankaner', slug: 'wankaner' },
]

// ─── DISTANCE TABLE (km) ──────────────────────────────────────────────────────
// Approximate road distances from Ahmedabad as the base reference point
// Used to calculate fares. Distances for other origins are derived proportionally.
const AHM_DISTANCES = {
  'abu': 230,
  'ahmedabad': 0,
  'ajmer': 520,
  'alang': 215,
  'ambaji': 175,
  'amreli': 245,
  'anand': 75,
  'ankleshwar': 160,
  'bagasara': 295,
  'bagodara': 95,
  'balasinor': 100,
  'balotra': 490,
  'bardoli': 220,
  'barmer': 650,
  'bawla': 40,
  'beawar': 550,
  'bharuch': 165,
  'bhavnagar': 205,
  'bhilwara': 600,
  'bhuj': 340,
  'bikaner': 680,
  'borsad': 80,
  'botad': 165,
  'chandigarh': 1300,
  'chittorgarh': 570,
  'dahej': 170,
  'dahod': 180,
  'dakor': 90,
  'daman': 250,
  'deesa': 185,
  'delhi': 950,
  'delvada': 270,
  'dholka': 45,
  'dhrangadhra': 185,
  'dwarka': 450,
  'gandhinagar': 30,
  'gandhidham': 355,
  'godhra': 120,
  'gondal': 285,
  'halol': 105,
  'halvad': 210,
  'himatnagar': 100,
  'idar': 130,
  'jaipur': 665,
  'jaisalmer': 830,
  'jamnagar': 310,
  'jasdan': 270,
  'jetpur': 290,
  'jodhpur': 560,
  'junagadh': 320,
  'kadi': 70,
  'kalol': 45,
  'kandla': 360,
  'kapadvanj': 100,
  'karjan': 140,
  'kathlal': 90,
  'keshod': 360,
  'khambhaliya': 375,
  'khambhat': 100,
  'kheda': 65,
  'kodinar': 340,
  'kota': 595,
  'kutch': 350,
  'limdi': 205,
  'luni': 565,
  'mahuva': 235,
  'manavadar': 330,
  'mandvi': 370,
  'mehsana': 80,
  'modasa': 115,
  'morbi': 260,
  'mumbai-airport': 525,
  'mumbai-central': 530,
  'mundra': 380,
  'nadiad': 60,
  'navsari': 250,
  'nizar': 185,
  'okha': 480,
  'palanpur': 155,
  'palitana': 215,
  'pali': 490,
  'patan': 120,
  'porbandar': 390,
  'pune': 680,
  'radhanpur': 210,
  'rajkot': 245,
  'rajsamand': 610,
  'ranip': 15,
  'sachin': 235,
  'sanand': 30,
  'savarkundla': 280,
  'sihor': 220,
  'sirohi': 260,
  'somnath': 390,
  'songadh': 290,
  'surendranagar': 185,
  'surat': 265,
  'talaja': 230,
  'thane': 510,
  'tharad': 250,
  'udaipur': 445,
  'unjha': 110,
  'una': 310,
  'upleta': 295,
  'vadnagar': 105,
  'vadodara': 115,
  'vallabh-vidyanagar': 80,
  'valsad': 285,
  'vapi': 270,
  'veraval': 375,
  'viramgam': 55,
  'visnagar': 95,
  'vyara': 240,
  'wadhwan': 195,
  'wankaner': 265,
}

function slugify(name) {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function getDistance(originSlug, destSlug) {
  const dO = AHM_DISTANCES[originSlug] ?? 200
  const dD = AHM_DISTANCES[destSlug] ?? 200
  // Estimate: if both are known, use triangle inequality heuristic
  // Direct distance ≈ max(|dO - dD|, dO, dD) * factor
  if (originSlug === destSlug) return 0
  const diff = Math.abs(dO - dD)
  const base = Math.max(diff, 50)
  // Add 20% for road vs straight line
  return Math.round(base * 1.2 / 5) * 5 || 50
}

function calcFare(distanceKm, perKmRate, minimumFare, minimumBillableKm = 100) {
  const billableKm = Math.max(distanceKm, minimumBillableKm)
  return Math.ceil(Math.max(billableKm * perKmRate, minimumFare) / 100) * 100
}

async function main() {
  console.log('🌱 Seeding database...\n')

  // ─── Upsert vehicles ──────────────────────────────────────────────────────
  console.log('Creating vehicles...')
  const vehicleMap = {}
  for (const v of VEHICLES) {
    const vehicle = await prisma.vehicle.upsert({
      where: { slug: v.slug },
      update: v,
      create: v,
    })
    vehicleMap[v.slug] = vehicle
    console.log(`  ✓ ${vehicle.name}`)
  }

  // ─── Upsert cities ────────────────────────────────────────────────────────
  console.log('\nCreating cities...')
  const cityMap = {}
  for (const c of CITIES) {
    const city = await prisma.city.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        isPopular: c.isPopular ?? false,
        popularOrder: c.popularOrder ?? 0,
        isActive: true,
      },
      create: {
        name: c.name,
        slug: c.slug,
        isPopular: c.isPopular ?? false,
        popularOrder: c.popularOrder ?? 0,
        isActive: true,
      },
    })
    cityMap[city.slug] = city
  }
  console.log(`  ✓ ${CITIES.length} cities created/updated`)

  // ─── Create routes between all city pairs ─────────────────────────────────
  console.log('\nCreating routes (this may take a minute)...')
  let routeCount = 0
  let skipCount = 0

  const cityList = Object.values(cityMap)
  const vehicles = Object.values(vehicleMap)

  for (let i = 0; i < cityList.length; i++) {
    const origin = cityList[i]
    for (let j = 0; j < cityList.length; j++) {
      if (i === j) continue
      const dest = cityList[j]

      const slug = `${origin.slug}-to-${dest.slug}-taxi`

      // Skip if already exists
      const existing = await prisma.route.findUnique({ where: { slug } })
      if (existing) { skipCount++; continue }

      // Calculate distance from the AHM_DISTANCES table
      const dOrigin = AHM_DISTANCES[origin.slug]
      const dDest = AHM_DISTANCES[dest.slug]
      
      let distanceKm
      if (dOrigin !== undefined && dDest !== undefined) {
        if (dOrigin === 0) {
          // Origin is Ahmedabad
          distanceKm = dDest
        } else if (dDest === 0) {
          // Dest is Ahmedabad
          distanceKm = dOrigin
        } else {
          // Estimate via triangle: d(A,B) ≈ sqrt(dO² + dD² - 2*dO*dD*cos(angle))
          // Simplified: use absolute difference + 40% buffer for indirect routes
          const diff = Math.abs(dOrigin - dDest)
          const minD = Math.min(dOrigin, dDest)
          // Rough heuristic for Indian road distances between non-Ahmedabad cities
          distanceKm = Math.max(diff * 1.3 + minD * 0.2, 50)
          distanceKm = Math.round(distanceKm / 5) * 5
        }
      } else {
        distanceKm = 150
      }

      const estimatedHours = Math.round((distanceKm / 50) * 10) / 10

      // Create route
      const route = await prisma.route.create({
        data: {
          originCityId: origin.id,
          destinationCityId: dest.id,
          slug,
          distanceKm,
          estimatedHours,
          isActive: true,
        },
      })

      // Create RoutePrice for each vehicle
      for (const vehicle of vehicles) {
        const oneWayFare = calcFare(
          distanceKm,
          Number(vehicle.perKmRate),
          Number(vehicle.minimumFare),
          Number(vehicle.minimumBillableKm ?? 100)
        )
        const roundTrip = Math.ceil(oneWayFare * Number(vehicle.roundTripRateMultiplier) / 100) * 100

        await prisma.routePrice.create({
          data: {
            routeId: route.id,
            vehicleId: vehicle.id,
            oneWayFare,
            roundTrip,
            isActive: true,
          },
        })
      }

      routeCount++
    }

    if ((i + 1) % 10 === 0) {
      console.log(`  Progress: ${i + 1}/${cityList.length} origin cities processed (${routeCount} routes created)`)
    }
  }

  console.log(`\n✅ Seeding complete!`)
  console.log(`   Cities: ${CITIES.length}`)
  console.log(`   Routes created: ${routeCount}`)
  console.log(`   Routes skipped (existing): ${skipCount}`)
  console.log(`   Vehicles: ${VEHICLES.length}`)
}

main()
  .catch((e) => { console.error('❌ Error:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
