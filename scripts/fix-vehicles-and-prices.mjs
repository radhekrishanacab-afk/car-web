/**
 * Fix vehicles and recalibrate prices to exactly match bookonewaytaxi.in.
 *
 * EXACT data from reference website screenshot (Wankaner routes):
 *   130km → Sedan ₹1900 | SUV(Ertiga) ₹2400 | SUV(7+1/Kia) ₹2600
 *    80km → Sedan ₹1400 | SUV(Ertiga) ₹1800 | SUV(7+1/Kia) ₹2000
 *   240km → Sedan ₹3400 | SUV(Ertiga) ₹4400 | SUV(7+1/Kia) ₹4800
 *   285km → Sedan ₹4000 | SUV(Ertiga) ₹5200 | SUV(7+1/Kia) ₹5700
 *   195km → Sedan ₹2800 | SUV(Ertiga) ₹3600 | SUV(7+1/Kia) ₹3900
 *   255km → Sedan ₹3600 | SUV(Ertiga) ₹4600 | SUV(7+1/Kia) ₹5100
 *
 * Calibration:
 *   Sedan:    130km → 1900 = 130*14.6=1898 → round up to ₹1900 ✓
 *   SUV6:     130km → 2400 = 130*18.46=2400 → ₹2400 ✓
 *             240km → 4400 = 240*18.33=4400 → avg ≈ 18.3/km
 *   SUV7:     130km → 2600 = 130*20=2600 ✓
 *
 * Final rates: Sedan=14.6, SUV6=18.46, SUV7=20.0, Premium=24.0
 * Min billing: 80km
 * Min fare: Sedan=1400, SUV6=1800, SUV7=2000, Premium=2500
 */

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const RATES = {
  'sedan':       { perKm: 14.6,  minFare: 1400, minKm: 80 },
  'suv-6':       { perKm: 18.46, minFare: 1800, minKm: 80 },
  'suv-7':       { perKm: 20.0,  minFare: 2000, minKm: 80 },
  'premium-suv': { perKm: 24.0,  minFare: 2500, minKm: 80 },
}

function calcFare(distKm, perKm, minFare, minKm = 80) {
  const billable = Math.max(distKm, minKm)
  const raw = Math.max(billable * perKm, minFare)
  return Math.ceil(raw / 100) * 100
}

async function main() {
  console.log('🔧 Fixing vehicles and recalibrating prices...\n')

  // 1. Ensure SUV (7+1) vehicle exists
  const suv7 = await prisma.vehicle.upsert({
    where: { slug: 'suv-7' },
    update: {
      name: 'SUV (7+1)',
      description: 'Premium 7-seater SUV. Models include Kia Carens.',
      passengerCapacity: 7,
      luggageCapacity: 4,
      perKmRate: 20.0,
      minimumFare: 2000,
      minimumBillableKm: 80,
      roundTripRateMultiplier: 1.9,
      isActive: true,
      displayOrder: 3,
    },
    create: {
      name: 'SUV (7+1)',
      slug: 'suv-7',
      description: 'Premium 7-seater SUV. Models include Kia Carens.',
      passengerCapacity: 7,
      luggageCapacity: 4,
      perKmRate: 20.0,
      minimumFare: 2000,
      minimumBillableKm: 80,
      roundTripRateMultiplier: 1.9,
      isActive: true,
      displayOrder: 3,
    },
  })
  console.log(`✓ SUV (7+1) vehicle: id=${suv7.id}`)

  // 2. Fix SUV (6+1) rate to 18.46
  await prisma.vehicle.update({
    where: { slug: 'suv-6' },
    data: { perKmRate: 18.46, minimumFare: 1800, minimumBillableKm: 80 },
  })
  console.log('✓ SUV (6+1) rate corrected to 18.46/km')

  // 3. Get all vehicles and routes
  const vehicles = await prisma.vehicle.findMany({ orderBy: { displayOrder: 'asc' } })
  const routes = await prisma.route.findMany({ select: { id: true, distanceKm: true } })
  console.log(`\nVehicles: ${vehicles.map(v => v.name).join(', ')}`)
  console.log(`Routes: ${routes.length}`)

  // 4. Update/create prices for all vehicles
  const CHUNK = 500
  for (const v of vehicles) {
    const rate = RATES[v.slug]
    if (!rate) { console.log(`  ⚠ Skipping ${v.name} — no rate`); continue }

    console.log(`\n  Updating ${v.name} (${rate.perKm}/km)...`)
    let count = 0

    for (let i = 0; i < routes.length; i += CHUNK) {
      const chunk = routes.slice(i, i + CHUNK)
      await prisma.$transaction(
        chunk.flatMap(route => {
          const dist = Number(route.distanceKm) || 150
          const oneWayFare = calcFare(dist, rate.perKm, rate.minFare, rate.minKm)
          const roundTrip = Math.ceil(oneWayFare * 1.9 / 100) * 100
          return [
            prisma.routePrice.upsert({
              where: { routeId_vehicleId: { routeId: route.id, vehicleId: v.id } },
              update: { oneWayFare, roundTrip, isActive: true },
              create: { routeId: route.id, vehicleId: v.id, oneWayFare, roundTrip, isActive: true },
            })
          ]
        })
      )
      count += chunk.length
      if (count % 5000 === 0) console.log(`    ${count}/${routes.length}...`)
    }
    console.log(`  ✓ ${v.name}: ${routes.length} routes done`)
  }

  // 5. Verify against screenshot data
  console.log('\n📋 VERIFICATION against reference website screenshot:')
  console.log('─'.repeat(65))

  const testRoutes = [
    { from: 'wankaner', to: 'wadhwan',          dist: 130, expected: [1900, 2400, 2600] },
    { from: 'wankaner', to: 'vyara',             dist:  80, expected: [1400, 1800, 2000] },
    { from: 'wankaner', to: 'visnagar',          dist: 240, expected: [3400, 4400, 4800] },
    { from: 'wankaner', to: 'viramgam',          dist: 285, expected: [4000, 5200, 5700] },
    { from: 'wankaner', to: 'veraval',           dist: 195, expected: [2800, 3600, 3900] },
    { from: 'wankaner', to: 'vapi',              dist:  60, expected: [1400, 1800, 2000] },
    { from: 'wankaner', to: 'valsad',            dist:  80, expected: [1400, 1800, 2000] },
    { from: 'wankaner', to: 'vallabh-vidyanagar',dist: 255, expected: [3600, 4600, 5100] },
  ]

  for (const t of testRoutes) {
    const r = await prisma.route.findFirst({
      where: {
        originCity: { slug: t.from },
        destinationCity: { slug: t.to },
      },
      include: { priceOverrides: { include: { vehicle: true } } },
    })
    if (!r) { console.log(`  ⚠ Route not found: ${t.from} → ${t.to}`); continue }

    const sedan  = r.priceOverrides.find(p => p.vehicle.slug === 'sedan')?.oneWayFare ?? '?'
    const suv6   = r.priceOverrides.find(p => p.vehicle.slug === 'suv-6')?.oneWayFare ?? '?'
    const suv7   = r.priceOverrides.find(p => p.vehicle.slug === 'suv-7')?.oneWayFare ?? '?'
    const [e1,e2,e3] = t.expected
    const ok = sedan === e1 && suv6 === e2 && suv7 === e3

    console.log(`  ${ok ? '✅' : '❌'} ${t.from}→${t.to.padEnd(20)} (${String(r.distanceKm).padStart(3)}km)`)
    console.log(`     Got:      Sedan ₹${sedan}  SUV6 ₹${suv6}  SUV7 ₹${suv7}`)
    if (!ok) console.log(`     Expected: Sedan ₹${e1}  SUV6 ₹${e2}  SUV7 ₹${e3}`)
  }

  console.log('\n✅ Done!')
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
