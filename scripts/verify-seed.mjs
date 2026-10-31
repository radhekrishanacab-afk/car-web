import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

const [cities, routes, prices, vehicles] = await Promise.all([
  p.city.count(),
  p.route.count(),
  p.routePrice.count(),
  p.vehicle.count(),
])
console.log('✅ Cities:', cities)
console.log('✅ Routes:', routes)
console.log('✅ Route Prices:', prices)
console.log('✅ Vehicles:', vehicles)

const ahm = await p.city.findUnique({ where: { slug: 'ahmedabad' } })
if (ahm) {
  const ahmRoutes = await p.route.count({ where: { originCityId: ahm.id } })
  console.log('\nAhmedabad → (routes):', ahmRoutes)
}

// Show 5 sample routes with fares
const samples = await p.routePrice.findMany({
  take: 5,
  include: {
    route: { include: { originCity: true, destinationCity: true } },
    vehicle: true,
  },
  orderBy: { id: 'asc' },
})
console.log('\nSample routes:')
for (const s of samples) {
  console.log(
    ` ${s.route.originCity.name} → ${s.route.destinationCity.name}` +
    ` | ${s.route.distanceKm} km | ${s.vehicle.name} | ₹${s.oneWayFare}`
  )
}

await p.$disconnect()
