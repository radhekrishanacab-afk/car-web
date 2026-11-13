import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } })

function fare(km, rate, minF, minKm = 100) {
  return Math.ceil(Math.max(Math.max(km, minKm) * rate, minF) / 100) * 100
}

async function main() {
  const vehicles = await prisma.vehicle.findMany({ where: { isActive: true } })
  const routes   = await prisma.route.findMany({ select: { id: true, distanceKm: true } })

  console.log(`${routes.length} routes × ${vehicles.length} vehicles = ${routes.length * vehicles.length} prices`)
  console.log('Clearing old prices...')
  await prisma.routePrice.deleteMany({})
  console.log('Old prices cleared. Creating new prices in batches...')

  const BATCH = 1000
  let done = 0

  for (let i = 0; i < routes.length; i += 100) {
    const routeBatch = routes.slice(i, i + 100)
    const priceData = []

    for (const r of routeBatch) {
      const km = r.distanceKm ? Number(r.distanceKm) : 100
      for (const v of vehicles) {
        const ow = fare(km, Number(v.perKmRate), Number(v.minimumFare), v.minimumBillableKm ? Number(v.minimumBillableKm) : 100)
        const rt = Math.ceil(ow * Number(v.roundTripRateMultiplier) / 100) * 100
        priceData.push({ routeId: r.id, vehicleId: v.id, oneWayFare: ow, roundTrip: rt, isActive: true })
      }
    }

    await prisma.routePrice.createMany({ data: priceData, skipDuplicates: true })
    done += priceData.length
    process.stdout.write(`\r  ${done}/${routes.length * vehicles.length}`)
  }

  console.log(`\n\n✅ Done! Created ${done} prices`)
  console.log('\nVehicle rates:')
  vehicles.forEach(v => console.log(`  ${v.name}: ₹${Number(v.perKmRate)}/km`))
}

main()
  .catch(e => { console.error('\nError:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
