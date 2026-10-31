import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
const [cities, routes, prices, vehicles] = await Promise.all([
  p.city.count(),
  p.route.count(),
  p.routePrice.count(),
  p.vehicle.findMany({ select: { id: true, name: true, slug: true }, orderBy: { displayOrder: 'asc' } }),
])
console.log('Cities:', cities, '| Routes:', routes, '| Prices:', prices)
console.log('Vehicles:', JSON.stringify(vehicles, null, 2))
await p.$disconnect()
