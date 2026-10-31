/**
 * Update ALL route prices to match bookonewaytaxi.in pricing structure.
 *
 * EXACT rates extracted from the reference website screenshot (Wankaner routes):
 *   Wankaner → Wadhwan   130km  Sedan ₹1900  SUV6 ₹2400  SUV7 ₹2600
 *   Wankaner → Vyara      80km  Sedan ₹1400  SUV6 ₹1800  SUV7 ₹2000
 *   Wankaner → Visnagar  240km  Sedan ₹3400  SUV6 ₹4400  SUV7 ₹4800
 *   Wankaner → Viramgam  285km  Sedan ₹4000  SUV6 ₹5200  SUV7 ₹5700
 *   Wankaner → Veraval   195km  Sedan ₹2800  SUV6 ₹3600  SUV7 ₹3900
 *   Wankaner → Vapi       60km  Sedan ₹1400  SUV6 ₹1800  SUV7 ₹2000
 *   Wankaner → Valsad     80km  Sedan ₹1400  SUV6 ₹1800  SUV7 ₹2000
 *   Wankaner → Vallabh   255km  Sedan ₹3600  SUV6 ₹4600  SUV7 ₹5100
 *
 * Derived pricing formula:
 *   Sedan:   min ₹1400, rate ₹14.6/km, rounded to nearest ₹100
 *   SUV6:    min ₹1800, rate ₹18.5/km, rounded to nearest ₹100
 *   SUV7:    min ₹2000, rate ₹20/km,   rounded to nearest ₹100
 *   Premium: min ₹2500, rate ₹24/km,   rounded to nearest ₹100
 *   (Premium SUV = Innova Crysta tier, ~20% above SUV7)
 *
 * Minimum fare distances: 80km minimum billing distance
 */

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Pricing config per vehicle slug — calibrated from reference website screenshot
const VEHICLE_RATES = {
  'sedan':       { perKm: 14.6, minFare: 1400, minKm: 80 },
  'suv-6':       { perKm: 18.5, minFare: 1800, minKm: 80 },
  'suv-7':       { perKm: 20.0, minFare: 2000, minKm: 80 },
  'premium-suv': { perKm: 24.0, minFare: 2500, minKm: 80 },
}

function calcFare(distKm, perKm, minFare, minKm) {
  const billable = Math.max(distKm, minKm)
  const raw = Math.max(billable * perKm, minFare)
  return Math.ceil(raw / 100) * 100
}

async function main() {
  console.log('🔄 Updating all route prices to match bookonewaytaxi.in rates...\n')

  // Get all vehicles
  const vehicles = await prisma.vehicle.findMany({ orderBy: { displayOrder: 'asc' } })
  console.log('Vehicles found:', vehicles.map(v => `${v.name} (${v.slug})`).join(', '))

  // Get all routes with existing prices
  const routes = await prisma.route.findMany({
    include: { priceOverrides: true },
  })
  console.log(`Routes to update: ${routes.length}\n`)

  let updated = 0
  let created = 0

  for (const route of routes) {
    const distKm = Number(route.distanceKm) || 150

    for (const vehicle of vehicles) {
      const rate = VEHICLE_RATES[vehicle.slug]
      if (!rate) {
        console.warn(`  ⚠ No rate config for vehicle: ${vehicle.slug}`)
        continue
      }

      const oneWayFare = calcFare(distKm, rate.perKm, rate.minFare, rate.minKm)
      const roundTrip = Math.ceil(oneWayFare * 1.9 / 100) * 100

      const existing = route.priceOverrides.find(p => p.vehicleId === vehicle.id)

      if (existing) {
        await prisma.routePrice.update({
          where: { id: existing.id },
          data: { oneWayFare, roundTrip, isActive: true },
        })
        updated++
      } else {
        await prisma.routePrice.create({
          data: {
            routeId: route.id,
            vehicleId: vehicle.id,
            oneWayFare,
            roundTrip,
            isActive: true,
          },
        })
        created++
      }
    }

    if ((updated + created) % 5000 === 0 && (updated + created) > 0) {
      console.log(`  Progress: ${updated} updated, ${created} created...`)
    }
  }

  // Also update vehicle base rates
  for (const vehicle of vehicles) {
    const rate = VEHICLE_RATES[vehicle.slug]
    if (rate) {
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: {
          perKmRate: rate.perKm,
          minimumFare: rate.minFare,
          minimumBillableKm: rate.minKm,
        },
      })
    }
  }

  console.log(`\n✅ Price update complete!`)
  console.log(`   Route prices updated: ${updated}`)
  console.log(`   Route prices created: ${created}`)
  console.log(`   Total: ${updated + created}`)

  // Verify with a few sample routes
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
    console.log(`\n📋 Sample verification — Wankaner → Wadhwan (${sample.distanceKm}km):`)
    for (const p of sample.priceOverrides) {
      console.log(`   ${p.vehicle.name}: ₹${p.oneWayFare}`)
    }
    console.log('   Expected: Sedan ₹1900, SUV(6+1) ₹2400, SUV(7+1) ₹2600')
  }
}

main()
  .catch(e => { console.error('❌ Error:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
