import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()
const [total, active, withDist, withFare, cities, blogs, places, thinRoutes] = await Promise.all([
  p.route.count(),
  p.route.count({ where: { isActive: true } }),
  p.route.count({ where: { isActive: true, distanceKm: { not: null } } }),
  p.route.count({ where: { isActive: true, priceOverrides: { some: { isActive: true } } } }),
  p.city.count({ where: { isActive: true } }),
  p.blogPost.count({ where: { status: 'PUBLISHED' } }),
  p.touristPlace.count({ where: { status: 'PUBLISHED' } }),
  p.route.count({ where: { isActive: true, distanceKm: null, description: null, priceOverrides: { none: { isActive: true } } } }),
])
console.log(JSON.stringify({ total, active, withDist, withFare, cities, blogs, places, thinRoutes }))
await p.$disconnect()
