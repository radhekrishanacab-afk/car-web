/**
 * Generates a sample CSV with all city pairs and fare estimates
 * Run: node scripts/generate-sample-csv.mjs
 * Output: routes-sample.csv (open in Excel)
 */
import { PrismaClient } from '@prisma/client'
import { writeFileSync } from 'fs'

const prisma = new PrismaClient()

// Distances from Ahmedabad (km)
const AHM_DISTANCES = {
  'abu': 230, 'ahmedabad': 0, 'ajmer': 520, 'alang': 215, 'ambaji': 175,
  'amreli': 245, 'anand': 75, 'ankleshwar': 160, 'bagasara': 295,
  'bagodara': 95, 'balasinor': 100, 'balotra': 490, 'bardoli': 220,
  'barmer': 650, 'bawla': 40, 'beawar': 550, 'bharuch': 165,
  'bhavnagar': 205, 'bhilwara': 600, 'bhuj': 340, 'bikaner': 680,
  'borsad': 80, 'botad': 165, 'chandigarh': 1300, 'chittorgarh': 570,
  'dahej': 170, 'dahod': 180, 'dakor': 90, 'daman': 250, 'deesa': 185,
  'delhi': 950, 'delvada': 270, 'dholka': 45, 'dhrangadhra': 185,
  'dwarka': 450, 'gandhinagar': 30, 'gandhidham': 355, 'godhra': 120,
  'gondal': 285, 'halol': 105, 'halvad': 210, 'himatnagar': 100,
  'idar': 130, 'jaipur': 665, 'jaisalmer': 830, 'jamnagar': 310,
  'jasdan': 270, 'jetpur': 290, 'jodhpur': 560, 'junagadh': 320,
  'kadi': 70, 'kalol': 45, 'kandla': 360, 'kapadvanj': 100, 'karjan': 140,
  'kathlal': 90, 'keshod': 360, 'khambhaliya': 375, 'khambhat': 100,
  'kheda': 65, 'kodinar': 340, 'kota': 595, 'kutch': 350, 'limdi': 205,
  'luni': 565, 'mahuva': 235, 'manavadar': 330, 'mandvi': 370,
  'mehsana': 80, 'modasa': 115, 'morbi': 260, 'mumbai-airport': 525,
  'mumbai-central': 530, 'mundra': 380, 'nadiad': 60, 'navsari': 250,
  'nizar': 185, 'okha': 480, 'palanpur': 155, 'palitana': 215,
  'pali': 490, 'patan': 120, 'porbandar': 390, 'pune': 680,
  'radhanpur': 210, 'rajkot': 245, 'rajsamand': 610, 'ranip': 15,
  'sachin': 235, 'sanand': 30, 'savarkundla': 280, 'sihor': 220,
  'sirohi': 260, 'somnath': 390, 'songadh': 290, 'surendranagar': 185,
  'surat': 265, 'talaja': 230, 'thane': 510, 'tharad': 250,
  'udaipur': 445, 'unjha': 110, 'una': 310, 'upleta': 295,
  'vadnagar': 105, 'vadodara': 115, 'vallabh-vidyanagar': 80,
  'valsad': 285, 'vapi': 270, 'veraval': 375, 'viramgam': 55,
  'visnagar': 95, 'vyara': 240, 'wadhwan': 195, 'wankaner': 265,
}

function getDistance(oSlug, dSlug) {
  const dO = AHM_DISTANCES[oSlug] ?? 200
  const dD = AHM_DISTANCES[dSlug] ?? 200
  if (oSlug === dSlug) return 0
  if (dO === 0) return dD
  if (dD === 0) return dO
  const diff = Math.abs(dO - dD)
  const minD = Math.min(dO, dD)
  return Math.max(Math.round((diff * 1.3 + minD * 0.2) / 5) * 5, 50)
}

function calcFare(km, perKm, minFare, minKm = 100) {
  return Math.ceil(Math.max(Math.max(km, minKm) * perKm, minFare) / 100) * 100
}

async function main() {
  const cities = await prisma.city.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } })
  const vehicles = [
    { name: 'Sedan (4+1)', perKm: 14, minFare: 1200, minKm: 100 },
    { name: 'SUV (6+1)',   perKm: 18, minFare: 1800, minKm: 100 },
    { name: 'SUV (7+1)',   perKm: 20, minFare: 2000, minKm: 100 },
    { name: 'Premium SUV', perKm: 24, minFare: 2500, minKm: 100 },
  ]

  const header = [
    'Origin City', 'Destination City', 'Distance KM', 'Estimated Hours',
    ...vehicles.map(v => `${v.name} Fare`),
  ].join(',')

  const rows = []
  for (const origin of cities) {
    for (const dest of cities) {
      if (origin.id === dest.id) continue
      const km = getDistance(origin.slug, dest.slug)
      const hrs = Math.round((km / 50) * 10) / 10
      const fares = vehicles.map(v => calcFare(km, v.perKm, v.minFare, v.minKm))
      rows.push([
        `"${origin.name}"`, `"${dest.name}"`, km, hrs, ...fares
      ].join(','))
    }
  }

  const csv = [header, ...rows].join('\n')
  writeFileSync('routes-sample.csv', csv, 'utf8')
  console.log(`✅ Generated routes-sample.csv`)
  console.log(`   Cities: ${cities.length}`)
  console.log(`   Routes: ${rows.length}`)
  console.log(`   File: d:\\car-web\\routes-sample.csv`)
  console.log(`\nOpen routes-sample.csv in Excel to view/edit all routes with fares.`)
}

main()
  .catch(e => { console.error('Error:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
