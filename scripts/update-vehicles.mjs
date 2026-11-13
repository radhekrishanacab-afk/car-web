/**
 * Updates existing vehicles with correct per-km rates and adds new ones
 * Swift Desire: ₹12/km, Ertiga: ₹14/km, Kia Carens: ₹17/km, Innova: ₹19/km, Innova Crysta: ₹21/km
 */
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const VEHICLES = [
  {
    name: 'Swift Desire',
    slug: 'swift-desire',
    description: 'Comfortable sedan perfect for small families. Fuel-efficient and reliable for intercity travel.',
    passengerCapacity: 4, luggageCapacity: 2,
    perKmRate: 12, minimumFare: 1200, minimumBillableKm: 100,
    roundTripRateMultiplier: 1.9, isActive: true, displayOrder: 1,
    imageUrl: '/images/vehicles/fleet-1-swift-desire.png',
  },
  {
    name: 'Ertiga',
    slug: 'ertiga',
    description: 'Spacious 6+1 seater MPV. Ideal for families with luggage. Smooth ride on highways.',
    passengerCapacity: 6, luggageCapacity: 3,
    perKmRate: 14, minimumFare: 1500, minimumBillableKm: 100,
    roundTripRateMultiplier: 1.9, isActive: true, displayOrder: 2,
    imageUrl: '/images/vehicles/fleet-3-maruti-suzuki-ertiga.png',
  },
  {
    name: 'Kia Carens',
    slug: 'kia-carens',
    description: 'Premium 6+1 seater with modern features. Best for group travel with style and comfort.',
    passengerCapacity: 6, luggageCapacity: 3,
    perKmRate: 17, minimumFare: 1800, minimumBillableKm: 100,
    roundTripRateMultiplier: 1.9, isActive: true, displayOrder: 3,
    imageUrl: '/images/vehicles/fleet-4-kia-carens.png',
  },
  {
    name: 'Innova',
    slug: 'innova',
    description: 'Toyota Innova — the most trusted name for outstation travel. Powerful engine, spacious cabin.',
    passengerCapacity: 7, luggageCapacity: 4,
    perKmRate: 19, minimumFare: 2000, minimumBillableKm: 100,
    roundTripRateMultiplier: 1.9, isActive: true, displayOrder: 4,
    imageUrl: '/images/vehicles/fleet-5-toyota-innova-crysta.png',
  },
  {
    name: 'Innova Crysta',
    slug: 'innova-crysta',
    description: 'Premium Toyota Innova Crysta with captain seats. The ultimate comfort for long outstation journeys.',
    passengerCapacity: 7, luggageCapacity: 4,
    perKmRate: 21, minimumFare: 2500, minimumBillableKm: 100,
    roundTripRateMultiplier: 1.9, isActive: true, displayOrder: 5,
    imageUrl: '/images/vehicles/fleet-5-toyota-innova-crysta.png',
  },
]

async function main() {
  console.log('Updating vehicles...\n')
  for (const v of VEHICLES) {
    const vehicle = await prisma.vehicle.upsert({
      where: { slug: v.slug },
      update: v,
      create: v,
    })
    console.log(`✓ ${vehicle.name} — ₹${v.perKmRate}/km, min fare ₹${v.minimumFare}`)
  }

  // Check old vehicles and deactivate if not in new list
  const oldSlugs = ['sedan', 'suv-6', 'suv-7', 'premium-suv']
  for (const slug of oldSlugs) {
    const old = await prisma.vehicle.findUnique({ where: { slug } })
    if (old) {
      await prisma.vehicle.update({ where: { slug }, data: { isActive: false } })
      console.log(`  ⚠️  Deactivated old vehicle: ${old.name}`)
    }
  }

  console.log('\n✅ Vehicles updated!')
  const all = await prisma.vehicle.findMany({ where: { isActive: true }, orderBy: { displayOrder: 'asc' } })
  console.log('\nActive vehicles:')
  all.forEach(v => console.log(`  ${v.displayOrder}. ${v.name} — ₹${Number(v.perKmRate)}/km`))
}

main()
  .catch(e => { console.error('Error:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
