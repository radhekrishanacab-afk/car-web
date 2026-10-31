/**
 * Fast bulk price update using raw SQL — calibrated from bookonewaytaxi.in screenshot.
 *
 * Pricing rates (verified from Wankaner screenshot):
 *   Sedan (4+1):   ₹14.6/km, min ₹1400, min 80km billing
 *   SUV (6+1):     ₹18.5/km, min ₹1800, min 80km billing
 *   SUV (7+1):     ₹20.0/km, min ₹2000, min 80km billing
 *   Premium SUV:   ₹24.0/km, min ₹2500, min 80km billing
 */

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

function calcFare(distKm, perKm, minFare, minKm = 80) {
  const billable = Math.max(distKm, minKm)
  const raw = Math.max(billable * perKm, minFare)
  return Math.ceil(raw / 100) * 100
}

const RATES = {
  'sedan':       { perKm: 14.6, minFare: 1400, minKm: 80 },
  'suv-6':       { perKm: 18.5, minFare: 1800, minKm: 80 },
  'suv-7':       { perKm: 20.0, minFare: 2000, minKm: 80 },
  'premium-suv': { perKm: 24.0, minFare: 2500, minKm: 80 },
}

async function main() {
  console.log('🔄 Fast bulk price update...')

  const vehicles = await prisma.vehicle.findMany()
  const routes = await prisma.route.findMany({ select: { id: true, distanceKm: true } })

  console.log(`Vehicles: ${vehicles.length} | Routes: ${routes.length}`)

  // Update vehicle base rates
  for (const v of vehicles) {
    const rate = RATES[v.slug]
    if (rate) {
      await prisma.vehicle.update({
        where: { id: v.id },
        data: { perKmRate: rate.perKm, minimumFare: rate.minFare, minimumBillableKm: rate.minKm },
      })
    }
  }
  console.log('✓ Vehicle base rates updated')

  // Build bulk update arrays
  for (const v of vehicles) {
    const rate = RATES[v.slug]
    if (!rate) continue

    console.log(`  Updating prices for ${v.name}...`)

    // Process in chunks of 500
    const CHUNK = 500
    for (let i = 0; i < routes.length; i += CHUNK) {
      const chunk = routes.slice(i, i + CHUNK)

      // Use a transaction for speed
      await prisma.$transaction(
        chunk.map(route => {
          const dist = Number(route.distanceKm) || 150
          const oneWayFare = calcFare(dist, rate.perKm, rate.minFare, rate.minKm)
          const roundTrip = Math.ceil(oneWayFare * 1.9 / 100) * 100

          return prisma.routePrice.updateMany({
            where: { routeId: route.id, vehicleId: v.id },
            data: { oneWayFare, roundTrip, isActive: true },
          })
        })
      )

      if ((i + CHUNK) % 5000 === 0) {
        console.log(`    ${v.name}: ${i + CHUNK}/${routes.length} done`)
      }
    }
    console.log(`  ✓ ${v.name} complete`)
  }

  // Verify sample
  const sample = await prisma.route.findFirst({
    where: {
      originCity: { slug: 'wankaner' },
      destinationCity: { slug: 'wadhwan' },
    },
    include: {
      priceOverrides: { include: { vehicle: true } },
      originCity: true,
      destinationCity: true,
    },
  })

  if (sample) {
    console.log(`\n📋 Verification — Wankaner → Wadhwan (${sample.distanceKm}km):`)
    for (const p of sample.priceOverrides.sort((a, b) => a.vehicleId - b.vehicleId)) {
      console.log(`   ${p.vehicle.name}: ₹${p.oneWayFare}`)
    }
    console.log('   Expected: Sedan ₹1900, SUV(6+1) ₹2400, SUV(7+1) ₹2600, Premium ₹3200')
  }

  const ahm2srt = await prisma.route.findFirst({
    where: {
      originCity: { slug: 'ahmedabad' },
      destinationCity: { slug: 'surat' },
    },
    include: { priceOverrides: { include: { vehicle: true } } },
  })
  if (ahm2srt) {
    console.log(`\n📋 Verification — Ahmedabad → Surat (${ahm2srt.distanceKm}km):`)
    for (const p of ahm2srt.priceOverrides.sort((a, b) => a.vehicleId - b.vehicleId)) {
      console.log(`   ${p.vehicle.name}: ₹${p.oneWayFare}`)
    }
  }

  console.log('\n✅ All done!')
}

main()
  .catch(e => { console.error('❌', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
